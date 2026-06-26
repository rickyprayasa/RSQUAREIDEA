'use client'

import { useState, useEffect } from 'react'
import { Plus, MoreHorizontal, Calendar, User } from 'lucide-react'

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

    useEffect(() => {
        if (project.project_tasks) {
            setTasks(project.project_tasks)
        }
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
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onDragEnd={handleDragEnd}
                                        className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all ${isDragging ? 'opacity-50' : ''}`}
                                    >
                                        <p className="text-sm font-medium text-gray-900 mb-3 leading-snug">{task.title}</p>
                                        
                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                                            <div className="flex -space-x-2">
                                                <div className="h-6 w-6 rounded-full bg-gray-100 border border-white flex items-center justify-center">
                                                    <User className="h-3 w-3 text-gray-400" />
                                                </div>
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
