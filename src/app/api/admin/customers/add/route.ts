import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const { name, email, phone, source, notes, products } = data

        if (!name || !email) {
            return NextResponse.json({ error: 'Nama dan email wajib diisi' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check if customer with this email already exists
        const { data: existing } = await supabase
            .from('customers')
            .select('id')
            .eq('email', email)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Pelanggan dengan email ini sudah ada' }, { status: 400 })
        }

        // Create new customer
        const { data: customer, error } = await supabase
            .from('customers')
            .insert({
                name,
                email,
                phone: phone || null,
                source: source || 'manual',
                notes: notes || null,
                purchased_products: products && products.length > 0 ? products : null,
                total_orders: products?.length || 0,
                total_spent: 0,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating customer:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ customer, success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to add customer' }, { status: 500 })
    }
}
