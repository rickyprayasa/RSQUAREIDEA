import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductDetail } from '@/components/templates/ProductDetail'

export const revalidate = 60

interface TemplateDetailProps {
    params: Promise<{
        slug: string
    }>
}

async function getTemplate(slug: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
    
    if (error || !data) {
        return null
    }
    
    return {
        _id: data.id.toString(),
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        price: data.price,
        discountPrice: data.discount_price,
        image: data.image || '',
        images: data.images || [],
        category: data.category,
        features: data.features || [],
        demoUrl: data.demo_url || '',
        downloadUrl: data.download_url || '',
        externalLinks: data.external_links || [],
        isFree: data.is_free,
        isFeatured: data.is_featured,
    }
}

export default async function TemplateDetailPage({ params }: TemplateDetailProps) {
    const { slug } = await params
    const template = await getTemplate(slug)

    if (!template) {
        notFound()
    }

    return <ProductDetail template={template} />
}
