'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CheckSquare, Clock, Plus, FolderOpen, Folder, Mail, Phone, Loader2, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'

export default function ProjectsDashboard() {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        client_name: '',
        client_email: '',
        client_phone: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' })

    useEffect(() => {
        fetchProjects()
    }, [])

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ show: true, msg, type })
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
    }

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects')
            const data = await res.json()
            if (data.success) {
                setProjects(data.projects)
            }
        } catch (error) {
            console.error('Failed to fetch projects', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newProject.name.trim()) return

        setSubmitting(true)
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject)
            })
            const data = await res.json()
            if (data.success) {
                showToast('Proyek berhasil dibuat!', 'success')
                setIsModalOpen(false)
                setNewProject({
                    name: '',
                    description: '',
                    client_name: '',
                    client_email: '',
                    client_phone: ''
                })
                fetchProjects()
            } else {
                showToast(data.error || 'Gagal membuat proyek', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCompleteProject = async (projectId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' })
            })
            const data = await res.json()
            if (data.success) {
                showToast('Proyek berhasil diselesaikan!', 'success')
                fetchProjects()
            } else {
                showToast(data.error || 'Gagal menyelesaikan proyek', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi', 'error')
        }
    }

    const getProgress = (project: any) => {
        if (project.status === 'completed') return 100
        const tasks = project.project_tasks
        if (!tasks || tasks.length === 0) return 0
        const doneTasks = tasks.filter((t: any) => t.status === 'done').length
        return Math.round((doneTasks / tasks.length) * 100)
    }

    const activeProjects = projects.filter(p => p.status === 'active')
    const completedProjects = projects.filter(p => p.status === 'completed')

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Workspace Dashboard</h1>
                    <p className="text-gray-500 mt-1">Kelola proyek aktif, pantau tugas, dan kerjakan dokumen proposal klien.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
                >
                    <Plus className="h-5 w-5" />
                    Proyek Manual
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
                >
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03]">
                        <LayoutDashboard className="h-32 w-32" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Proyek Aktif</p>
                            <h3 className="text-3xl font-black text-gray-900">{activeProjects.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <LayoutDashboard className="h-6 w-6" />
                        </div>
                    </div>
                </motion.div>
                
                <motion.div 
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
                >
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03]">
                        <CheckSquare className="h-32 w-32" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tugas Selesai</p>
                            <h3 className="text-3xl font-black text-gray-900">
                                {projects.reduce((acc, p) => acc + (p.project_tasks?.filter((t:any) => t.status === 'done').length || 0), 0)}
                            </h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <CheckSquare className="h-6 w-6" />
                        </div>
                    </div>
                </motion.div>
                
                <motion.div 
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
                >
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03]">
                        <Folder className="h-32 w-32" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Proyek Selesai</p>
                            <h3 className="text-3xl font-black text-gray-900">{completedProjects.length}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Folder className="h-6 w-6" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Proyek Berjalan</h2>
                
                {projects.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500"></div>
                        <div className="inline-flex h-24 w-24 bg-gray-50 rounded-full items-center justify-center mb-6 border border-dashed border-gray-300">
                            <LayoutDashboard className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Proyek</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Proyek baru akan muncul secara otomatis ketika ada klien yang mengisi Request Form di website Anda.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, index) => {
                            const progress = getProgress(project)
                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link href={`/projects/${project.id}`}>
                                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 group cursor-pointer h-full flex flex-col relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                            
                                            <div className="flex items-start justify-between mb-5 relative z-10">
                                                <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 font-bold border border-orange-100/50 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                                                    {project.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    project.status === 'active' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    project.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                    'bg-gray-50 text-gray-600 border border-gray-200'
                                                }`}>
                                                    {project.status === 'active' ? 'Berjalan' : 
                                                     project.status === 'completed' ? 'Selesai' : project.status}
                                                </span>
                                            </div>

                                            <div className="relative z-10 flex-1">
                                                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">{project.name}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                                    {project.description || 'Tidak ada deskripsi.'}
                                                </p>

                                                <div className="space-y-2 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="truncate">{project.client_email}</span>
                                                    </div>
                                                    {project.client_phone && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                            <span>{project.client_phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-auto relative z-10">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase">Progress Tugas</span>
                                                    <span className="text-xs font-bold text-orange-600">{progress}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {new Date(project.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    {project.status === 'active' && progress === 100 && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleCompleteProject(project.id);
                                                            }}
                                                            className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors shadow-sm z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                                                        >
                                                            Selesaikan
                                                        </button>
                                                    )}
                                                    <div className="flex items-center gap-1 text-sm font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                                        Buka Workspace <ArrowRight className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
            
            {/* Modal & Toast */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl shadow-xl text-white font-medium flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {toast.msg}
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                            
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-950">Buat Proyek Manual</h3>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Proyek *</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Contoh: Website E-Commerce Toko Baju"
                                        value={newProject.name}
                                        onChange={e => setNewProject({...newProject, name: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-orange-200 focus:ring-1 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-950"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi Proyek</label>
                                    <textarea 
                                        placeholder="Jelaskan detail request kustom proyek..."
                                        rows={3}
                                        value={newProject.description}
                                        onChange={e => setNewProject({...newProject, description: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-orange-200 focus:ring-1 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-950 resize-y"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Klien</label>
                                        <input 
                                            type="text" 
                                            placeholder="Nama Klien"
                                            value={newProject.client_name}
                                            onChange={e => setNewProject({...newProject, client_name: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-orange-200 focus:ring-1 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-950"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor HP Klien</label>
                                        <input 
                                            type="text" 
                                            placeholder="Nomor HP Klien"
                                            value={newProject.client_phone}
                                            onChange={e => setNewProject({...newProject, client_phone: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-orange-200 focus:ring-1 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-950"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Klien</label>
                                    <input 
                                        type="email" 
                                        placeholder="emailklien@domain.com"
                                        value={newProject.client_email}
                                        onChange={e => setNewProject({...newProject, client_email: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-orange-200 focus:ring-1 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-gray-950"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200 disabled:opacity-50 text-sm"
                                    >
                                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Buat Proyek
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
