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
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching products:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ products })
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const slug = data.slug || data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        const { data: product, error } = await supabase
            .from('products')
            .insert({
                title: data.title,
                slug,
                description: data.description,
                price: data.price || 0,
                discount_price: data.discountPrice,
                category: data.category,
                image: data.thumbnail || data.image,
                thumbnail: data.thumbnail || null,
                images: data.images || [],
                demo_url: data.demoUrl,
                download_url: data.downloadUrl,
                video_tutorial_url: data.videoTutorialUrl || null,
                is_featured: data.isFeatured || false,
                is_free: data.isFree || false,
                is_active: data.isActive ?? true,
                is_custom_showcase: data.isCustomShowcase || false,
                service_type: data.serviceType || null,
                product_type: data.productType || 'template',
                webapp_url: data.webappUrl || null,
                features: data.features || [],
                external_links: data.externalLinks || [],
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating product:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ product })
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
