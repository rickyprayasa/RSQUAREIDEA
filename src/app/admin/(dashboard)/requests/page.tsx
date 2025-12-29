'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FileSpreadsheet,
    Clock,
    Check,
    X,
    Loader2,
    User,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    FileText,
    Play,
    XCircle,
    Trash2
} from 'lucide-react'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'

interface TemplateRequest {
    id: number
    name: string
    email: string
    phone: string | null
    template_name: string
    description: string | null
    budget: string | null
    deadline: string | null
    status: 'pending' | 'in_progress' | 'completed' | 'rejected'
    admin_notes: string | null
    created_at: string
}

const statusConfig = {
    pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    in_progress: { label: 'Dikerjakan', color: 'bg-blue-100 text-blue-700', icon: Play },
    completed: { label: 'Selesai', color: 'bg-green-100 text-green-700', icon: Check },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<TemplateRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<TemplateRequest | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'rejected'>('all')
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; request: TemplateRequest | null }>({ isOpen: false, request: null })

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/requests')
            const data = await res.json()
            if (data.requests) setRequests(data.requests)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await fetch('/api/admin/requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            })
            await fetchRequests()
            setSelectedRequest(null)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const openDeleteModal = (req: TemplateRequest, e: React.MouseEvent) => {
        e.stopPropagation()
        setDeleteModal({ isOpen: true, request: req })
    }

    const deleteRequest = async () => {
        if (!deleteModal.request) return
        setDeletingId(deleteModal.request.id)
        try {
            const res = await fetch(`/api/admin/requests/${deleteModal.request.id}`, { method: 'DELETE' })
            if (res.ok) {
                await fetchRequests()
                setDeleteModal({ isOpen: false, request: null })
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setDeletingId(null)
        }
    }

    const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter)
    const pendingCount = requests.filter(r => r.status === 'pending').length

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
                        <h1 className="text-2xl font-bold text-gray-900">Request Template</h1>
                        {pendingCount > 0 && (
                            <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-bold rounded-full">
                                {pendingCount} Pending
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 mt-1">Kelola permintaan template kustom</p>
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl overflow-x-auto">
                {(['all', 'pending', 'in_progress', 'completed', 'rejected'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {f === 'all' && 'Semua'}
                        {f === 'pending' && `Menunggu (${requests.filter(r => r.status === 'pending').length})`}
                        {f === 'in_progress' && 'Dikerjakan'}
                        {f === 'completed' && 'Selesai'}
                        {f === 'rejected' && 'Ditolak'}
                    </button>
                ))}
            </div>

            {filteredRequests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-lg">
                    <FileSpreadsheet className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Request</h3>
                    <p className="text-gray-500">Permintaan template kustom akan muncul di sini</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredRequests.map((req) => {
                        const status = statusConfig[req.status]
                        const StatusIcon = status.icon

                        return (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-2xl border p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${req.status === 'pending' ? 'border-yellow-300' : 'border-gray-200'
                                    }`}
                                onClick={() => setSelectedRequest(req)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FileSpreadsheet className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900">{req.template_name}</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">{req.name} • {req.email}</p>
                                        {req.description && (
                                            <p className="text-gray-600 text-sm line-clamp-2">{req.description}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                {req.budget && (
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        {req.budget}
                                                    </span>
                                                )}
                                                {req.deadline && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {req.deadline}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(req.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => openDeleteModal(req, e)}
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
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Detail Request</h2>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-500">Template yang Diminta</label>
                                    <p className="text-lg font-bold text-orange-600">{selectedRequest.template_name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{selectedRequest.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{selectedRequest.email}</span>
                                    </div>
                                    {selectedRequest.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-700">{selectedRequest.phone}</span>
                                        </div>
                                    )}
                                    {selectedRequest.budget && (
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-700">{selectedRequest.budget}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedRequest.description && (
                                    <div>
                                        <label className="text-sm text-gray-500 flex items-center gap-1">
                                            <FileText className="h-4 w-4" /> Deskripsi
                                        </label>
                                        <p className="mt-1 p-4 bg-gray-50 rounded-xl text-gray-700 whitespace-pre-wrap">
                                            {selectedRequest.description}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'in_progress')}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                                    >
                                        <Play className="h-5 w-5" />
                                        Mulai Kerjakan
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'completed')}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                                    >
                                        <Check className="h-5 w-5" />
                                        Selesai
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                                    >
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, request: null })}
                onConfirm={deleteRequest}
                title="Hapus Request"
                message="Apakah Anda yakin ingin menghapus request template ini?"
                itemName={deleteModal.request?.template_name}
                isDeleting={deletingId !== null}
            />
        </div>
    )
}
