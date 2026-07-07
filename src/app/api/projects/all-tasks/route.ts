import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

function getServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = getServiceClient()

        // Fetch all tasks joining with project name
        const { data: tasks, error } = await supabase
            .from('project_tasks')
            .select(`
                *,
                project:projects(name)
            `)
            .order('position', { ascending: true })

        if (error) {
            console.error('Error fetching all tasks:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, tasks })
    } catch (error) {
        console.error('Server error fetching all tasks:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
