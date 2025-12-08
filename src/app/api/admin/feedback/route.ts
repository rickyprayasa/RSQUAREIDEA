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

        const { data: feedback, error } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching feedback:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const newCount = feedback?.filter(f => f.status === 'new').length || 0

        return NextResponse.json({ feedback, newCount })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
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

        const { error } = await supabase
            .from('feedback')
            .update({ status: data.status })
            .eq('id', data.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const supabase = await createClient()

        const { error } = await supabase
            .from('feedback')
            .delete()
            .eq('id', data.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 })
    }
}
