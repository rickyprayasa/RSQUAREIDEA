import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function PUT(
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
        
        const { data: order, error } = await supabase
            .from('orders')
            .update({
                status: data.status,
                notes: data.notes,
            })
            .eq('id', parseInt(id))
            .select()
            .single()

        if (error) {
            console.error('Error updating order:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ order })
    } catch (error) {
        console.error('Error updating order:', error)
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
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
            .from('orders')
            .delete()
            .eq('id', parseInt(id))

        if (error) {
            console.error('Error deleting order:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting order:', error)
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
    }
}
