import { createClient } from '@/lib/supabase/server'
import { TemplatesList } from '@/components/templates/TemplatesList'

export const revalidate = 3600

async function getTemplates() {
    const supabase = await createClient()
    
    const { data } = await supabase
        .from('products')
        .select('id, title, slug, price, discount_price, image, category, is_featured, is_free')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
    
    return data?.map(t => ({
        _id: t.id.toString(),
        title: t.title,
        slug: t.slug,
        price: t.price,
        discountPrice: t.discount_price,
        image: t.image || '',
        category: t.category,
        isFeatured: t.is_featured,
        isFree: t.is_free,
    })) || []
}

async function getCategories() {
    const supabase = await createClient()
    
    const { data } = await supabase
        .from('categories')
        .select('name, slug')
        .order('name')
    
    return data || []
}

export default async function TemplatesPage() {
    const [templates, categories] = await Promise.all([
        getTemplates(),
        getCategories(),
    ])

    return (
        <main className="min-h-screen relative">
            {/* Global Grid Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>

            {/* Hero Header */}
            <section className="relative py-16 md:py-20 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600 ring-1 ring-inset ring-orange-200 mb-6">
                            Koleksi Lengkap
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                            Template Premium untuk{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                                Segala Kebutuhan
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Temukan template yang tepat untuk bisnis dan kehidupan personal Kamu. Semua template dilengkapi panduan lengkap.
                        </p>
                    </div>
                </div>
            </section>

            {/* Templates Section */}
            <section className="py-12">
                <div className="container mx-auto px-6">
                    <TemplatesList 
                        initialTemplates={templates} 
                        categories={categories}
                    />
                </div>
            </section>
        </main>
    )
}
