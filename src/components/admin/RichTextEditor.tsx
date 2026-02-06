'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import UnderlineExtension from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { useState, useEffect, useRef } from 'react'
import React from 'react'
import {
    Bold, Italic, List, ListOrdered, Image as ImageIcon,
    Link as LinkIcon, Heading1, Heading2, Quote, Undo, Redo,
    Sparkles, Wand2, Check, Loader2, X, Underline,
    Youtube as YoutubeIcon, Link2, Code, Layout, Highlighter, Palette, Eraser
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

import { Node as TiptapNode, mergeAttributes } from '@tiptap/core'

/**
 * Custom Node for Excel Formulas (Dark UI)
 */
const BASE_FORMULA_CLASSES = 'p-4 rounded-lg font-mono text-sm shadow-sm overflow-x-auto my-4 border'

const FormulaNode = TiptapNode.create({
    name: 'formula',
    group: 'block',
    content: 'text*', // Contains only text
    draggable: true,

    addAttributes() {
        return {
            theme: {
                default: 'dark',
                parseHTML: element => element.getAttribute('data-theme'),
                renderHTML: attributes => {
                    return {
                        'data-theme': attributes.theme,
                    }
                },
            },
            class: {
                default: 'bg-slate-900 text-slate-50 border-slate-700',
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div',
                getAttrs: (node) => (node as HTMLElement).classList.contains('font-mono') && null,
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: BASE_FORMULA_CLASSES }), 0]
    },
})

/**
 * Custom Node for Illustrations (Dynamic Colors)
 */
