'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from './RichTextEditor'
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Sparkles, ChevronRight, ChevronLeft, LayoutPanelLeft, Lightbulb, Eye, ExternalLink } from 'lucide-react'
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

    // Manual SEO Generation & Idea Suggester
    const [isExcerptLoading, setIsExcerptLoading] = useState(false)
    const [showIdeaModal, setShowIdeaModal] = useState(false)
    const [isIdeaLoading, setIsIdeaLoading] = useState(false)
    const [ideasContent, setIdeasContent] = useState('')

    const handleSuggestIdeas = async () => {
        setIsIdeaLoading(true)
        setIdeasContent('') // Reset previous
        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: 'suggest_ideas',
                    prompt: 'Generate article ideas', // Prompt handled by system instruction mostly
                })
            })

            if (!response.ok) {
                throw new Error('Failed to generate ideas')
            }

            if (!response.body) throw new Error('No response body')

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let done = false
            let fullText = ''

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value, { stream: !done })
                // Update state progressively for streaming effect
                fullText += chunkValue
                setIdeasContent(fullText)
            }
        } catch (error: any) {
            console.error("AI Error", error)
            alert("Gagal cari ide: " + error.message)
        } finally {
            setIsIdeaLoading(false)
        }
    }

    // Called when user clicks on an idea to select it
    const handleSelectIdea = async (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement
        // Check if clicked on H3 (title) or LI (card)
        const li = target.closest('li')
        if (!li) return

        const h3 = li.querySelector('h3')
        const p = li.querySelector('p')
        if (!h3) return

        // Extract title text (remove emoji prefix if present)
        let title = h3.textContent || ''
        title = title.replace(/^[\u{1F300}-\u{1F9FF}\s]+/u, '').trim() // Remove leading emojis

        // Extract description for context
        const description = p?.textContent || ''

        // Set the title and close modal
        setFormData(prev => ({ ...prev, title }))
        setShowIdeaModal(false)
        setIdeasContent('') // Reset for next time

        toast.loading('Menulis artikel berdasarkan ide...', { id: 'generate-content' })

        // Auto-generate content
        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: 'generate',
                    context: `Buatkan artikel lengkap dengan judul: "${title}"\n\nKonteks ide: ${description}\n\nBuatkan artikel yang komprehensif, menarik, dan bermanfaat untuk target audience RSQUARE (UMKM & Profesional Indonesia). Sertakan tips praktis, contoh, dan jika relevan, rumus Excel/Google Sheets.`
                })
            })

            if (!response.ok) throw new Error('Gagal generate artikel')
            if (!response.body) throw new Error('No response body')

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let done = false
            let fullContent = ''

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value, { stream: !done })
                fullContent += chunkValue
                // Update content progressively for real-time feel
                setFormData(prev => ({ ...prev, content: fullContent }))
            }

            toast.success('Artikel berhasil dibuat! Silakan review & edit.', { id: 'generate-content' })
        } catch (error: any) {
            console.error("AI Error", error)
            toast.error('Gagal membuat artikel: ' + error.message, { id: 'generate-content' })
        }
    }

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
                    {/* Preview Button */}
                    {formData.slug && (
                        <a
                            href={`/articles/${formData.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                            title="Preview artikel di tab baru"
                        >
                            <Eye className="h-4 w-4" />
                            Preview
                            <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                    )}
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
                <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
                    {/* Title - Fixed at top */}
                    <div className="px-6 lg:px-8 pt-6 lg:pt-8 pb-4 shrink-0 bg-gray-50/50">
                        <div className="relative group">
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Judul Artikel..."
                                className="w-full px-0 py-2 border-none bg-transparent focus:ring-0 outline-none text-4xl font-bold placeholder-gray-300 text-gray-900 pr-12"
                                required
                            />
                            {/* Idea Button */}
                            <button
                                type="button"
                                onClick={() => setShowIdeaModal(true)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-yellow-500 hover:bg-yellow-50 rounded-full"
                                title="Bantu Cari Ide Artikel"
                            >
                                <Lightbulb className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* RichTextEditor - Has its own internal scroll */}
                    <div className="flex-1 px-6 lg:px-8 pb-6 min-h-0">
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

            {/* Idea Suggestions Modal */}
            <AnimatePresence>
                {showIdeaModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setShowIdeaModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                                        <Lightbulb className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Ide Artikel RSQUARE</h3>
                                        <p className="text-sm text-gray-500">Cari inspirasi topik artikel yang relevan untuk audiensmu.</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowIdeaModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <span className="sr-only">Close</span>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                                {!ideasContent && !isIdeaLoading ? (
                                    <div className="text-center py-12">
                                        <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h4 className="text-lg font-medium text-gray-900 mb-2">Butuh Inspirasi?</h4>
                                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                            AI akan menganalisis brand RSQUARE dan memberikan 5 ide artikel menarik seputar Excel, Spreadsheet, dan Produktivitas Bisnis.
                                        </p>
                                        <button
                                            onClick={handleSuggestIdeas}
                                            className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-full transition-colors shadow-lg shadow-yellow-400/20 active:scale-95"
                                        >
                                            Generate Ide Sekarang
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Clickable Ideas List */}
                                        <div
                                            onClick={handleSelectIdea}
                                            className="prose prose-orange max-w-none [&_li]:cursor-pointer [&_li]:transition-all [&_li:hover]:scale-[1.02] [&_li:hover]:shadow-md [&_li:hover]:border-orange-300"
                                            dangerouslySetInnerHTML={{ __html: ideasContent }}
                                        />
                                        {!isIdeaLoading && ideasContent && (
                                            <p className="text-center text-sm text-gray-400 mt-4">
                                                👆 Klik salah satu ide untuk langsung menggunakannya sebagai judul artikel
                                            </p>
                                        )}
                                        {isIdeaLoading && (
                                            <div className="flex items-center gap-2 text-gray-500 py-4 animate-pulse">
                                                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                                                <span className="font-medium">Sedang memikirkan ide cemerlang...</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-2">
                                <button
                                    onClick={() => setShowIdeaModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Tutup
                                </button>
                                {ideasContent && !isIdeaLoading && (
                                    <button
                                        onClick={handleSuggestIdeas}
                                        className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Sparkles className="h-4 w-4 text-yellow-500" />
                                        Buat Ide Baru
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </form >
    )
}
