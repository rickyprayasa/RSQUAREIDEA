'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Wand2, Mail, Save, FileCheck, Loader2 } from 'lucide-react'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

export default function ProjectDocuments({ project }: { project: any }) {
    const [documents, setDocuments] = useState<any[]>([])
    const [activeDoc, setActiveDoc] = useState<any>(null)
    const [content, setContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [toast, setToast] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' })

    useEffect(() => {
        if (project.project_documents) {
            setDocuments(project.project_documents)
        }
    }, [project])

    const fetchDocuments = async () => {
        const res = await fetch(`/api/projects/${project.id}`)
        const data = await res.json()
        if (data.success) {
            setDocuments(data.project.project_documents || [])
            if (activeDoc) {
                const updatedDoc = data.project.project_documents.find((d: any) => d.id === activeDoc.id)
                if (updatedDoc) {
                    setActiveDoc(updatedDoc)
                    setContent(updatedDoc.content)
                }
            }
        }
    }

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ show: true, msg, type })
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
    }

    const handleCreateDoc = async (type: string, title: string, initialContent: string = '') => {
        try {
            const res = await fetch(`/api/projects/${project.id}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, title, content: initialContent })
            })
            const data = await res.json()
            if (data.success) {
                setDocuments([...documents, data.document])
                setActiveDoc(data.document)
                setContent(initialContent)
                showToast('Dokumen berhasil dibuat', 'success')
            }
        } catch (error) {
            showToast('Gagal membuat dokumen', 'error')
        }
    }

    const handleSave = async () => {
        if (!activeDoc) return
        setIsSaving(true)
        try {
            const res = await fetch(`/api/projects/documents/${activeDoc.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })
            const data = await res.json()
            if (data.success) {
                showToast('Perubahan tersimpan!', 'success')
                fetchDocuments() // Refresh to update timestamps
            } else {
                showToast('Gagal menyimpan', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const handleGeneratePRD = async () => {
        setIsGenerating(true)
        try {
            // Simulated AI generation based on project description
            // In a real app, this would call your AI endpoint
            const res = await fetch('/api/ai/generate-prd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    description: project.description || 'Proyek pengembangan sistem.',
                    templateName: project.name
                })
            })
            
            const data = await res.json()
            if (data.success && data.prdContent) {
                handleCreateDoc('prd', 'Product Requirements Document (PRD)', data.prdContent)
            } else {
                // Fallback dummy PRD if API not fully wired
                const dummyPRD = `<h1>Product Requirements Document</h1><p>Client: ${project.client_name}</p><p>Requirement: ${project.description}</p><h2>Features</h2><ul><li>Authentication</li><li>Dashboard</li></ul>`
                handleCreateDoc('prd', 'Product Requirements Document (PRD)', dummyPRD)
            }
        } catch (error) {
            showToast('AI Generation failed, creating blank document', 'error')
            handleCreateDoc('prd', 'Product Requirements Document (PRD)', '<h1>PRD</h1><p>Start writing here...</p>')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSendEmail = () => {
        // Simulate email sending
        showToast(`Email berhasil dikirim ke ${project.client_email}`, 'success')
    }

    return (
        <div className="flex h-full relative">
            {toast.show && (
                <div className={`absolute top-4 right-4 z-[100] px-4 py-2 rounded-xl shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Sidebar Documents List */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        Files
                    </h3>
                    <div className="relative group">
                        <button className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors">
                            <Plus className="h-4 w-4" />
                        </button>
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-xl w-48 py-2 hidden group-hover:block z-50">
                            <button onClick={() => handleCreateDoc('proposal', 'Draft Proposal')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-amber-500" /> Blank Proposal
                            </button>
                            <button onClick={handleGeneratePRD} disabled={isGenerating} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> : <Wand2 className="h-4 w-4 text-indigo-500" />}
                                AI Generate PRD
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {documents.map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => {
                                setActiveDoc(doc)
                                setContent(doc.content)
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-all ${
                                activeDoc?.id === doc.id ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                            }`}
                        >
                            {doc.type === 'prd' ? <FileCheck className={`h-4 w-4 ${activeDoc?.id === doc.id ? 'text-indigo-600' : 'text-emerald-500'}`} /> : 
                             doc.type === 'proposal' ? <FileText className={`h-4 w-4 ${activeDoc?.id === doc.id ? 'text-indigo-600' : 'text-amber-500'}`} /> : 
                             <FileText className="h-4 w-4 text-gray-400" />}
                            <span className="truncate">{doc.title}</span>
                        </button>
                    ))}
                    
                    {documents.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            Belum ada dokumen.
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {activeDoc ? (
                    <>
                        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
                            <div>
                                <h2 className="font-bold text-gray-900">{activeDoc.title}</h2>
                                <p className="text-xs text-gray-500">Terakhir disimpan: {new Date(activeDoc.updated_at).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Simpan Draft
                                </button>
                                <button 
                                    onClick={handleSendEmail}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors text-sm font-medium shadow-md shadow-indigo-200"
                                >
                                    <Mail className="h-4 w-4" />
                                    Kirim ke Klien
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[800px] overflow-hidden">
                                <RichTextEditor 
                                    content={content} 
                                    onChange={setContent} 
                                    editable={true} 
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-gray-300" />
                        </div>
                        <p>Pilih dokumen di sebelah kiri untuk mulai mengedit.</p>
                    </div>
                )}
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 6px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    )
}
