'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from './RichTextEditor'
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Sparkles, ChevronRight, ChevronLeft, LayoutPanelLeft } from 'lucide-react'
import { ImageUpload } from './ImageUpload'
import Link from 'next/link'
import { useCompletion } from '@ai-sdk/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Article {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    content?: string | null
    thumbnail_url?: string | null
    youtube_url?: string | null
    published: boolean
}

interface ArticleEditorProps {
    article?: Article
    isNew?: boolean
}

export function ArticleEditor({ article, isNew = false }: ArticleEditorProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [showSidebar, setShowSidebar] = useState(true)
    const [formData, setFormData] = useState({
        title: article?.title || '',
        slug: article?.slug || '',
        excerpt: article?.excerpt || '',
        content: article?.content || '',
        thumbnail_url: article?.thumbnail_url || '',
        youtube_url: article?.youtube_url || '',
        published: article?.published || false,
    })

    // Manual SEO Generation
    const [isExcerptLoading, setIsExcerptLoading] = useState(false)

    const handleGenerateExcerpt = async () => {
        if (!formData.title && !formData.content) {
            alert('Harap isi judul atau konten terlebih dahulu.')
            return
        }

        setIsExcerptLoading(true)
        try {
            const context = `Judul: ${formData.title}\n\nKonten Awal: ${formData.content?.substring(0, 1000) || ''} ...`

            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: 'generate',
                    prompt: '', // Not used when context is specific
                    context: `Buatkan deskripsi singkat (excerpt) yang menarik untuk SEO (maksimal 160 karakter) berdasarkan artikel ini:\n\n${context}`
                })
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'Failed to generate excerpt')
            }

            if (!response.body) throw new Error('No response body')

            // Read the stream
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let done = false
            let fullText = ''

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value, { stream: !done })
                fullText += chunkValue
            }

            if (fullText) {
                // Strip HTML tags if present (e.g. <p>...</p>) since excerpt should be plain text usually
                // But if the AI returns HTML as per system instruction, we might want to strip it.
                // The system instruction generally enforces HTML for 'generate' command.
                // However, for excerpt, we probably just want plain text. 
                // Let's strip tags just in case.
                const cleanText = fullText.replace(/<[^>]*>?/gm, '').trim()
                setFormData(prev => ({ ...prev, excerpt: cleanText }))
                toast.success('Excerpt berhasil dibuat!')
            }
        } catch (error: any) {
            console.error("AI Error", error)
            alert("Gagal generate excerpt: " + error.message)
        } finally {
            setIsExcerptLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }))
    }

    const saveArticle = async (data: typeof formData, isPublishAction = false) => {
        const loader = isPublishAction ? setIsPublishing : setLoading
        loader(true)

        try {
            const url = isNew ? '/api/admin/articles' : `/api/admin/articles/${article?.id}`
            const method = isNew ? 'POST' : 'PATCH'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error('Failed to save article')

            const responseData = await res.json()

            if (isPublishAction) {
                toast.success(data.published ? 'Artikel berhasil dipublish!' : 'Artikel dikembalikan ke draft')
            } else {
                toast.success('Artikel berhasil disimpan')
            }

            router.refresh()
            if (isNew && !isPublishAction) {
                // If it was a new article and we saved it, we might want to redirect to edit mode or just stay
                // For now let's go back to list as per original behavior or maybe stay?
                // Original behavior was push to /admin/articles
                router.push('/admin/articles')
            }
        } catch (error) {
            console.error('Error saving article:', error)
            toast.error('Gagal menyimpan artikel')
        } finally {
            loader(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await saveArticle(formData)
    }

    const handlePublish = async () => {
        const newPublishedState = !formData.published
        setFormData(prev => ({ ...prev, published: newPublishedState }))
        await saveArticle({ ...formData, published: newPublishedState }, true)
    }

    return (
        <form onSubmit={handleSubmit} className="h-[calc(100vh-65px)] flex flex-col overflow-hidden bg-gray-50/50">
            {/* Header Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/articles"
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {isNew ? 'Buat Artikel Baru' : 'Edit Artikel'}
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            {loading || isPublishing ? (
                                <span className="flex items-center gap-1.5 text-orange-600 font-medium animate-pulse">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Menyimpan...
                                </span>
                            ) : (
                                <>
                                    <span className={formData.published ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                                        {formData.published ? 'Published' : 'Draft'}
                                    </span>
                                    <span>•</span>
                                    <span>{formData.content?.length || 0} karakter</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={`p-2 rounded-lg transition-colors border ${showSidebar ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        title={showSidebar ? "Sembunyikan Sidebar" : "Tampilkan Sidebar SEO"}
                    >
                        <LayoutPanelLeft className="h-5 w-5" />
                    </button>
                    <div className="h-6 w-px bg-gray-200 mx-1" />
                    <button
                        type="button"
                        onClick={handlePublish}
                        disabled={loading || isPublishing}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 ${formData.published
                            ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            } disabled:opacity-50`}
                    >
                        {isPublishing && <Loader2 className="h-3 w-3 animate-spin" />}
                        {formData.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                        type="submit"
                        disabled={loading || isPublishing}
                        className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors disabled:opacity-50 shadow-sm shadow-orange-200"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Simpan
                    </button>
                </div>
            </div>

            {/* Main Content Area - Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor (Left) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 max-w-5xl mx-auto w-full">
                    <div className="space-y-6">
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Judul Artikel..."
                            className="w-full px-0 py-2 border-none bg-transparent focus:ring-0 outline-none text-4xl font-bold placeholder-gray-300 text-gray-900"
                            required
                        />
                        <RichTextEditor
                            content={formData.content || ''}
                            onChange={handleContentChange}
                        />
                    </div>
                </div>

                {/* Sidebar (Right) - Collapsible */}
                <AnimatePresence initial={false}>
                    {showSidebar && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 350, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="border-l border-gray-200 bg-white shadow-xl z-10 flex flex-col shrink-0"
                        >
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Pengaturan Artikel</h3>
                                <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-gray-600">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* SEO Section */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">SEO & Metadata</h4>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL</label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            placeholder="judul-artikel-anda"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm"
                                        />
                                        <p className="mt-1 text-xs text-gray-400 truncate">rsquareidea.my.id/articles/{formData.slug}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                                            <button
                                                type="button"
                                                onClick={handleGenerateExcerpt}
                                                disabled={isExcerptLoading}
                                                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                                            >
                                                {isExcerptLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                                Auto Generate
                                            </button>
                                        </div>
                                        <textarea
                                            name="excerpt"
                                            value={formData.excerpt || ''}
                                            onChange={handleChange}
                                            placeholder="Deskripsi singkat untuk hasil pencarian Google..."
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm h-28 resize-none"
                                        />
                                        <p className="mt-1 text-xs text-gray-400 text-right">Maks. 160 karakter disarankan</p>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Media Section */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Media</h4>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                                        <ImageUpload
                                            value={formData.thumbnail_url || ''}
                                            onChange={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
                                            onRemove={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                                            bucket="thumbnails"
                                            folder="articles"
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Youtube URL (Opsional)</label>
                                        <input
                                            type="url"
                                            name="youtube_url"
                                            value={formData.youtube_url || ''}
                                            onChange={handleChange}
                                            placeholder="https://youtube.com/watch?v=..."
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm"
                                        />
                                        <p className="mt-1 text-xs text-gray-400">Video akan tampil di bawah artikel.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </form>
    )
}
