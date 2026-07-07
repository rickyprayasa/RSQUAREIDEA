'use client'

import { useState, useEffect } from 'react'
import { Plus, MoreHorizontal, Calendar, User, X, Trash2, CheckCircle2, Save, Edit2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100 text-gray-700' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { id: 'review', title: 'Review', color: 'bg-amber-100 text-amber-700' },
    { id: 'done', title: 'Done', color: 'bg-emerald-100 text-emerald-700' }
]

export default function KanbanBoard({ project }: { project: any }) {
    const [tasks, setTasks] = useState<any[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [newTaskText, setNewTaskText] = useState('')
    const [addingToCol, setAddingToCol] = useState<string | null>(null)
    const [editingTask, setEditingTask] = useState<any>(null)
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        if (project.project_tasks) {
            setTasks(project.project_tasks)
        }
        fetch('/api/auth/session').then(res => res.json()).then(data => {
            if (data.user) setCurrentUser(data.user)
        })
    }, [project])

    const fetchTasks = async () => {
        const res = await fetch(`/api/projects/${project.id}`)
        const data = await res.json()
        if (data.success) {
            setTasks(data.project.project_tasks || [])
        }
    }

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId)
        setIsDragging(true)
    }

    const handleDragEnd = () => {
        setIsDragging(false)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault()
        setIsDragging(false)
        const taskId = e.dataTransfer.getData('taskId')
        
        if (!taskId) return

        const task = tasks.find(t => t.id === taskId)
        if (!task || task.status === targetColumnId) return

        // Optimistic update
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: targetColumnId } : t))

        // API call
        try {
            await fetch(`/api/projects/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: targetColumnId })
            })
        } catch (error) {
            console.error('Failed to update task status', error)
            fetchTasks() // Revert on fail
        }
    }

    const handleAddTask = async (columnId: string) => {
        if (!newTaskText.trim()) {
            setAddingToCol(null)
            return
        }

        const title = newTaskText
        setNewTaskText('')
        setAddingToCol(null)

        try {
            const res = await fetch(`/api/projects/${project.id}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    status: columnId,
                    position: tasks.filter(t => t.status === columnId).length
                })
            })
            const data = await res.json()
            if (data.success) {
                setTasks([...tasks, data.task])
            }
        } catch (error) {
            console.error('Failed to add task', error)
        }
    }

    const handleUpdateTask = async (updatedTask: any) => {
        // Optimistic update
        setTasks(tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
        setEditingTask(null)

        try {
            await fetch(`/api/projects/tasks/${updatedTask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask)
            })
        } catch (error) {
            console.error('Failed to update task', error)
            fetchTasks()
        }
    }

    const handleDeleteTask = (taskId: string) => {
        setDeletingTaskId(taskId)
    }

    const confirmDeleteTask = async () => {
        if (!deletingTaskId) return
        
        const taskId = deletingTaskId
        setDeletingTaskId(null)
        setEditingTask(null)
        
        // Optimistic update
        setTasks(tasks.filter(t => t.id !== taskId))

        try {
            await fetch(`/api/projects/tasks/${taskId}`, { method: 'DELETE' })
        } catch (error) {
            console.error('Failed to delete task', error)
            fetchTasks()
        }
    }

    return (
        <div className="h-full p-6 overflow-x-auto">
            <div className="flex gap-6 h-full min-w-max pb-4">
                {COLUMNS.map(column => {
                    const columnTasks = tasks.filter(t => t.status === column.id).sort((a, b) => a.position - b.position)
                    
                    return (
                        <div 
                            key={column.id}
                            className="w-80 flex flex-col bg-gray-100/50 rounded-2xl h-full border border-gray-200/50"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            {/* Column Header */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${column.color}`}>
                                        {column.title}
                                    </span>
                                    <span className="text-sm font-medium text-gray-400">{columnTasks.length}</span>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Column Body / Tasks */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {columnTasks.map(task => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onClick={() => setEditingTask(task)}
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onDragEnd={handleDragEnd}
                                        className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all group relative ${isDragging ? 'opacity-50' : ''}`}
                                    >
                                        <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-lg border border-gray-100 shadow-sm z-10">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setEditingTask(task); }} 
                                                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} 
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 mb-3 leading-snug pr-12">{task.title}</p>
                                        
                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                                            <div className="flex -space-x-2">
                                                {task.assignee_id ? (
                                                    <div className="h-6 w-6 rounded-full bg-orange-100 border border-white flex items-center justify-center text-[10px] font-bold text-orange-700" title="Assigned">
                                                        {currentUser?.id === task.assignee_id ? 'ME' : 'U'}
                                                    </div>
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-gray-100 border border-white flex items-center justify-center" title="Unassigned">
                                                        <User className="h-3 w-3 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            {task.due_date && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(task.due_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Task Input */}
                                {addingToCol === column.id ? (
                                    <div className="bg-white p-3 rounded-xl border-2 border-indigo-500 shadow-sm">
                                        <textarea
                                            autoFocus
                                            value={newTaskText}
                                            onChange={(e) => setNewTaskText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleAddTask(column.id)
                                                }
                                                if (e.key === 'Escape') {
                                                    setAddingToCol(null)
                                                    setNewTaskText('')
                                                }
                                            }}
                                            onBlur={() => {
                                                if (newTaskText.trim()) handleAddTask(column.id)
                                                else {
                                                    setAddingToCol(null)
                                                    setNewTaskText('')
                                                }
                                            }}
                                            placeholder="What needs to be done?"
                                            className="w-full text-sm outline-none resize-none bg-transparent"
                                            rows={2}
                                        />
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setAddingToCol(column.id)}
                                        className="w-full flex items-center gap-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 p-3 rounded-xl transition-colors font-medium text-sm"
                                    >
                                        <Plus className="h-4 w-4" /> Add Task
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            
            {/* Edit Task Modal */}
            <AnimatePresence>
                {editingTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                            onClick={() => setEditingTask(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-xl font-bold text-gray-900">Edit Tugas</h3>
                                <button
                                    onClick={() => setEditingTask(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Tugas</label>
                                    <input
                                        type="text"
                                        value={editingTask.title}
                                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
                                    <textarea
                                        value={editingTask.description || ''}
                                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm min-h-[100px]"
                                        placeholder="Tambahkan detail tugas..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                                        <select
                                            value={editingTask.status}
                                            onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                                        >
                                            {COLUMNS.map(col => (
                                                <option key={col.id} value={col.id}>{col.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tenggat Waktu</label>
                                        <input
                                            type="date"
                                            value={editingTask.due_date ? editingTask.due_date.split('T')[0] : ''}
                                            onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Penugasan</label>
                                    {editingTask.assignee_id === currentUser?.id ? (
                                        <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                                                    ME
                                                </div>
                                                <span className="text-sm font-semibold text-indigo-900">Ditugaskan pada Anda</span>
                                            </div>
                                            <button 
                                                onClick={() => setEditingTask({ ...editingTask, assignee_id: null })}
                                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setEditingTask({ ...editingTask, assignee_id: currentUser?.id })}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all font-medium text-sm"
                                        >
                                            <User className="h-4 w-4" />
                                            Tugaskan Pada Saya
                                        </button>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">Tugas yang ditugaskan pada Anda akan muncul di halaman "My Tasks".</p>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between mt-auto">
                                <button
                                    onClick={() => handleDeleteTask(editingTask.id)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" /> Hapus
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setEditingTask(null)}
                                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => handleUpdateTask(editingTask)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
                                    >
                                        <Save className="h-4 w-4" /> Simpan
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingTaskId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                            onClick={() => setDeletingTaskId(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
                            <div className="p-6 text-center pt-8">
                                <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                    <Trash2 className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Tugas?</h3>
                                <p className="text-sm text-gray-500">
                                    Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
                                <button
                                    onClick={() => setDeletingTaskId(null)}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDeleteTask}
                                    className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 shadow-md shadow-red-200 transition-all flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" /> Hapus
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    )
}
