import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const supabase = getServiceClient()
        
        const { data: task, error } = await supabase
            .from('project_tasks')
            .insert({
                project_id: params.id,
                title: data.title,
                description: data.description || '',
                status: data.status || 'todo',
                assignee_id: data.assignee_id || null,
                due_date: data.due_date || null,
                position: data.position || 0
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, task })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
