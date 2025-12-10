import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyCallback } from '@/lib/duitku'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        
        const merchantCode = formData.get('merchantCode') as string
        const amount = formData.get('amount') as string
        const merchantOrderId = formData.get('merchantOrderId') as string
        const signature = formData.get('signature') as string
        const resultCode = formData.get('resultCode') as string
        const reference = formData.get('reference') as string
        const paymentCode = formData.get('paymentCode') as string

        console.log('Duitku Callback received:', {
            merchantCode,
            amount,
            merchantOrderId,
            resultCode,
            reference,
            paymentCode,
        })

        if (!merchantCode || !amount || !merchantOrderId || !signature) {
            console.error('Missing callback parameters')
            return NextResponse.json({ error: 'Bad Parameter' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get Duitku API key from settings
        const { data: settings } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['duitku_api_key'])

        const apiKey = settings?.find(s => s.key === 'duitku_api_key')?.value

        if (!apiKey) {
            console.error('Duitku API key not configured')
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
        }

        // Verify signature
        const isValid = verifyCallback(
            { merchantCode, apiKey, isProduction: true },
            merchantCode,
            amount,
            merchantOrderId,
            signature
        )

        if (!isValid) {
            console.error('Invalid callback signature')
            return NextResponse.json({ error: 'Bad Signature' }, { status: 401 })
        }

        // Update order status based on resultCode
        // 00 = Success, 01 = Failed
        const newStatus = resultCode === '00' ? 'completed' : 'failed'

        const { data: order, error: updateError } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('order_number', merchantOrderId)
            .select('id, customer_name, customer_email, amount, product_title, payment_method')
            .single()

        if (updateError) {
            console.error('Error updating order:', updateError)
        }

        // If payment successful, send email, notification and update customer
        if (resultCode === '00' && order) {
            // Get download links from order_items
            const downloadLinks: { title: string; url: string }[] = []
            
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

            // Send email with download links
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rsquareidea.my.id'
                await fetch(`${baseUrl}/api/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: order.customer_email,
                        customerName: order.customer_name,
                        orderNumber: merchantOrderId,
                        totalAmount: order.amount,
                        downloadLinks,
                    }),
                })
                console.log('Email sent successfully to:', order.customer_email)
            } catch (emailError) {
                console.error('Error sending email:', emailError)
            }

            // Send Telegram notification for automatic payment
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rsquareidea.my.id'
                await fetch(`${baseUrl}/api/notify/telegram`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'duitku_payment',
                        data: {
                            orderId: merchantOrderId,
                            customerName: order.customer_name,
                            customerEmail: order.customer_email,
                            amount: order.amount,
                            productTitle: order.product_title,
                            paymentMethod: order.payment_method || paymentCode,
                            downloadLinks: downloadLinks.length,
                        }
                    }),
                })
            } catch (notifyError) {
                console.error('Error sending Telegram notification:', notifyError)
            }

            // Update or create customer record
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id, total_orders, total_spent')
                .eq('email', order.customer_email)
                .single()

            if (existingCustomer) {
                await supabase
                    .from('customers')
                    .update({
                        total_orders: (existingCustomer.total_orders || 0) + 1,
                        total_spent: (existingCustomer.total_spent || 0) + order.amount,
                        last_order_at: new Date().toISOString(),
                    })
                    .eq('id', existingCustomer.id)
            } else {
                await supabase
                    .from('customers')
                    .insert({
                        name: order.customer_name,
                        email: order.customer_email,
                        total_orders: 1,
                        total_spent: order.amount,
                        source: 'duitku',
                        last_order_at: new Date().toISOString(),
                    })
            }

            // Create notification for admin
            await supabase.from('notifications').insert({
                type: 'payment',
                title: '💳 Pembayaran Otomatis Berhasil',
                message: `${order.customer_name} - ${order.product_title} - Rp ${order.amount.toLocaleString('id-ID')} (Email & Download otomatis terkirim)`,
                link: '/admin/orders',
            })
        }

        console.log('Duitku callback processed successfully:', merchantOrderId, newStatus)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error processing Duitku callback:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
