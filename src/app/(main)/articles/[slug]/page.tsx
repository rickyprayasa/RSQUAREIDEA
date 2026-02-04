import { createAdminClient, createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'
import { ArticleBackground } from '@/components/ui/ArticleBackground'
import { ClientLordIcon } from '@/components/ui/lordicon'
import { ViewCounter } from '@/components/articles/ViewCounter'

type Props = {
    params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
    const supabase = await createAdminClient()
    const authClient = await createClient()

    const { data: { user } } = await authClient.auth.getUser()

    let query = supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)

    // Only filter by published if NOT logged in
    if (!user) {
        query = query.eq('published', true)
    }

    const { data: article, error } = await query.single()

    if (error) {
        console.error('Error fetching article:', error)
        return null
    }

    return article
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const article = await getArticle(slug)

    if (!article) {
        return {
            title: 'Artikel Tidak Ditemukan',
        }
    }

    return {
        title: `${article.title} | RSQUARE IDEA`,
        description: article.excerpt || article.title,
        openGraph: {
            title: article.title,
            description: article.excerpt || '',
            url: `https://rsquareidea.my.id/articles/${slug}`,
            type: 'article',
            publishedTime: article.created_at,
            authors: ['RSQUARE'],
            images: article.thumbnail_url ? [article.thumbnail_url] : [],
        },
    }
}

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params
    const article = await getArticle(slug)

    if (!article) {
        notFound()
    }

    const words = article.content?.split(' ').length || 0
    const readTime = Math.ceil(words / 200)

    return (
        <div className="min-h-screen relative overflow-hidden">
            <ViewCounter slug={slug} />
            <ArticleBackground />

            {/* Hero / Header */}
            <div className="relative pt-32 pb-16">
                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                    {/* Draft Preview Indicator */}
                    {!article.published && (
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-medium text-yellow-800 border border-yellow-200 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                            </span>
                            Mode Preview (Draft)
                        </div>
                    )}

                    <Link
                        href="/articles"
                        className="group inline-flex items-center text-sm font-medium text-gray-500 hover:text-orange-600 mb-8 transition-colors"
                    >
                        <div className="mr-2 transform group-hover:-translate-x-1 transition-transform" style={{ transform: 'rotate(180deg)' }}>
                            <ClientLordIcon
                                src="https://cdn.lordicon.com/zmkotitn.json"
                                trigger="hover"
                                colors="primary:#fb923c,secondary:#fbbf24"
                                style={{ width: '20px', height: '20px' }}
                            />
                        </div>
                        Kembali ke Artikel
                    </Link>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 border-b border-gray-100 pb-8">
                        <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white shadow-sm border border-gray-100">
                                <Image
                                    src="/images/rsquare-logo.png"
                                    alt="RSQUARE Logo"
                                    fill
                                    className="object-cover p-1"
                                />
                            </div>
                            <span className="font-bold text-gray-800">RSQUARE</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ClientLordIcon
                                src="https://cdn.lordicon.com/wmlleaaf.json"
                                trigger="loop-on-hover"
                                colors="primary:#fb923c,secondary:#fbbf24"
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span>{format(new Date(article.created_at), 'd MMMM yyyy', { locale: idLocale })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ClientLordIcon
                                src="https://cdn.lordicon.com/vfczflna.json"
                                trigger="loop-on-hover"
                                colors="primary:#fb923c,secondary:#fbbf24"
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span>{readTime} menit baca</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <article className="relative container mx-auto px-4 max-w-4xl pb-24 z-10">
                {/* Card wrapper for content */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-12 relative overflow-hidden">
                    {/* Decorative gradient blob */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -mr-32 -mt-32 pointer-events-none"></div>

                    {article.thumbnail_url && (
                        <div className="mb-12 aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={article.thumbnail_url}
                                alt={article.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    )}

                    {/* Article Content */}
                    <div
                        className="prose prose-lg prose-orange max-w-none 
                            prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                            prose-p:text-gray-600 prose-p:leading-8
                            prose-a:text-orange-600 hover:prose-a:text-orange-700 
                            prose-img:rounded-2xl prose-img:shadow-lg prose-img:border prose-img:border-gray-100
                            prose-strong:text-gray-900 prose-strong:font-bold
                            prose-ul:text-gray-600 prose-ol:text-gray-600
                            prose-li:marker:text-orange-500
                            prose-blockquote:border-l-orange-500 prose-blockquote:bg-orange-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic"
                        dangerouslySetInnerHTML={{ __html: article.content || '' }}
                    />

                    {/* Youtube Section */}
                    {article.youtube_url && (
                        <div className="mt-16 pt-10 border-t border-gray-100">
                            <div className="bg-orange-50/50 rounded-2xl border border-orange-100 p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-red-100/50 text-red-600 rounded-xl">
                                        <ClientLordIcon
                                            src="https://cdn.lordicon.com/aklfruoc.json"
                                            trigger="loop-on-hover"
                                            colors="primary:#ef4444,secondary:#dc2626"
                                            style={{ width: '28px', height: '28px' }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Video Penjelasan</h3>
                                        <p className="text-gray-600 text-sm">Simak video berikut untuk pemahaman lebih dalam</p>
                                    </div>
                                </div>

                                <div className="relative aspect-video rounded-xl overflow-hidden shadow-md bg-black">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${article.youtube_url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|embed\/)([^#&?]*).*/)?.[1] || ''}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Section */}
                <div className="mt-12 pt-10 border-t border-gray-200/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <Link
                            href="/articles"
                            className="group inline-flex items-center gap-3 px-6 py-3.5 bg-white border border-gray-200 hover:border-orange-200 rounded-xl text-gray-700 font-medium hover:bg-orange-50 transition-all shadow-sm hover:shadow"
                        >
                            <div className="transform group-hover:-translate-x-1 transition-transform" style={{ transform: 'rotate(180deg)' }}>
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/zmkotitn.json"
                                    trigger="hover"
                                    colors="primary:#fb923c,secondary:#fbbf24"
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </div>
                            Lihat Semua Artikel
                            <div className="transform group-hover:translate-x-1 transition-transform">
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/wxnxiano.json"
                                    trigger="hover"
                                    colors="primary:#fb923c,secondary:#fbbf24"
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </div>
                        </Link>
                        <Link
                            href="/templates"
                            className="group inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5"
                        >
                            <ClientLordIcon
                                src="https://cdn.lordicon.com/pflszboa.json"
                                trigger="loop-on-hover"
                                colors="primary:#ffffff,secondary:#ffffff"
                                style={{ width: '20px', height: '20px' }}
                            />
                            Jelajahi Templates
                            <div className="transform group-hover:translate-x-1 transition-transform">
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/whtfgdfm.json"
                                    trigger="hover"
                                    colors="primary:#ffffff,secondary:#ffffff"
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </div>
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    )
}
