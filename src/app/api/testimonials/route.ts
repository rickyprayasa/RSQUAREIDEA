import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: feedback, error } = await supabase
            .from('feedback')
            .select('id, name, social_media, template_name, rating, likes')
            .eq('status', 'published')
            .eq('testimonial_permission', true)
            .not('likes', 'is', null)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            if (error.code === '42P01') {
                return NextResponse.json({ testimonials: [] })
            }
            console.error('Error fetching testimonials:', error)
            return NextResponse.json({ testimonials: [] })
        }

        // Get product details for context (webapp, custom showcase)
        const { data: products } = await supabase
            .from('products')
            .select('title, product_type, is_custom_showcase')
            .in('title', (feedback || []).map(f => f.template_name).filter(Boolean))

        const testimonials = feedback?.map(f => {
            const product = products?.find(p => p.title === f.template_name)
            return {
                ...f,
                productType: product?.product_type || 'template',
                isCustomShowcase: product?.is_custom_showcase || false
            }
        }) || []

        return NextResponse.json({ testimonials })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ testimonials: [] })
    }
}
