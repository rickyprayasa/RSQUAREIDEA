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

export async function GET(request: NextRequest, props: { params: Promise<{ docId: string }> }) {
    const params = await props.params;
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = getServiceClient()
        
        const { data: document, error } = await supabase
            .from('project_documents')
            .select('*')
            .eq('id', params.docId)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, document })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ docId: string }> }) {
    const params = await props.params;
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const supabase = getServiceClient()
        
        const { data: document, error } = await supabase
            .from('project_documents')
            .update(data)
            .eq('id', params.docId)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, document })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ docId: string }> }) {
    const params = await props.params;
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = getServiceClient()
        
        const { error } = await supabase
            .from('project_documents')
            .delete()
            .eq('id', params.docId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
