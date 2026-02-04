'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, FileText, Pencil, Calendar, Eye } from 'lucide-react'
import { DeleteArticleButton } from './DeleteArticleButton'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string | null
    published: boolean
    created_at: string
    thumbnail_url: string | null
    // Add other fields as needed
}

interface ArticlesTableProps {
    articles: Article[]
}

export function ArticlesTable({ articles }: ArticlesTableProps) {
    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Artikel</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Kelola artikel blog untuk SEO</p>
                </div>
                <Link
                    href="/admin/articles/new"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Buat Artikel
                </Link>
            </div>

            {/* Empty state */}
            {articles.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 md:p-12 text-center border border-gray-200 shadow-lg">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Belum ada artikel</p>
                    <Link
                        href="/admin/articles/new"
                        className="inline-flex items-center gap-1 mt-2 text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Buat artikel pertama
                    </Link>
                </div>
            ) : (
                <>
                    {/* Mobile: Card layout */}
                    <div className="md:hidden space-y-3">
                        {articles.map((article) => (
                            <motion.div
                                key={article.id}
                                className="bg-white rounded-2xl p-4 border border-gray-200 shadow-lg"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{article.title}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${article.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {article.published ? 'Published' : 'Draft'}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(article.created_at), 'd MMM yyyy', { locale: id })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100 gap-1">
                                    <Link
                                        href={`/articles/${article.slug}`} // Public link preview
                                        target="_blank"
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={`/admin/articles/${article.id}`}
                                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                    <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Desktop: Table layout */}
                    <motion.div
                        className="hidden md:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {articles.map((article, index) => (
                                        <motion.tr
                                            key={article.id}
                                            className="hover:bg-gray-50"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{article.title}</p>
                                                        <p className="text-sm text-gray-500">{article.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${article.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {article.published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {format(new Date(article.created_at), 'd MMMM yyyy', { locale: id })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/articles/${article.slug}`}
                                                        target="_blank"
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Live"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/articles/${article.id}`}
                                                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    )
}
