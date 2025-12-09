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

        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Error fetching notifications:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const unreadCount = notifications?.filter(n => !n.is_read).length || 0

        return NextResponse.json({ notifications, unreadCount })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
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

        if (data.markAllRead) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('is_read', false)
        } else if (data.id) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', data.id)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
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

        const supabase = await createClient()

        if (id) {
            await supabase.from('notifications').delete().eq('id', id)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
    }
}
