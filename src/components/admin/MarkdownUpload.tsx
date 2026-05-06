'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, Check, Eye, Sparkles, AlertCircle, Wand2, Loader2 } from 'lucide-react'

interface ParsedMarkdown {
    description: string
    features: string[]
    title?: string
}

interface MarkdownUploadProps {
    onApply: (data: ParsedMarkdown) => void
}

function parseMarkdown(content: string): ParsedMarkdown {
    const lines = content.split('\n')
    let description = ''
    let features: string[] = []
    let title = ''

    let currentSection: 'none' | 'description' | 'features' | 'other' = 'none'
    const descriptionParts: string[] = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Detect headings
        if (line.startsWith('#')) {
            const headingText = line.replace(/^#+\s*/, '').toLowerCase()

            // Extract title from first h1
            if (line.startsWith('# ') && !title) {
                title = line.replace(/^#\s*/, '')
                currentSection = 'none'
                continue
            }

            // Check for description-related headings
            if (
                headingText.includes('deskripsi') ||
                headingText.includes('description') ||
                headingText.includes('about') ||
                headingText.includes('tentang') ||
                headingText.includes('ringkasan') ||
                headingText.includes('summary') ||
                headingText.includes('overview')
            ) {
                currentSection = 'description'
                continue
            }

            // Check for feature-related headings
            if (
                headingText.includes('fitur') ||
                headingText.includes('feature') ||
                headingText.includes('keunggulan') ||
                headingText.includes('kelebihan') ||
                headingText.includes('highlight') ||
                headingText.includes('capability') ||
                headingText.includes('kemampuan')
            ) {
                currentSection = 'features'
                continue
            }

            currentSection = 'other'
            continue
        }

        // Skip empty lines
        if (!line) continue

        // Parse list items as features
        const listMatch = line.match(/^[-*+]\s+(.+)/)
        if (listMatch) {
            if (currentSection === 'features' || currentSection === 'none') {
                let featureText = listMatch[1]
                    .replace(/\*\*(.+?)\*\*/g, '$1')
                    .replace(/\*(.+?)\*/g, '$1')
                    .replace(/`(.+?)`/g, '$1')
                    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
                    .trim()
                if (featureText) {
                    features.push(featureText)
                }
            }
            continue
        }

        // Numbered list items as features
        const numberedMatch = line.match(/^\d+[.)]\s+(.+)/)
        if (numberedMatch) {
            if (currentSection === 'features' || currentSection === 'none') {
                let featureText = numberedMatch[1]
                    .replace(/\*\*(.+?)\*\*/g, '$1')
                    .replace(/\*(.+?)\*/g, '$1')
                    .replace(/`(.+?)`/g, '$1')
                    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
                    .trim()
                if (featureText) {
                    features.push(featureText)
                }
            }
            continue
        }

        // Regular paragraphs → description
        if (currentSection === 'description' || currentSection === 'none') {
            const cleanLine = line
                .replace(/\*\*(.+?)\*\*/g, '$1')
                .replace(/\*(.+?)\*/g, '$1')
                .replace(/`(.+?)`/g, '$1')
                .replace(/\[(.+?)\]\(.+?\)/g, '$1')
                .trim()
            if (cleanLine) {
                descriptionParts.push(cleanLine)
            }
        }
    }

    description = descriptionParts.join(' ').trim()

    // If no description found, use first meaningful paragraph
    if (!description && lines.length > 0) {
        for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('*') && !trimmed.match(/^\d+[.)]/)) {
                description = trimmed
                    .replace(/\*\*(.+?)\*\*/g, '$1')
                    .replace(/\*(.+?)\*/g, '$1')
                    .replace(/`(.+?)`/g, '$1')
                    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
                break
            }
        }
    }

    return { description, features, title }
}

