import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { answerCallbackQuery, editMessageCaption } from '@/lib/telegram'
import { getTelegramConfig } from '@/lib/notifications'

export async function POST(request: NextRequest) {
    try {
        const update = await request.json()
        
        // Handle callback query (inline button press)
        if (update.callback_query) {
            const callbackQuery = update.callback_query
            const callbackData = callbackQuery.data
            const messageId = callbackQuery.message?.message_id
            const chatId = callbackQuery.message?.chat?.id
            
            // Parse callback data which could be in format 'action_id' or JSON format
            let action, confirmationId;

            // Check if callbackData is in JSON format (for manual confirmation)
            if (callbackData.startsWith('{')) {
                try {
                    // Replace triple single quotes with proper quotes for JSON parsing
                    const jsonString = callbackData.replace(/'''/g, '"');
                    const parsedData = JSON.parse(jsonString);

                    if (parsedData.action === 'accept_order') {
                        action = 'approve';
                    } else if (parsedData.action === 'reject_order') {
                        action = 'reject';
                    } else {
                        throw new Error('Invalid action in JSON format');
                    }

                    confirmationId = parseInt(parsedData.order_id);
                } catch (e) {
                    console.error('Error parsing JSON callback data:', e);
                    await answerCallbackQuery(
                        process.env.TELEGRAM_BOT_TOKEN || '',
                        callbackQuery.id,
                        'Invalid callback data format',
                        true
                    );
                    return NextResponse.json({ ok: true });
                }
            } else {
                // Original format: approve_123 or reject_123
                const parts = callbackData.split('_');
                if (parts.length < 2) {
                    await answerCallbackQuery(
                        process.env.TELEGRAM_BOT_TOKEN || '',
                        callbackQuery.id,
                        'Invalid callback data format',
                        true
                    );
                    return NextResponse.json({ ok: true });
                }

                action = parts[0];
                const confirmationIdStr = parts.slice(1).join('_'); // Handle IDs with underscores
                confirmationId = parseInt(confirmationIdStr);
            }

            if (!confirmationId || !['approve', 'reject'].includes(action)) {
                await answerCallbackQuery(
                    process.env.TELEGRAM_BOT_TOKEN || '',
                    callbackQuery.id,
                    'Invalid action',
                    true
                )
                return NextResponse.json({ ok: true })
            }
            
            const supabase = await createClient()
            const config = await getTelegramConfig()

            // Determine if this is a QRIS confirmation or a manual order confirmation
            const isQrisConfirmation = !callbackData.startsWith('{');

            let orderData: any = null;
            let confirmationData: any = null;
            let statusToUpdate: string | null = null;

            if (isQrisConfirmation) {
                // Handle QRIS confirmation (original behavior)

                // Get confirmation details
                const { data: confirmation } = await supabase
                    .from('qris_confirmations')
                    .select('*')
                    .eq('id', confirmationId)
                    .single()

                if (!confirmation) {
                    await answerCallbackQuery(
                        config.botToken,
                        callbackQuery.id,
                        'Konfirmasi tidak ditemukan',
                        true
                    )
                    return NextResponse.json({ ok: true })
                }

                if (confirmation.status !== 'pending') {
                    await answerCallbackQuery(
                        config.botToken,
                        callbackQuery.id,
                        `Konfirmasi sudah ${confirmation.status === 'approved' ? 'disetujui' : 'ditolak'}`,
                        true
                    )
                    return NextResponse.json({ ok: true })
                }

                confirmationData = confirmation;
                statusToUpdate = action === 'approve' ? 'approved' : 'rejected';

            } else {
                // Handle manual order confirmation (from manualConfirmation template)

                // Get order details
                const { data: order } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', confirmationId) // Using confirmationId as order ID in this case
                    .single()

                if (!order) {
                    await answerCallbackQuery(
                        config.botToken,
                        callbackQuery.id,
                        'Pesanan tidak ditemukan',
                        true
                    )
                    return NextResponse.json({ ok: true })
                }

                if (order.status !== 'pending') {
                    await answerCallbackQuery(
                        config.botToken,
                        callbackQuery.id,
                        `Pesanan sudah ${order.status === 'paid' ? 'dikonfirmasi' : 'ditolak'}`,
                        true
                    )
                    return NextResponse.json({ ok: true })
                }

                orderData = order;
                statusToUpdate = action === 'approve' ? 'paid' : 'cancelled';
            }

            if (!statusToUpdate) {
                await answerCallbackQuery(
                    config.botToken,
                    callbackQuery.id,
                    'Status tidak valid',
                    true
                )
                return NextResponse.json({ ok: true })
            }

            const statusLabel = statusToUpdate === 'approved' || statusToUpdate === 'paid' ? 'DISETUJUI ✅' : 'DITOLAK ❌'

            // Update the appropriate table based on confirmation type
            if (isQrisConfirmation) {
                // Update confirmation status in qris_confirmations table
                const updateData: Record<string, unknown> = {
                    status: statusToUpdate,
                    admin_notes: `Dikonfirmasi via Telegram`,
                    updated_at: new Date().toISOString(),
                }

                // If approved, update order status and send email
                if (statusToUpdate === 'approved') {
                    // Update order status
                    if (confirmationData.order_number) {
                        await supabase
                            .from('orders')
                            .update({ status: 'paid' })
                            .eq('order_number', confirmationData.order_number)
                    } else if (confirmationData.order_id) {
                        await supabase
                            .from('orders')
                            .update({ status: 'paid' })
                            .eq('id', confirmationData.order_id)
                    }

                    // Get download links
                    const downloadLinks: { title: string; url: string }[] = []

                    if (confirmationData.order_id) {
                        const { data: orderItems } = await supabase
                            .from('order_items')
                            .select('product_id, product_title, products(download_url, title)')
                            .eq('order_id', confirmationData.order_id)

                        if (orderItems && orderItems.length > 0) {
                            for (const item of orderItems) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const product = item.products as any
                                if (product?.download_url) {
                                downloadLinks.push({
                                    title: item.product_title || product.title || 'Template',
                                    url: product.download_url
                                })
                            }
                        }
                    }
                }
                
                if (downloadLinks.length === 0 && confirmationData.order_number) {
                    const { data: order } = await supabase
                        .from('orders')
                        .select('id, notes, product_id')
                        .eq('order_number', confirmationData.order_number)
                        .single()
                    
                    if (order) {
                        const { data: orderItems } = await supabase
                            .from('order_items')
                            .select('product_id, product_title, products(download_url, title)')
                            .eq('order_id', order.id)
                        
                        if (orderItems && orderItems.length > 0) {
                            for (const item of orderItems) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const product = item.products as any
                                if (product?.download_url) {
                                    downloadLinks.push({
                                        title: item.product_title || product.title || 'Template',
                                        url: product.download_url
                                    })
                                }
                            }
                        }
                        
                        if (downloadLinks.length === 0 && order.notes) {
                            try {
                                const items = JSON.parse(order.notes) as Array<{ productId: string; productTitle: string }>
                                for (const item of items) {
                                    if (item.productId) {
                                        const { data: product } = await supabase
                                            .from('products')
                                            .select('download_url, title')
                                            .eq('id', parseInt(item.productId))
                                            .single()
                                        
                                        if (product?.download_url) {
                                            downloadLinks.push({
                                                title: item.productTitle || product.title || 'Template',
                                                url: product.download_url
                                            })
                                        }
                                    }
                                }
                            } catch (e) {
                                console.error('Error parsing notes:', e)
                            }
                        }
                        
                        if (downloadLinks.length === 0 && order.product_id) {
                            const { data: product } = await supabase
                                .from('products')
                                .select('download_url, title')
                                .eq('id', order.product_id)
                                .single()
                            
                            if (product?.download_url) {
                                downloadLinks.push({
                                    title: product.title || 'Template',
                                    url: product.download_url
                                })
                            }
                        }
                    }
                }
                
                // Send email
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rsquareidea.my.id'
                    await fetch(`${baseUrl}/api/send-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: confirmationData.customer_email,
                            customerName: confirmationData.customer_name,
                            orderNumber: confirmationData.order_number,
                            totalAmount: confirmationData.amount,
                            downloadLinks,
                        }),
                    })
                } catch (emailError) {
                    console.error('Error sending email:', emailError)
                }
            }

            // Update the Telegram message to show the result
            const updatedCaption = `📱 <b>Konfirmasi Pembayaran</b>

👤 Nama: ${confirmationData.customer_name}
📧 Email: ${confirmationData.customer_email}
📦 Pesanan: ${confirmationData.order_number}
💰 Jumlah: Rp ${Number(confirmationData.amount).toLocaleString('id-ID')}

<b>Status: ${statusLabel}</b>
🕐 ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`

            await editMessageCaption(
                { botToken: config.botToken, chatId: chatId?.toString() || config.chatId },
                messageId,
                updatedCaption
            )
        } else {
            // Handle manual order confirmation

            // Update order status in orders table
            const updateData: Record<string, unknown> = {
                status: statusToUpdate,
                updated_at: new Date().toISOString(),
            }

            const { error: updateError } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', confirmationId)

            if (updateError) {
                await answerCallbackQuery(
                    config.botToken,
                    callbackQuery.id,
                    'Gagal mengupdate status pesanan',
                    true
                )
                return NextResponse.json({ ok: true })
            }

            // If approved, send email with download links
            if (statusToUpdate === 'paid') {
                const downloadLinks: { title: string; url: string }[] = []

                // Get order items
                const { data: orderItems } = await supabase
                    .from('order_items')
                    .select('product_id, product_title, products(download_url, title)')
                    .eq('order_id', confirmationId)

                if (orderItems && orderItems.length > 0) {
                    for (const item of orderItems) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const product = item.products as any
                        if (product?.download_url) {
                            downloadLinks.push({
                                title: item.product_title || product.title || 'Template',
                                url: product.download_url
                            })
                        }
                    }
                }

                if (downloadLinks.length === 0 && orderData.product_id) {
                    const { data: product } = await supabase
                        .from('products')
                        .select('download_url, title')
                        .eq('id', orderData.product_id)
                        .single()

                    if (product?.download_url) {
                        downloadLinks.push({
                            title: product.title || 'Template',
                            url: product.download_url
                        })
                    }
                }

                // Send email
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rsquareidea.my.id'
                    await fetch(`${baseUrl}/api/send-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: orderData.email || orderData.customer_email,
                            customerName: orderData.customer_name || orderData.name,
                            orderNumber: orderData.order_number,
                            totalAmount: orderData.total_amount || orderData.amount,
                            downloadLinks,
                        }),
                    })
                } catch (emailError) {
                    console.error('Error sending email:', emailError)
                }
            }

            // Update the Telegram message to show the result
            const updatedCaption = `🛒 <b>Konfirmasi Pesanan</b>

📦 Produk: ${orderData.product_title}
👤 Nama: ${orderData.customer_name || orderData.name}
📧 Email: ${orderData.email || orderData.customer_email}
💰 Jumlah: Rp ${Number(orderData.total_amount || orderData.amount).toLocaleString('id-ID')}

<b>Status: ${statusLabel}</b>
🕐 ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`

            await editMessageCaption(
                { botToken: config.botToken, chatId: chatId?.toString() || config.chatId },
                messageId,
                updatedCaption
            )
        }

        // Answer callback query
        await answerCallbackQuery(
            config.botToken,
            callbackQuery.id,
            statusToUpdate === 'approved' || statusToUpdate === 'paid' ? '✅ Pembayaran disetujui!' : '❌ Pembayaran ditolak!',
            false
        )

        return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
} catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
}
}

// GET endpoint to verify webhook
export async function GET() {
    return NextResponse.json({ status: 'Telegram webhook is active' })
}
