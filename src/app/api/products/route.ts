import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: products, error } = await supabase
            .from('products')
            .select('id, title, slug, price, discount_price, image, thumbnail, category, is_featured, is_free, is_active')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching products:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Transform to camelCase for frontend
        // Use thumbnail for card view if available, fallback to image
        const transformedProducts = products?.map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: p.price,
            discountPrice: p.discount_price,
            image: p.thumbnail || p.image, // Prioritas thumbnail untuk card view
            category: p.category,
            isFeatured: p.is_featured,
            isFree: p.is_free,
            isActive: p.is_active,
        })) || []

        return NextResponse.json({ products: transformedProducts })
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
