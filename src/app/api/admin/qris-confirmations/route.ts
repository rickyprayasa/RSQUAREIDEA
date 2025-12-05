import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        const { data: confirmations, error } = await supabase
            .from('qris_confirmations')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching confirmations:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Count pending confirmations
        const pendingCount = confirmations?.filter(c => c.status === 'pending').length || 0

        return NextResponse.json({ confirmations, pendingCount })
    } catch (error) {
        console.error('Error fetching confirmations:', error)
        return NextResponse.json({ error: 'Failed to fetch confirmations' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const { id, status, adminNotes } = data

        if (!id || !status) {
            return NextResponse.json({ error: 'ID and status required' }, { status: 400 })
        }

        const supabase = await createClient()

        const updateData: Record<string, unknown> = {
            status,
            admin_notes: adminNotes || null,
            updated_at: new Date().toISOString(),
        }

        if (status === 'approved') {
            updateData.approved_at = new Date().toISOString()
            updateData.approved_by = user.email
        }

        const { data: confirmation, error } = await supabase
            .from('qris_confirmations')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating confirmation:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // If approved, update the order status and send email
        if (status === 'approved') {
            // Update order status by order_number or order_id
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

            // Prepare download links
            const downloadLinks: { title: string; url: string }[] = []

            // Method 1: Try to get order_items by order_id if available
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

            // Method 2: If no items found, try by order_number
            if (downloadLinks.length === 0 && confirmation.order_number) {
                const { data: order } = await supabase
                    .from('orders')
                    .select('id, notes, product_id')
                    .eq('order_number', confirmation.order_number)
                    .single()

                if (order) {
                    // Try order_items table first
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

                    // Method 3: Fallback to notes JSON
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

                    // Method 4: Fallback to product_id column
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

            // Send email notification
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
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
                // Don't fail the confirmation if email fails
            }
        }

        return NextResponse.json({ confirmation, success: true })
    } catch (error) {
        console.error('Error updating confirmation:', error)
        return NextResponse.json({ error: 'Failed to update confirmation' }, { status: 500 })
    }
}
