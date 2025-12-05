import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
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
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        
        const slug = data.slug || data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

        const supabase = await createClient()
        const { data: product, error } = await supabase
            .from('products')
            .insert({
                title: data.title,
                slug,
                description: data.description,
                price: data.price || 0,
                discount_price: data.discountPrice,
                category: data.category,
                image: data.image,
                thumbnail: data.thumbnail || null,
                images: data.images || [],
                demo_url: data.demoUrl,
                download_url: data.downloadUrl,
                is_featured: data.isFeatured || false,
                is_free: data.isFree || false,
                is_active: data.isActive ?? true,
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
