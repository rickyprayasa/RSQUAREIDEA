'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Star,
    Eye,
    Check,
    X,
    Loader2,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Quote,
    Trash2,
    User,
    ExternalLink,
    Calendar,
    Clock
} from 'lucide-react'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'

interface Feedback {
    id: number
    name: string | null
    social_media: string | null
    social_media_url: string | null
    template_name: string | null
    rating: number
    likes: string | null
    improvements: string | null
    testimonial_permission: boolean
    status: 'new' | 'reviewed' | 'published'
    created_at: string
}

const statusConfig = {
    new: { label: 'Baru', color: 'bg-blue-100 text-blue-700' },
    reviewed: { label: 'Ditinjau', color: 'bg-yellow-100 text-yellow-700' },
    published: { label: 'Dipublikasi', color: 'bg-green-100 text-green-700' },
}

export default function FeedbackPage() {
    const [feedback, setFeedback] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
    const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'published'>('all')
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; feedback: Feedback | null }>({ isOpen: false, feedback: null })
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        fetchFeedback()
    }, [])

    const fetchFeedback = async () => {
        try {
            const res = await fetch('/api/admin/feedback')
            const data = await res.json()
            if (data.feedback) setFeedback(data.feedback)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await fetch('/api/admin/feedback', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            })
            await fetchFeedback()
            setSelectedFeedback(null)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleDelete = async () => {
        if (!deleteModal.feedback) return
        setIsDeleting(true)
        try {
            const res = await fetch('/api/admin/feedback', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deleteModal.feedback.id }),
            })
            if (res.ok) {
                await fetchFeedback()
                setSelectedFeedback(null)
                setDeleteModal({ isOpen: false, feedback: null })
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    const filteredFeedback = feedback.filter(f => filter === 'all' || f.status === filter)
    const newCount = feedback.filter(f => f.status === 'new').length
    const avgRating = feedback.length > 0
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
        : '0'

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
                        <h1 className="text-2xl font-bold text-gray-900">Feedback & Testimoni</h1>
                        {newCount > 0 && (
                            <span className="px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
                                {newCount} Baru
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 mt-1">Kelola masukan dari pengguna</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200">
                    <Star className="h-5 w-5 text-amber-500 fill-current" />
                    <span className="text-lg font-bold text-amber-700">{avgRating}</span>
                    <span className="text-sm text-amber-600">Rata-rata</span>
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                {(['all', 'new', 'reviewed', 'published'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {f === 'all' && 'Semua'}
                        {f === 'new' && `Baru (${feedback.filter(fb => fb.status === 'new').length})`}
                        {f === 'reviewed' && 'Ditinjau'}
                        {f === 'published' && 'Dipublikasi'}
                    </button>
                ))}
            </div>

            {filteredFeedback.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <MessageSquare className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Feedback</h3>
                    <p className="text-gray-500">Feedback dari pengguna akan muncul di sini</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredFeedback.map((fb) => {
                        const status = statusConfig[fb.status]

                        return (
                            <motion.div
                                key={fb.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedFeedback(fb)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-5 w-5 ${i < fb.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                                                {status.label}
                                            </span>
                                            {fb.testimonial_permission && (
                                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                                                    <Quote className="h-3 w-3 inline mr-1" />
                                                    Boleh dikutip
                                                </span>
                                            )}
                                        </div>
                                        {fb.name && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-semibold text-gray-900">{fb.name}</span>
                                                {fb.social_media && (
                                                    <span className="text-sm text-pink-500">{fb.social_media}</span>
                                                )}
                                            </div>
                                        )}
                                        {fb.template_name && (
                                            <p className="text-sm font-medium text-orange-600 mb-1">{fb.template_name}</p>
                                        )}
                                        {fb.likes && (
                                            <p className="text-gray-600 text-sm line-clamp-2">{fb.likes}</p>
                                        )}
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(fb.created_at).toLocaleDateString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Detail Modal */}
            {selectedFeedback && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Detail Feedback</h2>
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-6 w-6 ${i < selectedFeedback.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{selectedFeedback.rating}/5</span>
                                </div>

                                {/* User Info */}
                                {(selectedFeedback.name || selectedFeedback.social_media) && (
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <label className="text-sm text-gray-500 mb-2 block">Pengguna</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold">
                                                {selectedFeedback.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{selectedFeedback.name || 'Anonim'}</p>
                                                {selectedFeedback.social_media && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-pink-500">{selectedFeedback.social_media}</span>
                                                        {selectedFeedback.social_media_url && (
                                                            <a
                                                                href={selectedFeedback.social_media_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:text-blue-600"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedFeedback.template_name && (
                                    <div>
                                        <label className="text-sm text-gray-500">Template</label>
                                        <p className="font-medium text-orange-600">{selectedFeedback.template_name}</p>
                                    </div>
                                )}

                                {selectedFeedback.likes && (
                                    <div>
                                        <label className="text-sm text-gray-500 flex items-center gap-1">
                                            <ThumbsUp className="h-4 w-4" /> Yang Disukai
                                        </label>
                                        <p className="mt-1 p-4 bg-green-50 rounded-xl text-gray-700 whitespace-pre-wrap">
                                            {selectedFeedback.likes}
                                        </p>
                                    </div>
                                )}

                                {selectedFeedback.improvements && (
                                    <div>
                                        <label className="text-sm text-gray-500 flex items-center gap-1">
                                            <ThumbsDown className="h-4 w-4" /> Saran Perbaikan
                                        </label>
                                        <p className="mt-1 p-4 bg-amber-50 rounded-xl text-gray-700 whitespace-pre-wrap">
                                            {selectedFeedback.improvements}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="h-4 w-4" />
                                    {new Date(selectedFeedback.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => handleUpdateStatus(selectedFeedback.id, 'reviewed')}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
                                    >
                                        <Eye className="h-5 w-5" />
                                        Tandai Ditinjau
                                    </button>
                                    {selectedFeedback.testimonial_permission && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedFeedback.id, 'published')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                                        >
                                            <Check className="h-5 w-5" />
                                            Publikasi
                                        </button>
                                    )}
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, feedback: selectedFeedback })}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="h-5 w-5" />
                                    Hapus Feedback
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, feedback: null })}
                onConfirm={handleDelete}
                title="Hapus Feedback"
                message="Apakah Anda yakin ingin menghapus feedback ini?"
                itemName={deleteModal.feedback?.name || 'Anonim'}
                isDeleting={isDeleting}
            />
        </div>
    )
}
