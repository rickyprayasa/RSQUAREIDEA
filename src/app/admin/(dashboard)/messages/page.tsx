'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Mail,
    Eye,
    Reply,
    User,
    X,
    Loader2,
    MessageSquare,
    Trash2,
    Clock
} from 'lucide-react'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'

interface Message {
    id: number
    name: string
    email: string
    subject: string | null
    message: string
    status: 'unread' | 'read' | 'replied'
    admin_notes: string | null
    created_at: string
    read_at: string | null
}

const statusConfig = {
    unread: { label: 'Belum Dibaca', color: 'bg-red-100 text-red-700', icon: Mail },
    read: { label: 'Sudah Dibaca', color: 'bg-blue-100 text-blue-700', icon: Eye },
    replied: { label: 'Sudah Dibalas', color: 'bg-green-100 text-green-700', icon: Reply },
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all')
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; message: Message | null }>({ isOpen: false, message: null })

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/admin/messages')
            const data = await res.json()
            if (data.messages) setMessages(data.messages)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await fetch('/api/admin/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            })
            await fetchMessages()
            if (selectedMessage?.id === id) {
                setSelectedMessage(prev => prev ? { ...prev, status: status as Message['status'] } : null)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const openDeleteModal = (msg: Message, e: React.MouseEvent) => {
        e.stopPropagation()
        setDeleteModal({ isOpen: true, message: msg })
    }

    const deleteMessage = async () => {
        if (!deleteModal.message) return
        setDeletingId(deleteModal.message.id)
        try {
            const res = await fetch(`/api/admin/messages/${deleteModal.message.id}`, { method: 'DELETE' })
            if (res.ok) {
                await fetchMessages()
                setDeleteModal({ isOpen: false, message: null })
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setDeletingId(null)
        }
    }

    const filteredMessages = messages.filter(m => filter === 'all' || m.status === filter)
    const unreadCount = messages.filter(m => m.status === 'unread').length

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Pesan Kontak</h1>
                        {unreadCount > 0 && (
                            <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                                {unreadCount} Baru
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 mt-1">Kelola pesan dari pengunjung</p>
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                {(['all', 'unread', 'read', 'replied'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {f === 'all' && 'Semua'}
                        {f === 'unread' && `Belum Dibaca (${messages.filter(m => m.status === 'unread').length})`}
                        {f === 'read' && 'Sudah Dibaca'}
                        {f === 'replied' && 'Sudah Dibalas'}
                    </button>
                ))}
            </div>

            {filteredMessages.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <MessageSquare className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Pesan</h3>
                    <p className="text-gray-500">Pesan dari pengunjung akan muncul di sini</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredMessages.map((message) => {
                        const status = statusConfig[message.status]
                        const StatusIcon = status.icon

                        return (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow cursor-pointer ${message.status === 'unread' ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                                    }`}
                                onClick={() => {
                                    setSelectedMessage(message)
                                    if (message.status === 'unread') {
                                        handleUpdateStatus(message.id, 'read')
                                    }
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.status === 'unread' ? 'bg-red-100' : 'bg-gray-100'
                                        }`}>
                                        <User className={`h-5 w-5 ${message.status === 'unread' ? 'text-red-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900">{message.name}</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">{message.email}</p>
                                        {message.subject && (
                                            <p className="font-medium text-gray-800 mb-1">{message.subject}</p>
                                        )}
                                        <p className="text-gray-600 text-sm line-clamp-2">{message.message}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">
                                                {new Date(message.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                            <button
                                                onClick={(e) => openDeleteModal(message, e)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Detail Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Detail Pesan</h2>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                        <User className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{selectedMessage.name}</p>
                                        <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                                    </div>
                                </div>

                                {selectedMessage.subject && (
                                    <div>
                                        <label className="text-sm text-gray-500">Subjek</label>
                                        <p className="font-medium text-gray-900">{selectedMessage.subject}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm text-gray-500">Pesan</label>
                                    <p className="mt-1 p-4 bg-gray-50 rounded-xl text-gray-700 whitespace-pre-wrap">
                                        {selectedMessage.message}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="h-4 w-4" />
                                    {new Date(selectedMessage.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                                    >
                                        <Reply className="h-5 w-5" />
                                        Tandai Sudah Dibalas
                                    </button>
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Pesan dari RSQUARE'}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                                    >
                                        <Mail className="h-5 w-5" />
                                        Balas via Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, message: null })}
                onConfirm={deleteMessage}
                title="Hapus Pesan"
                message="Apakah Anda yakin ingin menghapus pesan ini?"
                itemName={deleteModal.message ? `${deleteModal.message.name} - ${deleteModal.message.subject || 'Tanpa Subjek'}` : undefined}
                isDeleting={deletingId !== null}
            />
        </div>
    )
}
