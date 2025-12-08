import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const supabase = await createClient()

        // Insert contact message
        const { data: message, error } = await supabase
            .from('contact_messages')
            .insert({
                name: data.name,
                email: data.email,
                subject: data.subject || null,
                message: data.message,
                status: 'unread',
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating message:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Create notification
        await supabase.from('notifications').insert({
            type: 'contact',
            title: 'Pesan Kontak Baru',
            message: `${data.name} mengirim pesan: ${data.subject || 'Tanpa Subjek'}`,
            link: '/admin/messages',
        })

        return NextResponse.json({ message, success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
}