export function MarkdownUpload({ onApply }: MarkdownUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [fileName, setFileName] = useState('')
    const [rawContent, setRawContent] = useState('')
    const [parsed, setParsed] = useState<ParsedMarkdown | null>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [error, setError] = useState('')
    const [applied, setApplied] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiEnhanced, setAiEnhanced] = useState(false)
    const [aiError, setAiError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback((file: File) => {
        setError('')
        setApplied(false)
        setAiEnhanced(false)
        setAiError('')

        if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown') && !file.name.endsWith('.txt')) {
            setError('Format file harus .md, .markdown, atau .txt')
            return
        }

        if (file.size > 1024 * 1024) {
            setError('Ukuran file maksimal 1MB')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result as string
            setRawContent(content)
            setFileName(file.name)
            const result = parseMarkdown(content)
            setParsed(result)
            setShowPreview(true)
        }
        reader.onerror = () => {
            setError('Gagal membaca file')
        }
        reader.readAsText(file)
    }, [])

    const handleAiEnhance = async () => {
        if (!rawContent) return

        setAiLoading(true)
        setAiError('')
        setAiEnhanced(false)

        try {
            const response = await fetch('/api/ai/enhance-markdown', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markdownContent: rawContent }),
            })

            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.error || 'Gagal memproses dengan AI')
            }

            const data = await response.json()
            setParsed({
                description: data.description || parsed?.description || '',
                features: data.features?.length > 0 ? data.features : (parsed?.features || []),
                title: data.title || parsed?.title || '',
            })
            setAiEnhanced(true)
            setShowPreview(true)
        } catch (err) {
            setAiError(err instanceof Error ? err.message : 'Terjadi kesalahan saat AI enhance')
        } finally {
            setAiLoading(false)
        }
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleFile(files[0])
        }
    }, [handleFile])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFile(files[0])
        }
    }, [handleFile])

    const handleApply = () => {
        if (parsed) {
            onApply(parsed)
            setApplied(true)
            setTimeout(() => setApplied(false), 3000)
        }
    }

    const handleReset = () => {
        setFileName('')
        setRawContent('')
        setParsed(null)
        setShowPreview(false)
        setError('')
        setApplied(false)
        setAiEnhanced(false)
        setAiError('')
        setAiLoading(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        Upload Ringkasan Aplikasi (Markdown)
                    </span>
                </label>
                {fileName && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Reset
                    </button>
                )}
            </div>

            {/* Drop Zone */}
            {!fileName ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 ${
                        isDragging
                            ? 'border-emerald-400 bg-emerald-50 scale-[1.02]'
                            : 'border-gray-300 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                >
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${
                            isDragging
                                ? 'bg-emerald-200 text-emerald-600 scale-110 rotate-3'
                                : 'bg-gray-200 text-gray-400'
                        }`}>
                            <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            {isDragging ? 'Lepaskan file di sini' : 'Drag & drop file markdown'}
                        </p>
                        <p className="text-xs text-gray-400">
                            Format: .md, .markdown, .txt — Maks. 1MB
                        </p>
                        <button
                            type="button"
                            className="mt-3 px-4 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-100 rounded-full hover:bg-emerald-200 transition-colors"
                        >
                            Pilih File
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".md,.markdown,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            ) : (
                /* File Loaded State */
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 overflow-hidden">
                    {/* File Info Bar */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border-b border-emerald-100">
                        <div className="w-8 h-8 rounded-lg bg-emerald-200 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                            <p className="text-xs text-gray-500">
                                {parsed?.features.length || 0} fitur terdeteksi • {parsed?.description ? 'Deskripsi ditemukan' : 'Tidak ada deskripsi'}
                                {aiEnhanced && (
                                    <span className="ml-1 text-violet-600 font-medium">• ✨ AI Enhanced</span>
                                )}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className={`p-2 rounded-lg transition-colors ${
                                showPreview 
                                    ? 'bg-emerald-200 text-emerald-700' 
                                    : 'bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600'
                            }`}
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>

                    {/* AI Enhance Bar */}
                    <div className="px-4 py-2.5 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-violet-700 flex items-center gap-1.5">
                                <Wand2 className="w-3.5 h-3.5" />
                                {aiEnhanced 
                                    ? 'Deskripsi & fitur telah dioptimasi oleh AI ✨' 
                                    : 'Gunakan AI untuk generate deskripsi & fitur yang lebih profesional'
                                }
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAiEnhance}
                            disabled={aiLoading}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                                aiLoading
                                    ? 'bg-violet-100 text-violet-400 cursor-wait'
                                    : aiEnhanced
                                        ? 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                                        : 'bg-violet-500 text-white hover:bg-violet-600 shadow-md shadow-violet-200/50'
                            }`}
                        >
                            {aiLoading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Memproses...
                                </>
                            ) : aiEnhanced ? (
                                <>
                                    <Wand2 className="w-3.5 h-3.5" />
                                    Enhance Ulang
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-3.5 h-3.5" />
                                    AI Enhance
                                </>
                            )}
                        </button>
                    </div>

                    {/* AI Error */}
                    {aiError && (
                        <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2 text-xs text-red-600">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            {aiError}
                        </div>
                    )}

                    {/* Preview Panel */}
                    {showPreview && parsed && (
                        <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                            {/* Title Preview */}
                            {parsed.title && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Judul {aiEnhanced && <span className="text-violet-500">✨</span>}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 bg-white rounded-lg p-3 border border-gray-100">
                                        {parsed.title}
                                    </p>
                                </div>
                            )}

                            {/* Description Preview */}
                            {parsed.description && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Deskripsi {aiEnhanced && <span className="text-violet-500">✨</span>}
                                    </p>
                                    <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100 leading-relaxed">
                                        {parsed.description.length > 300 
                                            ? parsed.description.substring(0, 300) + '...' 
                                            : parsed.description
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Features Preview */}
                            {parsed.features.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Fitur ({parsed.features.length}) {aiEnhanced && <span className="text-violet-500">✨</span>}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {parsed.features.map((feature, index) => (
                                            <span
                                                key={index}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs ${
                                                    aiEnhanced
                                                        ? 'bg-violet-50 border border-violet-100 text-violet-700'
                                                        : 'bg-white border border-gray-100 text-gray-700'
                                                }`}
                                            >
                                                <Sparkles className={`w-3 h-3 ${aiEnhanced ? 'text-violet-400' : 'text-emerald-500'}`} />
                                                {feature.length > 50 ? feature.substring(0, 50) + '...' : feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Raw Content Collapsible */}
                            <details className="group">
                                <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors">
                                    Raw Markdown
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-900 text-gray-300 rounded-lg p-3 overflow-x-auto max-h-40 overflow-y-auto font-mono">
                                    {rawContent}
                                </pre>
                            </details>
                        </div>
                    )}

                    {/* Apply Button */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-emerald-100">
                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={applied}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                                applied
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200/50 hover:shadow-lg'
                            }`}
                        >
                            {applied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Berhasil Diterapkan!
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Terapkan ke Deskripsi & Fitur
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            <p className="text-xs text-gray-400">
                Upload file ringkasan aplikasi format markdown. Gunakan <strong className="text-violet-500">AI Enhance</strong> untuk generate deskripsi & fitur yang lebih profesional secara otomatis.
            </p>
        </div>
    )
}
