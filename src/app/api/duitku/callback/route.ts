import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyCallback } from '@/lib/duitku'
import { notifyPaymentConfirmed } from '@/lib/notifications'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        
        const merchantCode = formData.get('merchantCode') as string
        const amount = formData.get('amount') as string
        const merchantOrderId = formData.get('merchantOrderId') as string
        const signature = formData.get('signature') as string
        const resultCode = formData.get('resultCode') as string
        const reference = formData.get('reference') as string

        console.log('Duitku Callback received:', {
            merchantCode,
            amount,
            merchantOrderId,
            resultCode,
            reference,
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
            .update({
                status: newStatus,
                notes: supabase.rpc('jsonb_set_value', {
                    target: 'notes',
                    path: '{duitku_result_code}',
                    value: resultCode,
                }),
            })
            .eq('order_number', merchantOrderId)
            .select('id, customer_name, customer_email, amount, product_title')
            .single()

        if (updateError) {
            // Try simple update without jsonb
            await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('order_number', merchantOrderId)
        }

        // If payment successful, send notification and update customer
        if (resultCode === '00' && order) {
            // Send Telegram notification
            notifyPaymentConfirmed({
                orderId: order.id,
                customerName: order.customer_name,
                amount: order.amount,
                method: 'Duitku',
            }).catch(console.error)

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
                        source: 'website',
                        last_order_at: new Date().toISOString(),
                    })
            }

            // Create notification for admin
            await supabase.from('notifications').insert({
                type: 'payment',
                title: 'Pembayaran Duitku Berhasil',
                message: `${order.customer_name} - ${order.product_title} - Rp ${order.amount.toLocaleString('id-ID')}`,
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
