import { NextResponse } from 'next/server'
// Pure service-role client to bypass RLS
function getServiceClient() {
    const { createClient } = require('@supabase/supabase-js')
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = getServiceClient()

        // Fetch tasks assigned to the current user, joining with project name
        const { data: tasks, error } = await supabase
            .from('project_tasks')
            .select(`
                *,
                project:projects(name)
            `)
            .eq('assignee_id', session.id)
            .order('due_date', { ascending: true })

        if (error) {
            console.error('Error fetching my tasks:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, tasks })
    } catch (error) {
        console.error('Server error fetching my tasks:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
