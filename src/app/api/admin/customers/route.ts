import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'
import { isLocalhost } from '@/lib/isLocalhost'

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
            .select('id, customer_email, product_title, order_items(product_title)')
            .order('created_at', { ascending: false })

        // Map products to customers
        const customersWithProducts = customers?.map(customer => {
            const customerOrders = orders?.filter(o => o.customer_email === customer.email) || []
            const products: string[] = []
            
            // Add products from orders (website purchases)
            customerOrders.forEach(o => {
                // Get from order_items if available
                if (o.order_items && Array.isArray(o.order_items) && o.order_items.length > 0) {
                    o.order_items.forEach((item: { product_title: string }) => {
                        if (item.product_title) products.push(item.product_title)
                    })
                } 
                // Fallback to product_title in orders table
                else if (o.product_title) {
                    // product_title might be comma-separated if multiple products
                    o.product_title.split(', ').forEach((title: string) => {
                        if (title.trim()) products.push(title.trim())
                    })
                }
            })

            // Add purchased_products from external platforms (manual input)
            if (customer.purchased_products && Array.isArray(customer.purchased_products)) {
                customer.purchased_products.forEach((p: string) => {
                    if (p && !products.includes(p)) products.push(p)
                })
            }
            
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
        
        // Check if running on localhost - don't save to database
        const localhost = await isLocalhost()
        if (localhost) {
            console.log('[LOCALHOST] Customer creation skipped - test mode')
            return NextResponse.json({ customerId: 'test-' + Date.now(), success: true, testMode: true })
        }

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
