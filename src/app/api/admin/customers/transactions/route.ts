import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const customerId = searchParams.get('customer_id')

        const supabase = await createClient()

        let query = supabase
            .from('customer_transactions')
            .select('*')
            .order('purchase_date', { ascending: false })

        if (customerId) {
            query = query.eq('customer_id', customerId)
        }

        const { data: transactions, error } = await query

        if (error) throw error

        return NextResponse.json({ transactions })
    } catch (error) {
        console.error('Error fetching transactions:', error)
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { customer_id, product_name, amount, platform, purchase_date, notes } = body

        if (!customer_id || !product_name) {
            return NextResponse.json({ error: 'Customer ID dan nama produk wajib diisi' }, { status: 400 })
        }

        const supabase = await createClient()

        // Insert transaction
        const { data: transaction, error } = await supabase
            .from('customer_transactions')
            .insert({
                customer_id,
                product_name,
                amount: amount || 0,
                platform: platform || 'other',
                purchase_date: purchase_date || new Date().toISOString().split('T')[0],
                notes,
            })
            .select()
            .single()

        if (error) throw error

        // Update customer's total_spent, total_orders, and last_activity_at
        const { data: customerTransactions } = await supabase
            .from('customer_transactions')
            .select('amount')
            .eq('customer_id', customer_id)

        const totalFromTransactions = customerTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

        // Get existing orders total from orders table
        const { data: ordersData } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('customer_email', (await supabase.from('customers').select('email').eq('id', customer_id).single()).data?.email)
            .eq('status', 'completed')

        const totalFromOrders = ordersData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0

        await supabase
            .from('customers')
            .update({
                total_spent: totalFromTransactions + totalFromOrders,
                total_orders: (customerTransactions?.length || 0) + (ordersData?.length || 0),
                last_activity_at: new Date().toISOString(),
            })
            .eq('id', customer_id)

        return NextResponse.json({ transaction })
    } catch (error) {
        console.error('Error creating transaction:', error)
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get transaction to find customer_id
        const { data: transaction } = await supabase
            .from('customer_transactions')
            .select('customer_id')
            .eq('id', id)
            .single()

        const { error } = await supabase
            .from('customer_transactions')
            .delete()
            .eq('id', id)

        if (error) throw error

        // Recalculate customer totals if we found the customer
        if (transaction?.customer_id) {
            const { data: customerTransactions } = await supabase
                .from('customer_transactions')
                .select('amount')
                .eq('customer_id', transaction.customer_id)

            const totalFromTransactions = customerTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

            await supabase
                .from('customers')
                .update({
                    total_spent: totalFromTransactions,
                    total_orders: customerTransactions?.length || 0,
                })
                .eq('id', transaction.customer_id)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting transaction:', error)
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
    }
}
