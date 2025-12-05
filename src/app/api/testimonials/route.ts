import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: testimonials, error } = await supabase
            .from('feedback')
            .select('id, name, social_media, template_name, rating, likes')
            .eq('status', 'published')
            .eq('testimonial_permission', true)
            .not('likes', 'is', null)
            .order('created_at', { ascending: false })
            .limit(6)

        if (error) {
            // If table doesn't exist, return empty array
            if (error.code === '42P01') {
                return NextResponse.json({ testimonials: [] })
            }
            console.error('Error fetching testimonials:', error)
            return NextResponse.json({ testimonials: [] })
        }

        return NextResponse.json({ testimonials: testimonials || [] })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ testimonials: [] })
    }
}
