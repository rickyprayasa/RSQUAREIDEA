import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isLocalhost } from '@/lib/isLocalhost'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        
        // Check if running on localhost - don't save to database
        const localhost = await isLocalhost()
        if (localhost) {
            console.log('[LOCALHOST] Order creation skipped - test mode')
            return NextResponse.json({ 
                order: {
                    id: 'test-' + Date.now(),
                    order_number: data.orderNumber,
                    status: data.status || 'pending',
                },
                success: true,
                testMode: true,
                message: 'Localhost mode - data tidak disimpan ke database'
            })
        }

        const supabase = await createClient()

        // Create order (use provided status or default to 'pending')
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                order_number: data.orderNumber,
                customer_email: data.customerEmail,
                customer_name: data.customerName,
                customer_phone: data.customerPhone || null,
                product_id: data.items[0]?.productId ? parseInt(data.items[0].productId) : null,
                product_title: data.items.map((i: { productTitle: string }) => i.productTitle).join(', '),
                amount: data.totalAmount,
                payment_method: data.paymentMethod,
                status: data.status || 'pending',
                notes: JSON.stringify(data.items),
                voucher_code: data.voucherCode || null,
                discount_amount: data.discountAmount || 0,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating order:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Insert order items
        if (order && data.items && data.items.length > 0) {
            const orderItems = data.items.map((item: { productId: string; productTitle: string; price: number }) => ({
                order_id: order.id,
                product_id: parseInt(item.productId),
                product_title: item.productTitle,
                price: item.price,
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) {
                console.error('Error creating order items:', itemsError)
            }
        }

        // Update voucher usage count if voucher was used
        if (data.voucherCode) {
            try {
                const { data: voucher } = await supabase
                    .from('vouchers')
                    .select('used_count, usage_limit')
                    .eq('code', data.voucherCode)
                    .single()

                if (voucher) {
                    const newUsedCount = (voucher.used_count || 0) + 1
                    const updateData: { used_count: number; is_active?: boolean } = { 
                        used_count: newUsedCount 
                    }
                    
                    // Deactivate voucher if usage limit reached
                    if (voucher.usage_limit && newUsedCount >= voucher.usage_limit) {
                        updateData.is_active = false
                    }
                    
                    await supabase
                        .from('vouchers')
                        .update(updateData)
                        .eq('code', data.voucherCode)
                }
            } catch (voucherError) {
                console.error('Error updating voucher count:', voucherError)
            }
        }

        return NextResponse.json({ order, success: true })
    } catch (error) {
        console.error('Error creating order:', error)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
}
