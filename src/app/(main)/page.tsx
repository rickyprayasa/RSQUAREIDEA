import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/home/Hero'
import { Marquee } from '@/components/home/Marquee'
import { Features } from '@/components/home/Features'
import { TemplateSection } from '@/components/home/TemplateSection'
import { VideoTutorials } from '@/components/home/VideoTutorials'
import { FAQ } from '@/components/home/FAQ'
import { RequestTemplate } from '@/components/home/RequestTemplate'
import { AboutUs } from '@/components/home/AboutUs'

async function getSettings() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['homepage_free_limit', 'homepage_featured_limit'])
    
    const settings: Record<string, string> = {}
    data?.forEach(s => { settings[s.key] = s.value || '4' })
    
    return {
        freeLimit: parseInt(settings.homepage_free_limit || '4'),
        featuredLimit: parseInt(settings.homepage_featured_limit || '4'),
    }
}

async function getTemplates() {
    const supabase = await createClient()
    const { freeLimit, featuredLimit } = await getSettings()
    
    const { data: freeTemplates } = await supabase
        .from('products')
        .select('id, title, slug, price, discount_price, image, category, is_featured, download_url, demo_url')
        .eq('is_active', true)
        .eq('is_free', true)
        .order('created_at', { ascending: false })
        .limit(freeLimit)
    
    const { data: featuredTemplates } = await supabase
        .from('products')
        .select('id, title, slug, price, discount_price, image, category, is_featured, download_url, demo_url')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(featuredLimit)
    
    return {
        freeTemplates: freeTemplates?.map(t => ({
            _id: t.id.toString(),
            title: t.title,
            slug: t.slug,
            price: t.price,
            discountPrice: t.discount_price,
            image: t.image || '',
            category: t.category,
            isFeatured: t.is_featured,
            downloadUrl: t.download_url,
            demoUrl: t.demo_url,
        })) || [],
        featuredTemplates: featuredTemplates?.map(t => ({
            _id: t.id.toString(),
            title: t.title,
            slug: t.slug,
            price: t.price,
            discountPrice: t.discount_price,
            image: t.image || '',
            category: t.category,
            isFeatured: t.is_featured,
            downloadUrl: t.download_url,
            demoUrl: t.demo_url,
        })) || [],
    }
}

export default async function Home() {
    const { freeTemplates, featuredTemplates } = await getTemplates()

    return (
        <main className="overflow-hidden">
            <Hero />
            <Marquee />
            <Features />

            <TemplateSection
                title="Template Gratis"
                subtitle="Mulai perjalanan produktivitas Kamu tanpa biaya sepeserpun."
                templates={freeTemplates}
                viewAllLink="/templates?category=free"
                bgClass="bg-gray-50"
            />

            <TemplateSection
                title="Template Unggulan"
                subtitle="Solusi premium untuk kebutuhan bisnis dan personal yang lebih kompleks."
                templates={featuredTemplates}
                viewAllLink="/templates?category=premium"
            />

            <VideoTutorials />
            <FAQ />
            <RequestTemplate />
            <AboutUs />
        </main>
    )
}
