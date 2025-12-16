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
            
            // Parse callback data: approve_123 or reject_123
            const [action, confirmationIdStr] = callbackData.split('_')
            const confirmationId = parseInt(confirmationIdStr)
            
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
            
            const status = action === 'approve' ? 'approved' : 'rejected'
            const statusLabel = status === 'approved' ? 'DISETUJUI ✅' : 'DITOLAK ❌'
            
            // Update confirmation status
            const updateData: Record<string, unknown> = {
                status,
                admin_notes: `Dikonfirmasi via Telegram`,
                updated_at: new Date().toISOString(),
            }
            
            if (status === 'approved') {
                updateData.approved_at = new Date().toISOString()
                updateData.approved_by = 'Telegram Bot'
            }
            
            const { error: updateError } = await supabase
                .from('qris_confirmations')
                .update(updateData)
                .eq('id', confirmationId)
            
            if (updateError) {
                await answerCallbackQuery(
                    config.botToken,
                    callbackQuery.id,
                    'Gagal mengupdate status',
                    true
                )
                return NextResponse.json({ ok: true })
            }
            
            // If approved, update order status and send email
            if (status === 'approved') {
                // Update order status
                if (confirmation.order_number) {
                    await supabase
                        .from('orders')
                        .update({ status: 'paid' })
                        .eq('order_number', confirmation.order_number)
                } else if (confirmation.order_id) {
                    await supabase
                        .from('orders')
                        .update({ status: 'paid' })
                        .eq('id', confirmation.order_id)
                }
                
                // Get download links
                const downloadLinks: { title: string; url: string }[] = []
                
                if (confirmation.order_id) {
                    const { data: orderItems } = await supabase
                        .from('order_items')
                        .select('product_id, product_title, products(download_url, title)')
                        .eq('order_id', confirmation.order_id)
                    
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
                
                if (downloadLinks.length === 0 && confirmation.order_number) {
                    const { data: order } = await supabase
                        .from('orders')
                        .select('id, notes, product_id')
                        .eq('order_number', confirmation.order_number)
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
                            to: confirmation.customer_email,
                            customerName: confirmation.customer_name,
                            orderNumber: confirmation.order_number,
                            totalAmount: confirmation.amount,
                            downloadLinks,
                        }),
                    })
                } catch (emailError) {
                    console.error('Error sending email:', emailError)
                }
            }
            
            // Update the Telegram message to show the result
            const updatedCaption = `📱 <b>Konfirmasi Pembayaran</b>

👤 Nama: ${confirmation.customer_name}
📧 Email: ${confirmation.customer_email}
📦 Pesanan: ${confirmation.order_number}
💰 Jumlah: Rp ${Number(confirmation.amount).toLocaleString('id-ID')}

<b>Status: ${statusLabel}</b>
🕐 ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
            
            await editMessageCaption(
                { botToken: config.botToken, chatId: chatId?.toString() || config.chatId },
                messageId,
                updatedCaption
            )
            
            // Answer callback query
            await answerCallbackQuery(
                config.botToken,
                callbackQuery.id,
                status === 'approved' ? '✅ Pembayaran disetujui!' : '❌ Pembayaran ditolak!',
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
