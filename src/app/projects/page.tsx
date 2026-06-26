'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, CheckSquare, Clock, Plus, FolderOpen, Mail, Phone, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ProjectsDashboard() {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProjects()
    }, [])

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

    const getProgress = (tasks: any[]) => {
        if (!tasks || tasks.length === 0) return 0
        const doneTasks = tasks.filter(t => t.status === 'done').length
        return Math.round((doneTasks / tasks.length) * 100)
    }

    const activeProjects = projects.filter(p => p.status === 'active')
    const completedProjects = projects.filter(p => p.status === 'completed')

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
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
                <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200">
                    <Plus className="h-5 w-5" />
                    Proyek Manual
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-indigo-200 transition-colors"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FolderOpen className="h-24 w-24 text-indigo-600 -mr-6 -mt-6" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Proyek Aktif</p>
                            <p className="text-4xl font-black text-gray-900 mt-2">{activeProjects.length}</p>
                        </div>
                        <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                            <LayoutDashboard className="h-7 w-7" />
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-amber-200 transition-colors"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CheckSquare className="h-24 w-24 text-amber-600 -mr-6 -mt-6" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tugas Selesai</p>
                            <p className="text-4xl font-black text-gray-900 mt-2">
                                {projects.reduce((acc, p) => acc + (p.project_tasks?.filter((t:any) => t.status === 'done').length || 0), 0)}
                            </p>
                        </div>
                        <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                            <CheckSquare className="h-7 w-7" />
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-emerald-200 transition-colors"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FolderOpen className="h-24 w-24 text-emerald-600 -mr-6 -mt-6" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Proyek Selesai</p>
                            <p className="text-4xl font-black text-gray-900 mt-2">{completedProjects.length}</p>
                        </div>
                        <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                            <FolderOpen className="h-7 w-7" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Projects List */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Proyek Berjalan</h2>
                </div>

                {projects.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
                    >
                        <div className="inline-flex h-20 w-20 bg-gray-50 rounded-full items-center justify-center mb-4 border border-dashed border-gray-300">
                            <LayoutDashboard className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Proyek</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Proyek baru akan muncul secara otomatis ketika ada klien yang mengisi Request Form di website Anda.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, index) => {
                            const progress = getProgress(project.project_tasks)
                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/projects/${project.id}`}>
                                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group cursor-pointer h-full flex flex-col">
                                            
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="h-12 w-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-100/50">
                                                    {project.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    project.status === 'active' ? 'bg-indigo-50 text-indigo-700' :
                                                    project.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {project.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{project.name}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
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

                                            <div className="mt-auto">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase">Progress</span>
                                                    <span className="text-xs font-bold text-indigo-600">{progress}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {new Date(project.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <div className="flex items-center gap-1 text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                                    Buka Workspace <ArrowRight className="h-4 w-4" />
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
        </div>
    )
}
