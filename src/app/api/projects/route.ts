import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// Use a pure service-role client to bypass RLS on the projects table
function getServiceClient() {
    const { createClient } = require('@supabase/supabase-js')
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

        const supabase = getServiceClient()
        
        // Include tasks to calculate progress
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*, project_tasks(id, status)')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, projects })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const supabase = getServiceClient()
        
        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                name: data.name,
                description: data.description || '',
                client_name: data.client_name || '',
                client_email: data.client_email || '',
                client_phone: data.client_phone || '',
                source_type: 'manual',
                status: 'active'
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, project })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

