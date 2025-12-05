import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const supabase = await createClient()

        const { data: templateRequest, error } = await supabase
            .from('template_requests')
            .insert({
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                template_name: data.templateName || 'Jasa Kustom',
                description: data.description || data.requirements || null,
                budget: data.budget || null,
                deadline: data.deadline || null,
                status: 'pending',
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating request:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Create notification
        await supabase.from('notifications').insert({
            type: 'template_request',
            title: 'Request Template Baru',
            message: `${data.name} meminta template kustom`,
            link: '/admin/requests',
        })

        return NextResponse.json({ request: templateRequest, success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
    }
}
