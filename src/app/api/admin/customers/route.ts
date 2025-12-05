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

        // Get customers
        const { data: customers, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching customers:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get orders with items for each customer
        const { data: orders } = await supabase
            .from('orders')
            .select('id, customer_email, order_items(product_title)')
            .order('created_at', { ascending: false })

        // Map products to customers
        const customersWithProducts = customers?.map(customer => {
            const customerOrders = orders?.filter(o => o.customer_email === customer.email) || []
            const products = customerOrders.flatMap(o => 
                (o.order_items || []).map((item: { product_title: string }) => item.product_title)
            )
            return {
                ...customer,
                products: [...new Set(products)], // Unique products
            }
        })

        return NextResponse.json({ customers: customersWithProducts })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const supabase = await createClient()

        // Check if customer exists
        const { data: existing } = await supabase
            .from('customers')
            .select('id, total_orders, total_spent, phone')
            .eq('email', data.email)
            .single()

        if (existing) {
            // Update existing customer
            const { error } = await supabase
                .from('customers')
                .update({
                    name: data.name,
                    phone: data.phone || existing.phone || null,
                    total_orders: (existing.total_orders || 0) + 1,
                    total_spent: (existing.total_spent || 0) + (data.amount || 0),
                    last_order_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id)

            if (error) throw error
            return NextResponse.json({ customerId: existing.id, success: true })
        } else {
            // Create new customer
            const { data: customer, error } = await supabase
                .from('customers')
                .insert({
                    name: data.name,
                    email: data.email,
                    phone: data.phone || null,
                    total_orders: 1,
                    total_spent: data.amount || 0,
                    last_order_at: new Date().toISOString(),
                })
                .select()
                .single()

            if (error) throw error
            return NextResponse.json({ customerId: customer.id, success: true })
        }
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to save customer' }, { status: 500 })
    }
}
