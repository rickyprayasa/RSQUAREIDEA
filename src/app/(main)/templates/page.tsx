import { createStaticClient } from '@/lib/supabase/static'
import ClientTemplatesPage from './ClientTemplatesPage'
export const revalidate = 3600 // 1 hour

export const metadata = {
    title: 'Templates - RSQUARE IDEA',
    description: 'Temukan template premium untuk bisnis dan kehidupan personal Kamu. Semua template dilengkapi panduan lengkap.',
}

async function getTemplatesAndCategories() {
    const supabase = createStaticClient()

    // 1. Fetch products
    const { data: products } = await supabase
        .from('products')
        .select('id, title, slug, price, discount_price, image, thumbnail, category, is_featured, is_free, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    // 2. Fetch feedback ratings
    const { data: feedbackData } = await supabase
        .from('feedback')
        .select('template_name, rating')
        .eq('status', 'published')

    // 3. Fetch orders for sold counts
    const { data: ordersData } = await supabase
        .from('orders')
        .select('product_title')
        .in('status', ['paid', 'completed'])

    // Build rating map
    const ratingMap: Record<string, { total: number; count: number }> = {}
    feedbackData?.forEach(f => {
        if (!f.template_name) return
        if (!ratingMap[f.template_name]) ratingMap[f.template_name] = { total: 0, count: 0 }
        ratingMap[f.template_name].total += f.rating
        ratingMap[f.template_name].count += 1
    })

    // Build sold count map
    const soldMap: Record<string, number> = {}
    ordersData?.forEach(o => {
        if (!o.product_title) return
        const titles = o.product_title.split(', ')
        titles.forEach((title: string) => {
            soldMap[title] = (soldMap[title] || 0) + 1
        })
    })

    // Transform products
    const transformedProducts = products?.map(p => {
        const rating = ratingMap[p.title]
        return {
            _id: p.id.toString(),
            title: p.title,
            slug: p.slug,
            price: p.price,
            discountPrice: p.discount_price,
            image: p.thumbnail || p.image || '',
            category: p.category,
            isFeatured: p.is_featured,
            isFree: p.is_free,
            rating: rating ? Number((rating.total / rating.count).toFixed(1)) : 0,
            reviewCount: rating?.count || 0,
            soldCount: soldMap[p.title] || 0,
        }
    }) || []

    // 4. Fetch categories
    const { data: categoriesData } = await supabase
        .from('categories')
        .select('name, slug, icon')
        .order('name')

    return {
        templates: transformedProducts,
        categories: categoriesData || []
    }
}

export default async function TemplatesPage() {
    const { templates, categories } = await getTemplatesAndCategories()

    return <ClientTemplatesPage initialTemplates={templates} initialCategories={categories} />
}
