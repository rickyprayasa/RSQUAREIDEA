import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: requests, error } = await supabase
            .from('template_requests')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching requests:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const pendingCount = requests?.filter(r => r.status === 'pending').length || 0

        return NextResponse.json({ requests, pendingCount })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const updateData: Record<string, unknown> = {
            status: data.status,
            updated_at: new Date().toISOString(),
        }

        if (data.adminNotes) {
            updateData.admin_notes = data.adminNotes
        }

        const { error } = await supabase
            .from('template_requests')
            .update(updateData)
            .eq('id', data.id)

        if (error) throw error

        // Sync with PM projects
        try {
            const { createClient } = require('@supabase/supabase-js')
            const serviceClient = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { auth: { autoRefreshToken: false, persistSession: false } }
            )

            const { data: existingProject } = await serviceClient
                .from('projects')
                .select('id')
                .eq('source_type', 'template_requests')
                .eq('source_id', data.id)
                .maybeSingle()

            if (data.status === 'in_progress' && !existingProject) {
                const { data: reqDetails } = await supabase
                    .from('template_requests')
                    .select('*')
                    .eq('id', data.id)
                    .single()

                if (reqDetails) {
                    await serviceClient.from('projects').insert({
                        name: `Project: ${reqDetails.company || reqDetails.name}`,
                        description: reqDetails.description || '-',
                        client_name: reqDetails.name,
                        client_email: reqDetails.email,
                        client_phone: reqDetails.phone || null,
                        source_type: 'template_requests',
                        source_id: reqDetails.id,
                        status: 'active'
                    })
                }
            } else if (existingProject) {
                let projectStatus = 'active'
                if (data.status === 'completed') projectStatus = 'completed'
                else if (data.status === 'rejected') projectStatus = 'archived'

                await serviceClient
                    .from('projects')
                    .update({ status: projectStatus })
                    .eq('id', existingProject.id)
            }
        } catch (syncErr) {
            console.error('Error syncing project on PATCH:', syncErr)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
    }
}
