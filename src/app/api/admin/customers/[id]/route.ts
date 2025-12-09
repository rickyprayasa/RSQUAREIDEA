import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await request.json()
        const supabase = await createClient()

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        }

        if (data.name !== undefined) updateData.name = data.name
        if (data.email !== undefined) updateData.email = data.email
        if (data.phone !== undefined) updateData.phone = data.phone || null
        if (data.source !== undefined) updateData.source = data.source
        if (data.notes !== undefined) updateData.notes = data.notes || null
        if (data.purchased_products !== undefined) updateData.purchased_products = data.purchased_products

        const { data: customer, error } = await supabase
            .from('customers')
            .update(updateData)
            .eq('id', parseInt(id))
            .select()
            .single()

        if (error) {
            console.error('Error updating customer:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ customer, success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const supabase = await createClient()

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', parseInt(id))

        if (error) {
            console.error('Error deleting customer:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
