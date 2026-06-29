'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Clock, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Task {
    id: string
    project_id: string
    title: string
    description: string
    status: 'todo' | 'in-progress' | 'review' | 'done'
    due_date: string | null
    project: { name: string }
}

export default function MyTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/projects/my-tasks')
            const data = await res.json()
            if (data.success) {
                setTasks(data.tasks)
            }
        } catch (error) {
            console.error('Failed to fetch tasks', error)
        } finally {
            setLoading(false)
        }
    }

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        try {
            // Optimistic UI update
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t))
            
            await fetch(`/api/projects/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
        } catch (error) {
            console.error('Failed to update task status', error)
            // Revert on failure by refetching
            fetchTasks()
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'bg-green-100 text-green-700 border-green-200'
            case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'review': return 'bg-purple-100 text-purple-700 border-purple-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'todo': return 'To Do'
            case 'in-progress': return 'In Progress'
            case 'review': return 'Review'
            case 'done': return 'Selesai'
            default: return status
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    const activeTasks = tasks.filter(t => t.status !== 'done')
    const completedTasks = tasks.filter(t => t.status === 'done')

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tugas Saya</h1>
                <p className="text-gray-500 mt-1">Daftar semua tugas dari berbagai proyek yang ditugaskan kepada Anda.</p>
            </div>

            {tasks.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mt-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-200"></div>
                    <div className="inline-flex h-20 w-20 bg-gray-50 rounded-full items-center justify-center mb-4 border border-dashed border-gray-300">
                        <CheckSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Tugas</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Anda saat ini tidak memiliki tugas yang ditugaskan di proyek manapun.
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {/* Active Tasks Section */}
                    {activeTasks.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                Tugas Aktif ({activeTasks.length})
                            </h2>
                            <div className="grid gap-4">
                                {activeTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} onStatusChange={updateTaskStatus} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed Tasks Section */}
                    {completedTasks.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckSquare className="h-5 w-5 text-green-500" />
                                Tugas Selesai ({completedTasks.length})
                            </h2>
                            <div className="grid gap-4 opacity-75 hover:opacity-100 transition-opacity">
                                {completedTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} onStatusChange={updateTaskStatus} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function TaskCard({ task, onStatusChange, getStatusColor, getStatusLabel }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                        {task.project?.name || 'Proyek Tidak Ditemukan'}
                    </span>
                    {task.due_date && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'}`}>
                            <AlertCircle className="h-3 w-3" />
                            Tenggat: {format(new Date(task.due_date), 'd MMM yyyy', { locale: id })}
                        </span>
                    )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 truncate">{task.title}</h3>
                {task.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value)}
                    className={`text-sm font-semibold px-3 py-1.5 rounded-lg border appearance-none cursor-pointer outline-none ${getStatusColor(task.status)}`}
                >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Selesai</option>
                </select>
                
                <Link href={`/projects/${task.project_id}`} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                    <ArrowRight className="h-5 w-5" />
                </Link>
            </div>
        </motion.div>
    )
}
