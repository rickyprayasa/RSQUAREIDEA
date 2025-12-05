import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        
        // Use service role to bypass RLS
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Insert feedback
        const { data: feedback, error } = await supabase
            .from('feedback')
            .insert({
                name: data.name || null,
                social_media: data.socialMedia || null,
                social_media_url: data.socialMediaUrl || null,
                template_name: data.templateName || null,
                rating: data.rating,
                likes: data.likes || null,
                improvements: data.improvements || null,
                testimonial_permission: data.testimonialPermission || false,
                status: 'new',
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating feedback:', error)
            return NextResponse.json({ error: error.message, success: false }, { status: 500 })
        }

        // Create notification (ignore errors)
        try {
            await supabase.from('notifications').insert({
                type: 'feedback',
                title: 'Feedback Baru',
                message: `${data.name ? data.name + ' - ' : ''}Rating ${data.rating}/5 untuk ${data.templateName || 'Template'}`,
                link: '/admin/feedback',
            })
        } catch {
            // Ignore notification errors
        }

        return NextResponse.json({ feedback, success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Gagal mengirim feedback. Silakan coba lagi.', success: false }, { status: 500 })
    }
}
