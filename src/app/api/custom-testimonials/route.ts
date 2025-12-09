import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Get published feedback for custom showcase products
        const { data: feedback, error: feedbackError } = await supabase
            .from('feedback')
            .select('*')
            .eq('status', 'published')
            .eq('testimonial_permission', true)
            .order('created_at', { ascending: false })

        if (feedbackError) {
            console.error('Error fetching testimonials:', feedbackError)
            return NextResponse.json({ error: feedbackError.message }, { status: 500 })
        }

        // Get custom showcase products to match template names
        const { data: products } = await supabase
            .from('products')
            .select('id, title, slug, service_type, is_custom_showcase')
            .eq('is_custom_showcase', true)
            .eq('is_active', true)

        // Map feedback with product slugs
        const testimonials = feedback?.map(f => {
            const product = products?.find(p => p.title === f.template_name)
            return {
                id: f.id,
                name: f.name,
                socialMedia: f.social_media,
                socialMediaUrl: f.social_media_url,
                templateName: f.template_name,
                templateSlug: product?.slug || null,
                serviceType: product?.service_type || null,
                isCustomProject: product?.is_custom_showcase || false,
                rating: f.rating,
                likes: f.likes,
                createdAt: f.created_at
            }
        }).filter(t => t.isCustomProject) || []

        return NextResponse.json({ testimonials })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
    }
}
