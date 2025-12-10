import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyNewTemplateRequest } from '@/lib/notifications'

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
                service_type: data.serviceType || 'sheets',
                company: data.company || null,
                attachment_url: data.attachmentUrl || null,
                status: 'pending',
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating request:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Create notification
        const serviceLabels: Record<string, string> = {
            sheets: 'Google Sheets',
            webapp: 'Google Web App',
            fullstack: 'Full Stack Dev',
            consultation: 'Konsultasi'
        }
        const serviceLabel = serviceLabels[data.serviceType] || 'Custom'
        
        await supabase.from('notifications').insert({
            type: 'template_request',
            title: 'Request Jasa Baru',
            message: `${data.name} - ${serviceLabel}${data.company ? ` (${data.company})` : ''}`,
            link: '/admin/requests',
        })

        // Send Telegram notification
        notifyNewTemplateRequest({
            name: data.name,
            email: data.email,
            templateType: serviceLabel,
            description: data.description || data.requirements || '-',
        }).catch(console.error)

        return NextResponse.json({ request: templateRequest, success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
    }
}
