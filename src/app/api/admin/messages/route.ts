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

        const { data: messages, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching messages:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const unreadCount = messages?.filter(m => m.status === 'unread').length || 0

        return NextResponse.json({ messages, unreadCount })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const supabase = await createClient()

        const updateData: Record<string, unknown> = {
            status: data.status,
        }

        if (data.status === 'read' || data.status === 'replied') {
            updateData.read_at = new Date().toISOString()
        }

        if (data.adminNotes) {
            updateData.admin_notes = data.adminNotes
        }

        const { error } = await supabase
            .from('contact_messages')
            .update(updateData)
            .eq('id', data.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }
}
