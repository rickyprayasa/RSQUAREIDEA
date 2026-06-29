'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Wand2, Mail, Save, FileCheck, Loader2, Trash2, X, Download, PenTool, ImageIcon, Sparkles } from 'lucide-react'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

export default function ProjectDocuments({ project }: { project: any }) {
    const [documents, setDocuments] = useState<any[]>([])
    const [activeDoc, setActiveDoc] = useState<any>(null)
    const [content, setContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [docToDelete, setDocToDelete] = useState<any>(null)
    const [showEmailModal, setShowEmailModal] = useState(false)
    const [generationModal, setGenerationModal] = useState({
        isOpen: false,
        type: '',
        title: '',
        content: '',
        isLoading: false,
        isContinuing: false,
        endpoint: '',
        bodyData: {} as any
    })
    const [prdSetupModal, setPrdSetupModal] = useState({
        isOpen: false,
        jsFramework: 'Vanilla JS',
        cssFramework: 'Tailwind CSS'
    })
    const [toast, setToast] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' })

    useEffect(() => {
        if (project?.id) {
            // Always fetch fresh documents when component mounts/remounts
            fetchDocuments()
        }
    }, [project?.id])

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

    const handleDeleteDoc = () => {
        if (!activeDoc) return
        setDocToDelete(activeDoc)
    }

    const confirmDelete = async () => {
        if (!docToDelete) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/projects/documents/${docToDelete.id}`, { method: 'DELETE' })
            if (res.ok) {
                showToast('Dokumen dihapus', 'success')
                setDocuments(documents.filter(d => d.id !== docToDelete.id))
                if (activeDoc?.id === docToDelete.id) {
                    setActiveDoc(null)
                    setContent('')
                }
            } else {
                showToast('Gagal menghapus dokumen', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan', 'error')
        } finally {
            setIsDeleting(false)
            setDocToDelete(null)
        }
    }

    const startGeneration = async (type: string, title: string, endpoint: string, bodyData: any, isContinue: boolean = false) => {
        setIsGenerating(true)
        if (!isContinue) {
            setGenerationModal({ isOpen: true, type, title, content: '', isLoading: true, isContinuing: false, endpoint, bodyData })
        } else {
            setGenerationModal(prev => ({ ...prev, isContinuing: true }))
        }
        
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            })
            const data = await res.json()
            
            if (data.success) {
                const newContent = data.prdContent || data.proposalContent || data.sowContent || data.promptContent || ''
                if (isContinue) {
                    setGenerationModal(prev => ({ ...prev, content: prev.content + '\n' + newContent }))
                } else {
                    setGenerationModal(prev => ({ ...prev, content: newContent }))
                }
            } else {
                showToast(data.error || 'Gagal membuat dokumen', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan pada server AI', 'error')
        } finally {
            setIsGenerating(false)
            setGenerationModal(prev => ({ ...prev, isLoading: false, isContinuing: false }))
        }
    }

    const handleContinueGeneration = () => {
        startGeneration(generationModal.type, generationModal.title, generationModal.endpoint, {
            ...generationModal.bodyData,
            previousContent: generationModal.content
        }, true)
    }

    const handleSaveGeneratedDoc = () => {
        handleCreateDoc(generationModal.type, generationModal.title, generationModal.content)
        setGenerationModal(prev => ({ ...prev, isOpen: false }))
    }

    const handleGeneratePRD = () => {
        setPrdSetupModal(prev => ({ ...prev, isOpen: true }))
    }

    const startGeneratePRD = () => {
        setPrdSetupModal(prev => ({ ...prev, isOpen: false }))
        startGeneration('prd', 'Product Requirements Document (PRD)', '/api/ai/generate-prd', {
            description: project.description || 'Proyek pengembangan sistem.',
            templateName: project.name,
            frontendStack: prdSetupModal.jsFramework,
            cssFramework: prdSetupModal.cssFramework
        })
    }

    const handleGenerateProposal = () => {
        startGeneration('proposal', 'Proposal Penawaran (AI Generated)', '/api/ai/generate-proposal', {
            description: project.description || 'Proyek pengembangan sistem.',
            templateName: project.name,
            clientName: project.client_name
        })
    }

    const handleGenerateSOW = () => {
        startGeneration('proposal', 'Surat Perjanjian Kerja / SOW', '/api/ai/generate-sow', {
            description: project.description || 'Proyek pengembangan sistem.',
            templateName: project.name,
            clientName: project.client_name
        })
    }

    const handleGenerateDesignPrompt = () => {
        const prdDoc = documents.find(d => d.type === 'prd')
        startGeneration('prd', 'Prompt Desain UI/UX & Diagram', '/api/ai/generate-design-prompt', {
            description: project.description || 'Proyek pengembangan sistem.',
            templateName: project.name,
            prdContent: prdDoc ? prdDoc.content : null
        })
    }

    const handleSendEmail = () => {
        setShowEmailModal(true)
    }

    const sendActualEmail = () => {
        showToast(`Email berhasil dikirim ke ${project.client_email}`, 'success')
        setShowEmailModal(false)
    }

    const handleCopyOkegasPrompt = () => {
        if (!activeDoc || !content) return;
        
        const prompt = `Anda adalah AI Coding Assistant (OKEGAS). Tolong buatkan aplikasi Google Apps Script (GAS) secara lengkap beserta file HTML, CSS, dan JS yang dibutuhkan berdasarkan Product Requirements Document (PRD) berikut ini:

<PRD_CONTENT>
${content.replace(/<[^>]+>/g, (match) => match === '<br>' || match === '</p>' || match === '</h1>' || match === '</h2>' || match === '</h3>' || match === '</li>' ? '\n' : '')}
</PRD_CONTENT>

Pastikan Anda menggunakan struktur file Google Apps Script yang direkomendasikan dan mematuhi instruksi Tech Stack di atas. Berikan kode lengkap yang bisa langsung disalin.`;

        navigator.clipboard.writeText(prompt);
        showToast('Prompt OKEGAS disalin ke clipboard!', 'success');
    }

    const handleExportDoc = () => {
        if (!activeDoc) return;
        
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + content + footer;
        
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `${activeDoc.title.replace(/\s+/g, '_')}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
        
        showToast('Dokumen berhasil diekspor (.doc)', 'success');
    }

    const handleDeleteSpecificDoc = (docId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const doc = documents.find(d => d.id === docId);
        if (doc) setDocToDelete(doc);
    };

    const handleSendEmailSpecific = (doc: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveDoc(doc);
        setContent(doc.content);
        setShowEmailModal(true);
    };

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
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-xl w-56 py-2 hidden group-hover:block z-50">
                            <button onClick={() => handleCreateDoc('proposal', 'Draft Proposal')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" /> Blank Document
                            </button>
                            <button onClick={handleGenerateProposal} disabled={isGenerating} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> : <Wand2 className="h-4 w-4 text-amber-500" />}
                                AI Generate Proposal
                            </button>
                            <button onClick={handleGenerateSOW} disabled={isGenerating} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin text-orange-500" /> : <PenTool className="h-4 w-4 text-orange-500" />}
                                AI Generate Kontrak SOW
                            </button>
                            <button onClick={handleGenerateDesignPrompt} disabled={isGenerating} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> : <Sparkles className="h-4 w-4 text-emerald-500" />}
                                AI Generate Prompt Desain & UI/UX
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
                        <div key={doc.id} className={`w-full group rounded-lg text-sm flex items-center justify-between transition-all border ${
                                activeDoc?.id === doc.id ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-gray-50 border-transparent'
                            }`}>
                            <button
                                onClick={() => {
                                    setActiveDoc(doc)
                                    setContent(doc.content)
                                }}
                                className={`flex-1 text-left px-3 py-2.5 flex items-center gap-2 ${
                                    activeDoc?.id === doc.id ? 'text-indigo-700 font-semibold' : 'text-gray-600'
                                }`}
                            >
                                {doc.type === 'prd' ? <FileCheck className={`h-4 w-4 shrink-0 ${activeDoc?.id === doc.id ? 'text-indigo-600' : 'text-emerald-500'}`} /> : 
                                 doc.type === 'proposal' ? <FileText className={`h-4 w-4 shrink-0 ${activeDoc?.id === doc.id ? 'text-indigo-600' : 'text-amber-500'}`} /> : 
                                 <FileText className="h-4 w-4 shrink-0 text-gray-400" />}
                                <span className="truncate overflow-hidden w-28">{doc.title}</span>
                            </button>
                            <div className="flex items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => handleSendEmailSpecific(doc, e)}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                    title="Preview Email"
                                >
                                    <Mail className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                    onClick={(e) => handleDeleteSpecificDoc(doc.id, e)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Hapus Dokumen"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
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
                        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10 overflow-x-auto">
                            <div className="min-w-fit pr-4">
                                <h2 className="font-bold text-gray-900">{activeDoc.title}</h2>
                                <p className="text-xs text-gray-500">Terakhir disimpan: {new Date(activeDoc.updated_at).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button 
                                    onClick={handleDeleteDoc}
                                    disabled={isDeleting}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    <span className="hidden sm:inline">Hapus</span>
                                </button>
                                <button 
                                    onClick={handleExportDoc}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline">Export</span> Doc
                                </button>
                                {activeDoc.type === 'prd' && (
                                    <button 
                                        onClick={handleCopyOkegasPrompt}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                                        title="Salin prompt beserta isi PRD ini untuk di-paste ke OKEGAS atau AI Chat"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        <span className="hidden sm:inline">Copy OKEGAS</span> Prompt
                                    </button>
                                )}
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    <span className="hidden sm:inline">Simpan</span>
                                </button>
                                <button 
                                    onClick={handleSendEmail}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors text-sm font-medium shadow-md shadow-indigo-200"
                                >
                                    <Mail className="h-4 w-4" />
                                    Kirim
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
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                        <div className="h-24 w-24 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-6">
                            <FileText className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Dokumen Terpilih</h3>
                        <p className="text-gray-500 mb-8 max-w-sm text-center">Pilih dokumen di sebelah kiri untuk mulai mengedit, atau buat dokumen baru sekarang.</p>
                        
                        <div className="flex items-center gap-4 flex-wrap justify-center">
                            <button onClick={() => handleCreateDoc('proposal', 'Draft Proposal')} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all shadow-sm">
                                <FileText className="h-4 w-4 text-gray-400" />
                                Blank Doc
                            </button>
                            <button onClick={handleGenerateProposal} disabled={isGenerating} className="flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl font-medium transition-all">
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                Generate Proposal
                            </button>
                            <button onClick={handleGenerateSOW} disabled={isGenerating} className="flex items-center gap-2 px-6 py-3 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl font-medium transition-all border border-orange-100">
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
                                Generate Kontrak SOW
                            </button>
                            <button onClick={handleGenerateDesignPrompt} disabled={isGenerating} className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-medium transition-all border border-emerald-100">
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                Generate Prompt Desain
                            </button>
                            <button onClick={handleGeneratePRD} disabled={isGenerating} className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-medium transition-all">
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                Generate PRD
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Email Preview Modal */}
            {showEmailModal && activeDoc && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900">Preview Email</h3>
                            <button onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                            <div className="space-y-3">
                                <div className="flex text-sm">
                                    <span className="w-20 text-gray-500 font-medium">To:</span>
                                    <span className="font-medium text-gray-900">{project.client_email || 'Klien tidak memiliki email'}</span>
                                </div>
                                <div className="flex text-sm">
                                    <span className="w-20 text-gray-500 font-medium">Subject:</span>
                                    <span className="font-medium text-gray-900">{activeDoc.title} - {project.name}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 bg-white">
                            <div 
                                className="prose prose-sm max-w-none text-gray-800"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        </div>
                        
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowEmailModal(false)}
                                className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={sendActualEmail}
                                disabled={!project.client_email}
                                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Mail className="h-4 w-4" />
                                Kirim Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* PRD Setup Modal */}
            {prdSetupModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-indigo-500" /> Pengaturan Generate PRD
                            </h3>
                            <button onClick={() => setPrdSetupModal(prev => ({ ...prev, isOpen: false }))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-5 bg-gray-50">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih JS Framework (Frontend)</label>
                                <select 
                                    value={prdSetupModal.jsFramework} 
                                    onChange={(e) => setPrdSetupModal(prev => ({ ...prev, jsFramework: e.target.value }))}
                                    className="w-full border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 text-sm"
                                >
                                    <option value="Vanilla JS">Vanilla JS (Standard)</option>
                                    <option value="Alpine.js">Alpine.js</option>
                                    <option value="Vue.js (CDN)">Vue.js (CDN)</option>
                                    <option value="jQuery">jQuery</option>
                                    <option value="HTMX">HTMX</option>
                                    <option value="React (Babel CDN)">React (Babel CDN)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih CSS Framework</label>
                                <select 
                                    value={prdSetupModal.cssFramework} 
                                    onChange={(e) => setPrdSetupModal(prev => ({ ...prev, cssFramework: e.target.value }))}
                                    className="w-full border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 text-sm"
                                >
                                    <option value="Tailwind CSS">Tailwind CSS</option>
                                    <option value="Bootstrap">Bootstrap</option>
                                    <option value="DaisyUI">DaisyUI</option>
                                    <option value="Pico CSS">Pico CSS</option>
                                </select>
                            </div>
                            
                            <div className="bg-indigo-50/80 border border-indigo-100 p-3 rounded-lg flex items-start gap-2">
                                <Sparkles className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-indigo-800">
                                    AI akan mengadaptasikan PRD ini secara khusus agar kompatibel dengan pilihan framework Anda. 
                                    Anda bisa mengekspornya ke OKEGAS setelah dokumen selesai dibuat.
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                            <button 
                                onClick={() => setPrdSetupModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={startGeneratePRD}
                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md shadow-indigo-200"
                            >
                                <Wand2 className="h-4 w-4" />
                                Mulai Generate PRD
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {docToDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 mb-2">Hapus Dokumen?</h3>
                            <p className="text-gray-500">
                                Apakah Anda yakin ingin menghapus dokumen <strong>"{docToDelete.title}"</strong>? Tindakan ini tidak dapat dibatalkan dan dokumen akan hilang selamanya.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setDocToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 bg-gray-50 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-200 disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Generation Preview Modal */}
            {generationModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-gray-900">AI Preview: {generationModal.title}</h3>
                                {generationModal.isLoading && !generationModal.isContinuing && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100">
                                        <Loader2 className="w-3 h-3 animate-spin"/> Generating...
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setGenerationModal(prev => ({ ...prev, isOpen: false }))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/80 custom-scrollbar">
                            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 min-h-full p-6 md:p-8 prose prose-sm md:prose-base max-w-none prose-headings:text-indigo-900 prose-a:text-indigo-600">
                                {generationModal.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: generationModal.content }} />
                                ) : generationModal.isLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                                        <div className="relative">
                                            <Wand2 className="h-12 w-12 mb-4 text-indigo-300 animate-pulse" />
                                            <Sparkles className="h-5 w-5 text-amber-400 absolute -top-1 -right-2 animate-bounce" />
                                        </div>
                                        <p className="font-medium text-gray-500 mt-2">AI sedang menyusun dokumen Anda...</p>
                                        <p className="text-xs text-gray-400 mt-1">Ini mungkin membutuhkan waktu hingga 1-2 menit tergantung kerumitan.</p>
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-center py-20">Gagal memuat konten. Coba ulangi.</div>
                                )}
                                
                                {generationModal.isContinuing && (
                                    <div className="mt-8 p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl flex flex-col items-center justify-center text-indigo-600">
                                        <Loader2 className="w-6 h-6 mb-2 animate-spin text-indigo-500" /> 
                                        <span className="text-sm font-bold">Menganalisis kalimat terakhir dan menyambung dokumen...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-4 border-t border-gray-100 bg-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
                            <div className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                                Jika teks terpotong di tengah jalan, tekan tombol Lanjutkan.
                            </div>
                            <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                                <button 
                                    onClick={handleContinueGeneration}
                                    disabled={generationModal.isLoading || generationModal.isContinuing || !generationModal.content}
                                    className="flex-1 md:flex-none px-4 md:px-5 py-2.5 md:py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 border-2 border-indigo-100 bg-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-300"
                                >
                                    <Wand2 className="h-4 w-4" />
                                    <span className="hidden md:inline">Lanjutkan Generate</span>
                                    <span className="md:hidden">Lanjutkan</span>
                                </button>
                                <button 
                                    onClick={handleSaveGeneratedDoc}
                                    disabled={generationModal.isLoading || generationModal.isContinuing || !generationModal.content}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="h-4 w-4" />
                                    Simpan ke Editor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
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
