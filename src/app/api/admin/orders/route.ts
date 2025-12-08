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

        // Get all orders
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching orders:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get all confirmations for mapping
        const { data: confirmations } = await supabase
            .from('qris_confirmations')
            .select('*')
            .order('created_at', { ascending: false })

        // Create a map of order_number to confirmation
        const confirmationMap = new Map()
        confirmations?.forEach(c => {
            // Only map the latest confirmation per order_number
            if (!confirmationMap.has(c.order_number)) {
                confirmationMap.set(c.order_number, c)
            }
        })

        // Transform snake_case to camelCase and include confirmation data
        const transformedOrders = orders?.map(o => {
            const confirmation = confirmationMap.get(o.order_number)
            return {
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
                // Payment confirmation data
                confirmation: confirmation ? {
                    id: confirmation.id,
                    proofImage: confirmation.proof_image,
                    status: confirmation.status,
                    notes: confirmation.notes,
                    adminNotes: confirmation.admin_notes,
                    createdAt: confirmation.created_at,
                    approvedAt: confirmation.approved_at,
                    approvedBy: confirmation.approved_by,
                } : null,
            }
        })

        // Count pending confirmations
        const pendingConfirmationsCount = confirmations?.filter(c => c.status === 'pending').length || 0

        return NextResponse.json({
            orders: transformedOrders,
            pendingConfirmationsCount
        })
    } catch (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}
