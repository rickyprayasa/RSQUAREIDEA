import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WebAppFrame } from './WebAppFrame'
import type { Metadata } from 'next'

export const revalidate = 60

interface WebAppPageProps {
    params: Promise<{
        slug: string
    }>
}

async function getWebApp(slug: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('products')
        .select('id, title, slug, description, webapp_url, demo_url, image, category, product_type')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    if (error || !data || data.product_type !== 'webapp' || !data.webapp_url) {
        return null
    }

    return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        webappUrl: data.webapp_url,
        demoUrl: data.demo_url || '',
        image: data.image || '',
        category: data.category,
    }
}

export async function generateMetadata({ params }: WebAppPageProps): Promise<Metadata> {
    const { slug } = await params
    const webapp = await getWebApp(slug)

    if (!webapp) {
        return { title: 'Web App Not Found' }
    }

    return {
        title: `${webapp.title} - Live Demo | RSQUARE`,
        description: webapp.description || `Demo langsung ${webapp.title} dari RSQUARE`,
        openGraph: {
            title: `${webapp.title} - Live Demo`,
            description: webapp.description,
            images: webapp.image ? [webapp.image] : [],
        },
    }
}

export default async function WebAppPage({ params }: WebAppPageProps) {
    const { slug } = await params
    const webapp = await getWebApp(slug)

    if (!webapp) {
        notFound()
    }

    return <WebAppFrame webapp={webapp} />
}
