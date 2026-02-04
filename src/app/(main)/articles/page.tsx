import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Metadata } from 'next'
import { Calendar, ArrowRight, BookOpen, Eye } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Artikel & Tutorial | RSQUARE IDEA',
    description: 'Kumpulan artikel dan tutorial seputar Google Sheets, bisnis, dan produktivitas.',
}

async function getArticles() {
    const supabase = await createClient()
    const { data: articles } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

    return articles || []
}

import { ArticleBackground } from '@/components/ui/ArticleBackground'
import { differenceInDays } from 'date-fns'

// ... existing imports ...

export default async function ArticlesIndexPage() {
    const articles = await getArticles()

    return (
        <div className="min-h-screen relative">
            <ArticleBackground />

            <div className="container mx-auto px-4 max-w-6xl pt-32 pb-20">
                <div className="text-center mb-16 relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-4 border border-orange-200">
                        Blog & Edukasi
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        Wawasan & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Tutorial</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Kumpulan panduan praktis Google Sheets, tips produktivitas, dan strategi bisnis untuk membantu Anda bekerja lebih cerdas.
                    </p>
                </div>

                {articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                href={`/articles/${article.slug}`}
                                className="group bg-white rounded-3xl overflow-hidden shadow-md border border-gray-200 flex flex-col h-full hover:shadow-xl hover:border-orange-300 transform hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="aspect-video relative overflow-hidden bg-gray-100">
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                    {article.thumbnail_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={article.thumbnail_url}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                                            <span className="text-5xl font-bold opacity-20">RSQ</span>
                                        </div>
                                    )}

                                </div>

                                <div className="p-6 flex flex-col flex-1 relative">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-orange-100 tracking-wide">
                                            ARTICLE
                                        </span>
                                        {differenceInDays(new Date(), new Date(article.created_at)) <= 7 && (
                                            <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-red-100 animate-pulse">
                                                BARU
                                            </span>
                                        )}
                                        <span className="text-gray-300 text-[10px]">•</span>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(new Date(article.created_at), 'd MMM yyyy', { locale: idLocale })}
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                                        {article.title}
                                    </h2>

                                    <p className="text-gray-500 mb-6 line-clamp-2 text-sm leading-relaxed flex-1">
                                        {article.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Eye className="h-4 w-4" />
                                            <span className="text-xs font-medium">{article.views || 0}</span>
                                        </div>

                                        <div className="flex items-center text-orange-600 group-hover:text-orange-700 transition-colors text-sm font-bold">
                                            BACA ARTIKEL
                                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 relative z-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada artikel</h3>
                        <p className="text-gray-500">Nantikan update artikel terbaru kami segera.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
