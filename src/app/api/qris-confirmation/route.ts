import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isLocalhost } from '@/lib/isLocalhost'
import { notifyQrisConfirmation } from '@/lib/notifications'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        
        // Check if running on localhost - don't save to database
        const localhost = await isLocalhost()
        if (localhost) {
            console.log('[LOCALHOST] QRIS confirmation skipped - test mode')
            return NextResponse.json({ 
                confirmation: { id: 'test-' + Date.now(), status: 'pending' }, 
                success: true, 
                testMode: true 
            })
        }

        const supabase = await createClient()

        // Find order_id from orders table if not provided
        let orderId = data.orderId || null
        if (!orderId && data.orderNumber) {
            const { data: order } = await supabase
                .from('orders')
                .select('id')
                .eq('order_number', data.orderNumber)
                .single()

            if (order) {
                orderId = order.id
            }
        }

        // Insert into qris_confirmations table
        const { data: confirmation, error } = await supabase
            .from('qris_confirmations')
            .insert({
                order_id: orderId,
                order_number: data.orderNumber,
                customer_name: data.customerName,
                customer_email: data.customerEmail,
                customer_phone: data.customerPhone || null,
                amount: data.amount,
                proof_image: data.proofImage,
                notes: data.notes || null,
                status: 'pending',
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating confirmation:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Create notification for admin
        await supabase.from('notifications').insert({
            type: 'payment',
            title: 'Konfirmasi Pembayaran Baru',
            message: `${data.customerName} mengirim bukti pembayaran Rp ${Number(data.amount).toLocaleString('id-ID')} untuk pesanan ${data.orderNumber}`,
            link: '/admin/orders?filter=pending_confirmation',
        })

        // Send Telegram notification
        notifyQrisConfirmation({
            name: data.customerName,
            email: data.customerEmail,
            productTitle: data.orderNumber,
            amount: data.amount,
        }).catch(console.error)

        return NextResponse.json({ confirmation, success: true })
    } catch (error) {
        console.error('Error creating confirmation:', error)
        return NextResponse.json({ error: 'Failed to create confirmation' }, { status: 500 })
    }
}


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const orderNumber = searchParams.get('orderNumber')

        const supabase = await createClient()

        let query = supabase
            .from('qris_confirmations')
            .select('*')
            .order('created_at', { ascending: false })

        if (orderNumber) {
            query = query.eq('order_number', orderNumber)
        }

        const { data: confirmations, error } = await query

        if (error) {
            console.error('Error fetching confirmations:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // If we're searching for a specific order and it's approved, include download links
        if (orderNumber && confirmations && confirmations.length > 0) {
            const confirmation = confirmations[0]

            if (confirmation.status === 'approved') {
                const downloadLinks: { title: string; url: string }[] = []

                // Method 1: Try to get order_items by order_id if available
                if (confirmation.order_id) {
                    console.log('Method 1: Fetching order items by order_id:', confirmation.order_id)
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

                // Method 2: If no items found, try by order_number to get order first
                if (downloadLinks.length === 0) {
                    console.log('Method 2: Fetching order by order_number:', orderNumber)

                    const { data: order } = await supabase
                        .from('orders')
                        .select('id, notes, product_id')
                        .eq('order_number', orderNumber)
                        .single()

                    console.log('Order found:', order)

                    if (order) {
                        // Try order_items table first
                        const { data: orderItems } = await supabase
                            .from('order_items')
                            .select('product_id, product_title, products(download_url, title)')
                            .eq('order_id', order.id)

                        console.log('Order items:', orderItems)

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

                        // Method 3: Fallback to notes JSON (for old orders)
                        if (downloadLinks.length === 0 && order.notes) {
                            console.log('Method 3: Parsing notes for product IDs')
                            try {
                                const items = JSON.parse(order.notes) as Array<{ productId: string; productTitle: string }>
                                console.log('Parsed items from notes:', items)

                                for (const item of items) {
                                    if (item.productId) {
                                        const { data: product } = await supabase
                                            .from('products')
                                            .select('download_url, title')
                                            .eq('id', parseInt(item.productId))
                                            .single()

                                        console.log('Product for item:', item.productId, product)

                                        if (product?.download_url) {
                                            downloadLinks.push({
                                                title: item.productTitle || product.title || 'Template',
                                                url: product.download_url
                                            })
                                        }
                                    }
                                }
                            } catch (parseError) {
                                console.error('Error parsing notes:', parseError)
                            }
                        }

                        // Method 4: Fallback to product_id column
                        if (downloadLinks.length === 0 && order.product_id) {
                            console.log('Method 4: Using product_id from order:', order.product_id)
                            const { data: product } = await supabase
                                .from('products')
                                .select('download_url, title')
                                .eq('id', order.product_id)
                                .single()

                            console.log('Product:', product)

                            if (product?.download_url) {
                                downloadLinks.push({
                                    title: product.title || 'Template',
                                    url: product.download_url
                                })
                            }
                        }
                    }
                }

                console.log('Final download links:', downloadLinks)

                // Return confirmation with download links
                return NextResponse.json({
                    confirmations: [{
                        ...confirmation,
                        downloadLinks
                    }]
                })
            }
        }

        return NextResponse.json({ confirmations })
    } catch (error) {
        console.error('Error fetching confirmations:', error)
        return NextResponse.json({ error: 'Failed to fetch confirmations' }, { status: 500 })
    }
}
