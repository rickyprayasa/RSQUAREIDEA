import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const supabase = await createClient()

        // Create order
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
                status: 'pending',
                notes: JSON.stringify(data.items),
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
                // Don't fail the order creation if items fail
            }
        }

        return NextResponse.json({ order, success: true })
    } catch (error) {
        console.error('Error creating order:', error)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
}
