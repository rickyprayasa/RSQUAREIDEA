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

        // Fetch feedback ratings for all products
        const { data: feedbackData } = await supabase
            .from('feedback')
            .select('template_name, rating')
            .eq('status', 'published')

        // Fetch sold counts from orders
        const { data: ordersData } = await supabase
            .from('orders')
            .select('product_title')
            .in('status', ['paid', 'completed'])

        // Build rating map: { productTitle: { total, count } }
        const ratingMap: Record<string, { total: number; count: number }> = {}
        feedbackData?.forEach(f => {
            if (!f.template_name) return
            if (!ratingMap[f.template_name]) ratingMap[f.template_name] = { total: 0, count: 0 }
            ratingMap[f.template_name].total += f.rating
            ratingMap[f.template_name].count += 1
        })

        // Build sold count map: { productTitle: count }
        const soldMap: Record<string, number> = {}
        ordersData?.forEach(o => {
            if (!o.product_title) return
            // product_title can contain multiple titles joined by comma
            const titles = o.product_title.split(', ')
            titles.forEach((title: string) => {
                soldMap[title] = (soldMap[title] || 0) + 1
            })
        })

        // Transform to camelCase for frontend
        // Use thumbnail for card view if available, fallback to image
        const transformedProducts = products?.map(p => {
            const rating = ratingMap[p.title]
            return {
                id: p.id,
                title: p.title,
                slug: p.slug,
                price: p.price,
                discountPrice: p.discount_price,
                image: p.thumbnail || p.image,
                category: p.category,
                isFeatured: p.is_featured,
                isFree: p.is_free,
                isActive: p.is_active,
                rating: rating ? Number((rating.total / rating.count).toFixed(1)) : 0,
                reviewCount: rating?.count || 0,
                soldCount: soldMap[p.title] || 0,
            }
        }) || []

        return NextResponse.json({ products: transformedProducts })
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
