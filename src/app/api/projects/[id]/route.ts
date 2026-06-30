import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

function getServiceClient() {
    const { createClient } = require('@supabase/supabase-js')
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = getServiceClient()
        
        const { data: project, error } = await supabase
            .from('projects')
            .select(`
                *,
                project_tasks(id, title, description, status, assignee_id, due_date, position),
                project_documents(id, type, title, content, updated_at)
            `)
            .eq('id', params.id)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, project })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const supabase = getServiceClient()
        
        const { data: project, error } = await supabase
            .from('projects')
            .update(data)
            .eq('id', params.id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        // Auto-sync status with template_requests if applicable
        if (data.status && project.source_type === 'template_requests' && project.source_id) {
            let reqStatus = 'in_progress';
            if (data.status === 'completed') reqStatus = 'completed';
            else if (data.status === 'archived' || data.status === 'on_hold') reqStatus = 'in_progress'; // or keep as is? Maybe pending? Let's just use in_progress unless completed.
            
            await supabase
                .from('template_requests')
                .update({ status: reqStatus })
                .eq('id', project.source_id);
        }

        return NextResponse.json({ success: true, project })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = getServiceClient()
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', params.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

