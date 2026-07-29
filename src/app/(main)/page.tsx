import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/home/Hero'
import { Marquee } from '@/components/home/Marquee'
import { Features } from '@/components/home/Features'
import { TemplateSection } from '@/components/home/TemplateSection'
import { VideoTutorials } from '@/components/home/VideoTutorials'
import { Testimonials } from '@/components/home/Testimonials'
import { FAQ } from '@/components/home/FAQ'
import { RequestTemplate } from '@/components/home/RequestTemplate'
import { AboutUs } from '@/components/home/AboutUs'
import { GlobalBackground } from '@/components/home/GlobalBackground'

async function getHomepageData() {
    const supabase = await createClient()
    
    const [settingsRes, freeTemplatesRes, featuredTemplatesRes] = await Promise.all([
        supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['homepage_free_limit', 'homepage_featured_limit']),
        supabase
            .from('products')
            .select('id, title, slug, price, discount_price, image, category, is_featured, download_url, demo_url')
            .eq('is_active', true)
            .eq('is_free', true)
            .order('created_at', { ascending: false })
            .limit(6),
        supabase
            .from('products')
            .select('id, title, slug, price, discount_price, image, category, is_featured, download_url, demo_url')
            .eq('is_active', true)
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(6)
    ])
    
    const settingsMap: Record<string, string> = {}
    settingsRes.data?.forEach(s => { settingsMap[s.key] = s.value || '4' })
    
    const freeLimit = parseInt(settingsMap.homepage_free_limit || '4')
    const featuredLimit = parseInt(settingsMap.homepage_featured_limit || '4')
    
    const mapTemplate = (t: any) => ({
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
    })
    
    return {
        freeTemplates: (freeTemplatesRes.data || []).slice(0, freeLimit).map(mapTemplate),
        featuredTemplates: (featuredTemplatesRes.data || []).slice(0, featuredLimit).map(mapTemplate),
    }
}

export default async function Home() {
    const { freeTemplates, featuredTemplates } = await getHomepageData()

    return (
        <main className="overflow-hidden relative">
            <GlobalBackground />
            
            <Hero />
            <Marquee />
            <Features />

            <TemplateSection
                title="Template Gratis"
                subtitle="Mulai perjalanan produktivitas Kamu tanpa biaya sepeserpun."
                templates={freeTemplates}
                viewAllLink="/templates?category=free"
                emptyTitle="Template Gratis Segera Hadir"
                emptyDescription="Kami sedang menyiapkan koleksi template gratis untuk membantu Kamu memulai. Nantikan!"
            />

            <TemplateSection
                title="Template Unggulan"
                subtitle="Solusi premium untuk kebutuhan bisnis dan personal yang lebih kompleks."
                templates={featuredTemplates}
                viewAllLink="/templates?category=premium"
                emptyTitle="Template Unggulan Segera Hadir"
                emptyDescription="Koleksi template premium terbaik kami sedang dalam persiapan. Coming soon!"
            />

            <VideoTutorials />
            <Testimonials />
            <FAQ />
            <RequestTemplate />
            <AboutUs />
        </main>
    )
}
