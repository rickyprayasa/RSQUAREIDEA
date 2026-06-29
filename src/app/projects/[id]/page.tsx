'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, ArrowLeft, Loader2, Save, Trash2, X, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import KanbanBoard from '@/components/projects/KanbanBoard'
import ProjectDocuments from '@/components/projects/ProjectDocuments'
import ProjectSOP from '@/components/projects/ProjectSOP'

export default function ProjectWorkspace() {
    const params = useParams()
    const router = useRouter()
    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'sop' | 'board' | 'documents' | 'settings'>('sop')
    const [isSavingSettings, setIsSavingSettings] = useState(false)
    const [isDeletingProject, setIsDeletingProject] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' })
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        status: 'active'
    })

    useEffect(() => {
        if (project) {
            setEditForm({
                name: project.name || '',
                description: project.description || '',
                client_name: project.client_name || '',
                client_email: project.client_email || '',
                client_phone: project.client_phone || '',
                status: project.status || 'active'
            })
        }
    }, [project])

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ show: true, msg, type })
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
    }

    useEffect(() => {
        fetchProject()
    }, [params.id])

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${params.id}`)
            const data = await res.json()
            if (data.success) {
                setProject(data.project)
            } else {
                router.push('/projects')
            }
        } catch (error) {
            console.error('Failed to fetch project', error)
        } finally {
            setLoading(false)
        }
    }
    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSavingSettings(true)
        try {
            const res = await fetch(`/api/projects/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            })
            const data = await res.json()
            if (data.success) {
                showToast('Pengaturan proyek berhasil disimpan!', 'success')
                setProject(data.project)
            } else {
                showToast(data.error || 'Gagal menyimpan pengaturan', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi', 'error')
        } finally {
            setIsSavingSettings(false)
        }
    }

    const handleDeleteProject = async () => {
        setIsDeletingProject(true)
        try {
            const res = await fetch(`/api/projects/${params.id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                router.push('/projects')
            } else {
                showToast(data.error || 'Gagal menghapus proyek', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi', 'error')
        } finally {
            setIsDeletingProject(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!project) return null

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/projects" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                        <p className="text-sm text-gray-500">{project.client_name} • {project.client_email}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-100 overflow-x-auto custom-scrollbar">
                    <button
                        onClick={() => setActiveTab('sop')}
                        className={`pb-3 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'sop' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FileText className="h-4 w-4" /> SOP & Alur Kerja
                    </button>
                    <button
                        onClick={() => setActiveTab('board')}
                        className={`pb-3 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'board' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <LayoutDashboard className="h-4 w-4" /> Board (Kanban)
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`pb-3 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === 'documents' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FileText className="h-4 w-4" /> Dokumen & Proposal
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-3 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === 'settings' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Settings className="h-4 w-4" /> Pengaturan
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-gray-50">
                {activeTab === 'sop' && <ProjectSOP project={project} onNavigate={(tab) => setActiveTab(tab)} />}
                {activeTab === 'board' && <KanbanBoard project={project} />}
                {activeTab === 'documents' && <ProjectDocuments project={project} />}
                {activeTab === 'settings' && (
                    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar space-y-8 pb-24">
                        {toast.show && (
                            <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl shadow-xl text-white font-medium flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                {toast.msg}
                            </div>
                        )}

                        {/* Settings Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                            
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Settings className="h-5 w-5 text-orange-500" />
                                Pengaturan Proyek
                            </h2>

                            <form onSubmit={handleSaveSettings} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Proyek *</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={editForm.name}
                                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-orange-200 focus:ring-1 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-950 font-medium"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status Proyek</label>
                                        <select
                                            value={editForm.status}
                                            onChange={e => setEditForm({...editForm, status: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-orange-200 focus:ring-1 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-950 font-medium animate-none"
                                        >
                                            <option value="active">Berjalan (Active)</option>
                                            <option value="completed">Selesai (Completed)</option>
                                            <option value="on_hold">Ditunda (On Hold)</option>
                                            <option value="archived">Diarsipkan (Archived)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi Proyek</label>
                                    <textarea 
                                        rows={4}
                                        value={editForm.description}
                                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-orange-200 focus:ring-1 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-950 resize-y"
                                    />
                                </div>

                                <div className="h-px bg-gray-100 my-6"></div>

                                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Informasi Klien</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Klien</label>
                                        <input 
                                            type="text" 
                                            value={editForm.client_name}
                                            onChange={e => setEditForm({...editForm, client_name: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-orange-200 focus:ring-1 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-950"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Klien</label>
                                        <input 
                                            type="email" 
                                            value={editForm.client_email}
                                            onChange={e => setEditForm({...editForm, client_email: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-orange-200 focus:ring-1 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-950"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor HP Klien</label>
                                        <input 
                                            type="text" 
                                            value={editForm.client_phone}
                                            onChange={e => setEditForm({...editForm, client_phone: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-orange-200 focus:ring-1 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-950"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button 
                                        type="submit"
                                        disabled={isSavingSettings}
                                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200 disabled:opacity-50 text-sm"
                                    >
                                        {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Simpan Pengaturan
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100 space-y-4">
                            <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Zona Berbahaya (Danger Zone)
                            </h3>
                            <p className="text-sm text-red-700/80">
                                Menghapus proyek akan menghapus seluruh data tugas (Kanban Board), file dokumen, proposal, PRD, dan seluruh data terkait secara permanen dari basis data. Aksi ini tidak dapat dibatalkan.
                            </p>
                            <div className="pt-2">
                                <button 
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm shadow-md shadow-red-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus Proyek Ini
                                </button>
                            </div>
                        </div>

                        {/* Delete Confirmation Modal */}
                        {showDeleteConfirm && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                                <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
                                    
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                            Konfirmasi Hapus Proyek
                                        </h3>
                                        <button 
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Apakah Anda yakin ingin menghapus proyek <span className="font-bold text-gray-900">"{project.name}"</span>? Seluruh data yang terkait akan terhapus selamanya.
                                        </p>
                                        
                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                            <button 
                                                type="button"
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all text-sm"
                                            >
                                                Batal
                                            </button>
                                            <button 
                                                onClick={handleDeleteProject}
                                                disabled={isDeletingProject}
                                                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm shadow-md shadow-red-100 disabled:opacity-50"
                                            >
                                                {isDeletingProject && <Loader2 className="h-4 w-4 animate-spin" />}
                                                Hapus Permanen
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
