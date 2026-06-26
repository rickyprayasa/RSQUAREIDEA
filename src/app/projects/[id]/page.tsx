'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import KanbanBoard from '@/components/projects/KanbanBoard'
import ProjectDocuments from '@/components/projects/ProjectDocuments'

export default function ProjectWorkspace() {
    const params = useParams()
    const router = useRouter()
    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'board' | 'documents' | 'settings'>('board')

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
                <div className="flex gap-6 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('board')}
                        className={`pb-3 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
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
                {activeTab === 'board' && <KanbanBoard project={project} />}
                {activeTab === 'documents' && <ProjectDocuments project={project} />}
                {activeTab === 'settings' && (
                    <div className="p-8 max-w-2xl">
                        <h2 className="text-lg font-bold mb-4">Pengaturan Proyek</h2>
                        {/* Settings Form placeholder */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500">Pengaturan proyek akan tersedia di sini.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