const IllustrationNode = TiptapNode.create({
    name: 'illustration',
    group: 'block',
    content: 'block+', // Contains paragraphs/blocks
    draggable: true,

    addAttributes() {
        return {
            theme: {
                default: 'blue',
                parseHTML: element => element.getAttribute('data-theme'),
                renderHTML: attributes => {
                    return {
                        'data-theme': attributes.theme,
                    }
                },
            },
            class: {
                default: 'bg-blue-50 border-blue-200 text-blue-800',
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div',
                getAttrs: (node) => (node as HTMLElement).classList.contains('bg-blue-50') && null,
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'p-4 rounded-lg my-4 border' }), 0]
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

    // Color picker states
    const [showHighlightPicker, setShowHighlightPicker] = useState(false)
    const [showFormulaPicker, setShowFormulaPicker] = useState(false)
    const [showIllustrationPicker, setShowIllustrationPicker] = useState(false)
    const [showFontColorPicker, setShowFontColorPicker] = useState(false)
    const [showFontFamilyPicker, setShowFontFamilyPicker] = useState(false)

    const highlightPickerRef = useRef<HTMLDivElement>(null)
    const formulaPickerRef = useRef<HTMLDivElement>(null)
    const illustrationPickerRef = useRef<HTMLDivElement>(null)
    const fontColorPickerRef = useRef<HTMLDivElement>(null)
    const fontFamilyPickerRef = useRef<HTMLDivElement>(null)

    // Highlight colors
    const highlightColors = [
        { name: 'Kuning', color: '#fef08a', class: 'bg-yellow-200' },
        { name: 'Hijau', color: '#bbf7d0', class: 'bg-green-200' },
        { name: 'Biru', color: '#bfdbfe', class: 'bg-blue-200' },
        { name: 'Pink', color: '#fbcfe8', class: 'bg-pink-200' },
        { name: 'Oranye', color: '#fed7aa', class: 'bg-orange-200' },
        { name: 'Ungu', color: '#ddd6fe', class: 'bg-purple-200' },
    ]

    // Formula background colors
    const formulaColors = [
        { name: 'Dark (Default)', key: 'dark', class: 'bg-slate-900 text-slate-50 border-slate-700' },
        { name: 'Green', key: 'green', class: 'bg-emerald-900 text-emerald-50 border-emerald-700' },
        { name: 'Blue', key: 'blue', class: 'bg-blue-900 text-blue-50 border-blue-700' },
        { name: 'Purple', key: 'purple', class: 'bg-purple-900 text-purple-50 border-purple-700' },
        { name: 'Red', key: 'red', class: 'bg-red-900 text-red-50 border-red-700' },
        { name: 'Orange', key: 'orange', class: 'bg-orange-900 text-orange-50 border-orange-700' },
    ]

    // Illustration colors
    const illustrationColors = [
        { name: 'Blue (Default)', key: 'blue', class: 'bg-blue-50 border-blue-200 text-blue-800' },
        { name: 'Green', key: 'green', class: 'bg-green-50 border-green-200 text-green-800' },
        { name: 'Yellow', key: 'yellow', class: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
        { name: 'Red', key: 'red', class: 'bg-red-50 border-red-200 text-red-800' },
        { name: 'Purple', key: 'purple', class: 'bg-purple-50 border-purple-200 text-purple-800' },
        { name: 'Gray', key: 'gray', class: 'bg-gray-50 border-gray-200 text-gray-800' },
    ]

    // Font Colors
    const fontColors = [
        { name: 'Black', color: '#000000' },
        { name: 'Dark Gray', color: '#334155' },
        { name: 'Gray', color: '#64748b' },
        { name: 'Red', color: '#dc2626' },
        { name: 'Blue', color: '#2563eb' },
        { name: 'Green', color: '#16a34a' },
        { name: 'Purple', color: '#9333ea' },
        { name: 'Orange', color: '#ea580c' },
    ]

    // Font Families
    const fontFamilies = [
        { name: 'Default', value: 'Inter, sans-serif' },
        { name: 'Serif', value: 'Georgia, serif' },
        { name: 'Monospace', value: 'monospace' },
        { name: 'Cursive', value: 'cursive' },
    ]

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

    // Close color pickers when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (highlightPickerRef.current && !highlightPickerRef.current.contains(e.target as Node)) {
                setShowHighlightPicker(false)
            }
            if (formulaPickerRef.current && !formulaPickerRef.current.contains(e.target as Node)) {
                setShowFormulaPicker(false)
            }
            if (illustrationPickerRef.current && !illustrationPickerRef.current.contains(e.target as Node)) {
                setShowIllustrationPicker(false)
            }
            if (fontColorPickerRef.current && !fontColorPickerRef.current.contains(e.target as Node)) {
                setShowFontColorPicker(false)
            }
            if (fontFamilyPickerRef.current && !fontFamilyPickerRef.current.contains(e.target as Node)) {
                setShowFontFamilyPicker(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            UnderlineExtension,
            Highlight.configure({
                multicolor: true,
            }),
            TextStyle,
            Color,
            FontFamily,
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

                        <ToolbarButton
                            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                            title="Clear Format"
                        >
                            <Eraser className="h-4 w-4" />
                        </ToolbarButton>

                        {/* Highlight Color Picker */}
                        <div className="relative" ref={highlightPickerRef}>
                            <ToolbarButton
                                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                                isActive={editor.isActive('highlight')}
                                title="Highlight"
                            >
                                <Highlighter className="h-4 w-4" />
                            </ToolbarButton>
                            {showHighlightPicker && (
                                <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[120px]">
                                    <p className="text-xs text-gray-500 mb-2 font-medium">Highlight</p>
                                    <div className="grid grid-cols-3 gap-1">
                                        {highlightColors.map((c) => (
                                            <button
                                                key={c.color}
                                                type="button"
                                                onClick={() => {
                                                    editor.chain().focus().toggleHighlight({ color: c.color }).run()
                                                    setShowHighlightPicker(false)
                                                }}
                                                className={`w-7 h-7 rounded-md border border-gray-200 hover:scale-110 transition-transform ${c.class}`}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().unsetHighlight().run()
                                            setShowHighlightPicker(false)
                                        }}
                                        className="w-full mt-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors flex items-center justify-center gap-1"
                                    >
                                        <X className="h-3 w-3" /> Hapus
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Font Color Picker */}
                        <div className="relative" ref={fontColorPickerRef}>
                            <ToolbarButton
                                onClick={() => setShowFontColorPicker(!showFontColorPicker)}
                                isActive={editor.isActive('textStyle', { color: /.*/ })}
                                title="Warna Font"
                            >
                                <Palette className="h-4 w-4" />
                            </ToolbarButton>
                            {showFontColorPicker && (
                                <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[120px]">
                                    <p className="text-xs text-gray-500 mb-2 font-medium">Warna Font</p>
                                    <div className="grid grid-cols-4 gap-1">
                                        {fontColors.map((c) => (
                                            <button
                                                key={c.color}
                                                type="button"
                                                onClick={() => {
                                                    editor.chain().focus().setColor(c.color).run()
                                                    setShowFontColorPicker(false)
                                                }}
                                                className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: c.color }}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().unsetColor().run()
                                            setShowFontColorPicker(false)
                                        }}
                                        className="w-full mt-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors flex items-center justify-center gap-1"
                                    >
                                        <X className="h-3 w-3" /> Reset
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Font Family Picker */}
                        <div className="relative" ref={fontFamilyPickerRef}>
                            <button
                                type="button"
                                onClick={() => setShowFontFamilyPicker(!showFontFamilyPicker)}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 text-xs font-medium border border-transparent hover:border-gray-200 transition-all w-24 text-left truncate"
                                title="Font Family"
                            >
                                {fontFamilies.find(f => editor.isActive('textStyle', { fontFamily: f.value }))?.name || 'Font'}
                            </button>
                            {showFontFamilyPicker && (
                                <div className="absolute top-full left-0 mt-1 p-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[140px]">
                                    {fontFamilies.map((font) => (
                                        <button
                                            key={font.value}
                                            type="button"
                                            onClick={() => {
                                                editor.chain().focus().setFontFamily(font.value).run()
                                                setShowFontFamilyPicker(false)
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                                            style={{ fontFamily: font.value }}
                                        >
                                            {font.name}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().unsetFontFamily().run()
                                            setShowFontFamilyPicker(false)
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-gray-500 border-t border-gray-100 hover:bg-gray-50 rounded-b transition-colors"
                                    >
                                        Reset Default
                                    </button>
                                </div>
                            )}
                        </div>
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
                        <div className="relative" ref={formulaPickerRef}>
                            <ToolbarButton
                                onClick={() => setShowFormulaPicker(!showFormulaPicker)}
                                isActive={editor.isActive('formula')}
                                title="Formula Style"
                            >
                                <Code className="h-4 w-4" />
                            </ToolbarButton>

                            {showFormulaPicker && (
                                <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[150px]">
                                    <p className="text-xs text-gray-500 mb-2 font-medium">Style Formula</p>
                                    <div className="space-y-1">
                                        {formulaColors.map((theme) => (
                                            <button
                                                key={theme.key}
                                                type="button"
                                                onClick={() => {
                                                    // Toggle node with specific theme attributes
                                                    if (editor.isActive('formula', { theme: theme.key })) {
                                                        editor.chain().focus().toggleNode('formula', 'paragraph').run()
                                                    } else {
                                                        // Update attributes if already formula, or convert to formula
                                                        editor.chain().focus()
                                                            .toggleNode('formula', 'paragraph', {
                                                                theme: theme.key,
                                                                class: theme.class
                                                            })
                                                            .run()
                                                    }
                                                    setShowFormulaPicker(false)
                                                }}
                                                className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${editor.isActive('formula', { theme: theme.key }) ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                                                    }`}
                                            >
                                                <span className={`w-3 h-3 rounded-full border border-gray-200 ${theme.class.split(' ')[0].replace('bg-', 'bg-')}`}></span>
                                                {theme.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={illustrationPickerRef}>
                            <ToolbarButton
                                onClick={() => setShowIllustrationPicker(!showIllustrationPicker)}
                                isActive={editor.isActive('illustration')}
                                title="Illustration Style"
                            >
                                <Layout className="h-4 w-4" />
                            </ToolbarButton>

                            {showIllustrationPicker && (
                                <div className="absolute top-full right-0 mt-1 p-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[150px]">
                                    <p className="text-xs text-gray-500 mb-2 font-medium">Style Illustration</p>
                                    <div className="space-y-1">
                                        {illustrationColors.map((theme) => (
                                            <button
                                                key={theme.key}
                                                type="button"
                                                onClick={() => {
                                                    const chain = editor.chain().focus()
                                                    if (editor.isActive('illustration')) {
                                                        if (editor.isActive('illustration', { theme: theme.key })) {
                                                            chain.toggleWrap('illustration').run()
                                                        } else {
                                                            chain.updateAttributes('illustration', { theme: theme.key, class: theme.class }).run()
                                                        }
                                                    } else {
                                                        chain.toggleWrap('illustration', { theme: theme.key, class: theme.class }).run()
                                                    }
                                                    setShowIllustrationPicker(false)
                                                }}
                                                className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${editor.isActive('illustration', { theme: theme.key }) ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                                                    }`}
                                            >
                                                <span className={`w-3 h-3 rounded-full border border-gray-200 ${theme.class.split(' ')[0].replace('bg-', 'bg-')}`}></span>
                                                {theme.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
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

