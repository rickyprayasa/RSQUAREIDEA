'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Folder, CheckSquare, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function SearchContent() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const [loading, setLoading] = useState(true)
    const [results, setResults] = useState<{ projects: any[], tasks: any[] }>({ projects: [], tasks: [] })

    useEffect(() => {
        if (query) {
            fetchResults(query)
        } else {
            setLoading(false)
        }
    }, [query])

    const fetchResults = async (q: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/projects/search?q=${encodeURIComponent(q)}`)
            const data = await res.json()
            if (data.success) {
                setResults({ projects: data.projects || [], tasks: data.tasks || [] })
            }
        } catch (error) {
            console.error('Failed to fetch search results', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!query) {
        return (
            <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Masukkan kata kunci untuk mencari</h3>
                <p className="text-gray-500 mt-1">Cari nama proyek atau judul tugas.</p>
            </div>
        )
    }

    const hasResults = results.projects.length > 0 || results.tasks.length > 0

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                    <Search className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hasil Pencarian</h1>
                    <p className="text-gray-500">Menampilkan hasil untuk: <span className="font-semibold text-gray-900">"{query}"</span></p>
                </div>
            </div>

            {!hasResults ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
                >
                    <Search className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Tidak ada hasil ditemukan</h3>
                    <p className="text-gray-500">Coba gunakan kata kunci lain.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Projects Results */}
                    {results.projects.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Folder className="h-5 w-5 text-indigo-500" /> Proyek ({results.projects.length})
                            </h2>
                            <div className="grid gap-3">
                                {results.projects.map((project: any, i: number) => (
                                    <motion.div 
                                        key={project.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link href={`/projects/${project.id}`} className="block bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">{project.client_name} • {project.type}</p>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tasks Results */}
                    {results.tasks.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <CheckSquare className="h-5 w-5 text-orange-500" /> Tugas ({results.tasks.length})
                            </h2>
                            <div className="grid gap-3">
                                {results.tasks.map((task: any, i: number) => (
                                    <motion.div 
                                        key={task.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link href={`/projects/${task.project_id}`} className="block bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded mb-1.5 inline-block">
                                                        {task.project?.name || 'Proyek'}
                                                    </span>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{task.title}</h3>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function SearchPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>}>
                <SearchContent />
            </Suspense>
        </div>
    )
}
