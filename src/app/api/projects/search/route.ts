import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

function getServiceClient() {
    
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q')

        if (!q) {
            return NextResponse.json({ success: true, projects: [], tasks: [] })
        }

        const supabase = getServiceClient()

        // Search projects by name
        const { data: projects, error: pError } = await supabase
            .from('projects')
            .select('id, name, type, client_name, status')
            .ilike('name', `%${q}%`)
            .limit(10)

        if (pError) throw pError

        // Search tasks by title
        const { data: tasks, error: tError } = await supabase
            .from('project_tasks')
            .select('id, title, status, project_id, project:projects(name)')
            .ilike('title', `%${q}%`)
            .limit(10)

        if (tError) throw tError

        return NextResponse.json({ success: true, projects, tasks })
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
