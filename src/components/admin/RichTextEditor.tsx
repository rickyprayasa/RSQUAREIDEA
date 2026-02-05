'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import UnderlineExtension from '@tiptap/extension-underline'
import { useState, useEffect } from 'react'
import React from 'react'
import {
    Bold, Italic, List, ListOrdered, Image as ImageIcon,
    Link as LinkIcon, Heading1, Heading2, Quote, Undo, Redo,
    Sparkles, Wand2, Check, Loader2, X, Underline,
    Youtube as YoutubeIcon, Link2, Code, Layout
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
// useCompletion removed - using custom fetch instead
import { toast } from 'sonner' // Optional depending on setup
import { ImageUpload } from './ImageUpload'
import Youtube from '@tiptap/extension-youtube'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    editable?: boolean
}

const ToolbarButton = ({ onClick, isActive, disabled, children, title }: any) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-lg transition-colors ${isActive
            ? 'bg-orange-100 text-orange-700'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {children}
    </button>
)

import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Custom Node for Excel Formulas (Dark UI)
 */
const FormulaNode = Node.create({
    name: 'formula',
    group: 'block',
    content: 'text*', // Contains only text
    draggable: true,

    parseHTML() {
        return [
            {
                tag: 'div',
                getAttrs: (node) => (node as HTMLElement).classList.contains('bg-slate-900') && null,
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm shadow-sm overflow-x-auto my-4 border border-slate-700' }), 0]
    },
})

/**
 * Custom Node for Illustrations (Blue UI)
 */
const IllustrationNode = Node.create({
    name: 'illustration',
    group: 'block',
    content: 'block+', // Contains paragraphs/blocks
    draggable: true,

    parseHTML() {
        return [
            {
                tag: 'div',
                getAttrs: (node) => (node as HTMLElement).classList.contains('bg-blue-50') && null,
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 my-4' }), 0]
    },
})

export function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
    const [linkUrl, setLinkUrl] = useState('')
    const [showAIModal, setShowAIModal] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)
    const [aiCommand, setAiCommand] = useState<'continue' | 'outline' | 'fix'>('continue')

    // Custom AI state (replacing useCompletion)
    const [aiInput, setAiInput] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    // URL Modal State
    const [urlModal, setUrlModal] = useState<{
        isOpen: boolean
        type: 'link' | 'youtube'
        url: string
    }>({
        isOpen: false,
        type: 'link',
        url: ''
    })

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            UnderlineExtension,
            FormulaNode,
            IllustrationNode,
            Youtube.configure({
                controls: false,
            }),
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder: 'Mulai menulis cerita Anda...',
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none px-4 py-4',
            },
        },
        immediatelyRender: false // Fix hydration mismatch
    })

    // Sync external content changes to the editor (for auto-generated content)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only update if content actually differs to avoid cursor issues
            editor.commands.setContent(content, { emitUpdate: false })
        }
    }, [content, editor])

    // Custom generate function using fetch with streaming support
    const generateContent = async (cmd: string = 'generate', promptOverride?: string) => {
        if (!editor) return

        // For fix_format, we don't need prompt entry, we take the whole content
        const effectivePrompt = promptOverride || aiInput
        if (cmd === 'generate' && !effectivePrompt.trim()) return

        setIsGenerating(true)
        try {
            // Extract image from editor content
            const html = editor.getHTML() || ''
            const imgMatch = html.match(/<img[^>]+src="([^">]+)"/)
            const imageUrl = imgMatch ? imgMatch[1] : undefined

            // For fix_format and fix_grammar, send the current content as context
            const context = (cmd === 'fix_format' || cmd === 'fix_grammar') ? html : undefined

            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: effectivePrompt,
                    command: cmd,
                    context: context,
                    imageUrl: imageUrl
                })
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'Failed to generate content')
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
                console.log("AI content received, length:", fullText.length)

                if (cmd === 'fix_format' || cmd === 'fix_grammar') {
                    // Replace entire content
                    editor.commands.setContent(fullText)
                    toast.success(cmd === 'fix_format' ? 'Format artikel berhasil dirapikan!' : 'Typo dan ejaan berhasil diperbaiki!')
                } else {
                    editor.chain().focus().insertContent(fullText).run()
                }

                setShowAIModal(false)
                setAiInput('')
            }
        } catch (error: any) {
            console.error('AI Generation Error:', error)
            alert('AI Error: ' + (error.message || 'Failed to generate content'))
        } finally {
            setIsGenerating(false)
        }
    }

    if (!editor) {
        return null
    }

    const setLink = () => {
        const previousUrl = editor?.getAttributes('link').href || ''
        setUrlModal({
            isOpen: true,
            type: 'link',
            url: previousUrl
        })
    }

    const addImage = () => {
        setShowImageModal(true)
    }

    const handleImageUpload = (url: string) => {
        if (url) {
            editor?.chain().focus().setImage({ src: url }).run()
            setShowImageModal(false)
        }
    }

    const addYoutubeVideo = () => {
        setUrlModal({
            isOpen: true,
            type: 'youtube',
            url: ''
        })
    }

    const handleUrlSubmit = () => {
        const { type, url } = urlModal

        if (type === 'link') {
            if (url === '') {
                editor?.chain().focus().extendMarkRange('link').unsetLink().run()
            } else {
                editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
            }
        } else if (type === 'youtube') {
            if (url) {
                editor?.commands.setYoutubeVideo({
                    src: url,
                    width: 640,
                    height: 480,
                })
            }
        }

        setUrlModal(prev => ({ ...prev, isOpen: false }))
    }

    return (
        <div className="border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col h-full">
            {/* Toolbar - Fixed at top of editor */}
            {editable && (
                <div className="border-b border-gray-100 bg-gray-50/95 p-2 flex flex-wrap gap-1 items-center z-10 backdrop-blur-md rounded-t-2xl shrink-0">
                    {/* Undo / Redo */}
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo className="h-4 w-4" />
                        </ToolbarButton>
                    </div>

                    {/* Text Formatting */}
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            isActive={editor.isActive('bold')}
                            title="Bold"
                        >
                            <Bold className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            isActive={editor.isActive('italic')}
                            title="Italic"
                        >
                            <Italic className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            isActive={editor.isActive('underline')}
                            title="Underline"
                        >
                            <Underline className="h-4 w-4" />
                        </ToolbarButton>
                    </div>

                    {/* Headings */}
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            isActive={editor.isActive('heading', { level: 2 })}
                            title="Heading 2"
                        >
                            <Heading1 className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            isActive={editor.isActive('heading', { level: 3 })}
                            title="Heading 3"
                        >
                            <Heading2 className="h-4 w-4" />
                        </ToolbarButton>
                    </div>

                    {/* Lists */}
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            isActive={editor.isActive('bulletList')}
                            title="Bullet List"
                        >
                            <List className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            isActive={editor.isActive('orderedList')}
                            title="Ordered List"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </ToolbarButton>
                    </div>

                    {/* Insert */}
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
                        <ToolbarButton
                            onClick={setLink}
                            isActive={editor.isActive('link')}
                            title="Link"
                        >
                            <LinkIcon className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={addImage}
                            title="Image"
                        >
                            <ImageIcon className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={addYoutubeVideo}
                            title="Insert Youtube Video"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                                <path d="m10 15 5-3-5-3z" />
                            </svg>
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            isActive={editor.isActive('blockquote')}
                            title="Quote"
                        >
                            <Quote className="h-4 w-4" />
                        </ToolbarButton>
                    </div>

                    {/* Custom Blocks */}
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleNode('formula', 'paragraph').run()}
                            isActive={editor.isActive('formula')}
                            title="Formula Style (Dark)"
                        >
                            <Code className="h-4 w-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleWrap('illustration').run()}
                            isActive={editor.isActive('illustration')}
                            title="Illustration Style (Blue)"
                        >
                            <Layout className="h-4 w-4" />
                        </ToolbarButton>
                    </div>

                    {/* AI Buttons */}
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            type="button"
                            onClick={() => generateContent('fix_format')}
                            disabled={isGenerating}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                            title="Rapikan format HTML otomatis"
                        >
                            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 text-green-500" />}
                            Rapikan Format
                        </button>

                        <button
                            type="button"
                            onClick={() => generateContent('fix_grammar')}
                            disabled={isGenerating}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                            title="Koreksi typo dan ejaan otomatis"
                        >
                            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3 text-blue-500" />}
                            Cek Typo
                        </button>

                        <motion.button
                            type="button"
                            onClick={() => setShowAIModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Sparkles className="h-3 w-3" />
                            AI Write
                        </motion.button>
                    </div>
                </div>
            )}

            {/* AI Modal */}
            <AnimatePresence>
                {showAIModal && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
                    >
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    AI Writing Assistant
                                </h3>
                                <button onClick={() => setShowAIModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="ai-input" className="block text-sm font-medium text-gray-700 mb-2">
                                    Apa yang ingin Anda tulis?
                                </label>
                                <textarea
                                    id="ai-input"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    rows={4}
                                    placeholder="Contoh: 'Tulis paragraf tentang manfaat meditasi', 'Lanjutkan cerita ini', 'Buat kerangka artikel tentang AI'"
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    disabled={isGenerating}
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setShowAIModal(false)}
                                    className="text-gray-500 text-sm hover:text-gray-700 font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => generateContent('generate')}
                                    disabled={isGenerating || !aiInput.trim()}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Generate
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Upload Modal */}
            <AnimatePresence>
                {showImageModal && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
                    >
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-blue-500" />
                                    Upload Gambar
                                </h3>
                                <button onClick={() => setShowImageModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <ImageUpload onChange={handleImageUpload} bucket="thumbnails" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* URL Modal */}
            <AnimatePresence>
                {urlModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    >
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    {urlModal.type === 'link' ? (
                                        <>
                                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                <Link2 className="h-5 w-5" />
                                            </div>
                                            Tambahkan Link
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                                <YoutubeIcon className="h-5 w-5" />
                                            </div>
                                            Embed Youtube
                                        </>
                                    )}
                                </h3>
                                <button
                                    onClick={() => setUrlModal(prev => ({ ...prev, isOpen: false }))}
                                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        {urlModal.type === 'link' ? 'URL Link' : 'URL Video Youtube'}
                                    </label>
                                    <input
                                        type="url"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 placeholder:text-gray-400"
                                        placeholder={urlModal.type === 'link' ? 'https://example.com' : 'https://youtube.com/watch?v=...'}
                                        value={urlModal.url}
                                        onChange={(e) => setUrlModal(prev => ({ ...prev, url: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleUrlSubmit()
                                        }}
                                        autoFocus
                                    />
                                    {urlModal.type === 'youtube' && (
                                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                            <span className="inline-block w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">i</span>
                                            Paste link video Youtube, player akan muncul otomatis.
                                        </p>
                                    )}
                                    {urlModal.type === 'link' && (
                                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                            <span className="inline-block w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">i</span>
                                            Link akan diterapkan pada teks yang dipilih.
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={() => setUrlModal(prev => ({ ...prev, isOpen: false }))}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors hover:border-gray-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleUrlSubmit}
                                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-95 ${urlModal.type === 'link'
                                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                                            : 'bg-red-600 hover:bg-red-700 shadow-red-500/25'
                                            }`}
                                    >
                                        {urlModal.type === 'link' ? 'Simpan Link' : 'Embed Video'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editor Area - Scrollable content */}
            <div className="flex-1 bg-white overflow-y-auto custom-scrollbar rounded-b-2xl">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}

