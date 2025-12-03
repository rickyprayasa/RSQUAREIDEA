import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching orders:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Transform snake_case to camelCase
        const transformedOrders = orders?.map(o => ({
            id: o.id,
            orderNumber: o.order_number,
            customerEmail: o.customer_email,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            productId: o.product_id,
            productTitle: o.product_title,
            amount: o.amount,
            paymentMethod: o.payment_method,
            paymentProof: o.payment_proof,
            status: o.status,
            notes: o.notes,
            createdAt: o.created_at,
            updatedAt: o.updated_at,
        }))

        return NextResponse.json({ orders: transformedOrders })
    } catch (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}
