import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createAdminClient()
        
        const { data: requests, error: fetchError } = await supabase
            .from('template_requests')
            .select('*')

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 400 })
        }

        if (!requests || requests.length === 0) {
            return NextResponse.json({ success: true, message: 'No requests found.' })
        }
        
        let inserted = 0;
        for (const req of requests) {
            const { data: existing } = await supabase
                .from('projects')
                .select('id')
                .eq('source_type', 'template_requests')
                .eq('source_id', req.id)
                .single()
                
            if (!existing) {
                const { error: insertError } = await supabase
                    .from('projects')
                    .insert({
                        name: 'Project: ' + (req.company || req.name),
                        description: req.description || '-',
                        client_name: req.name,
                        client_email: req.email,
                        client_phone: req.phone || '',
                        source_type: 'template_requests',
                        source_id: req.id,
                        status: 'active',
                        created_at: req.created_at
                    })
                if (!insertError) inserted++
            }
        }

        return NextResponse.json({ success: true, inserted })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
