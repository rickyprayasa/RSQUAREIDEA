'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CreditCard, ExternalLink, Building, Pencil, QrCode, Loader2, Trash2, AlertTriangle } from 'lucide-react'

interface Payment {
    id: number
    name: string
    type: 'internal' | 'external'
    bankName: string | null
    accountNumber: string | null
    accountName: string | null
    qrCodeImage: string | null
    externalUrl: string | null
    instructions: string | null
    isActive: boolean
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; payment: Payment | null }>({ isOpen: false, payment: null })
    const [deleting, setDeleting] = useState(false)

    const fetchPayments = async () => {
        try {
            const res = await fetch('/api/admin/payments')
            const data = await res.json()
            if (data.payments) {
                setPayments(data.payments)
            }
        } catch (error) {
            console.error('Error fetching payments:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayments()
    }, [])

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await fetch(`/api/admin/payments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            })
            fetchPayments()
        } catch (error) {
            console.error('Error toggling status:', error)
        }
    }

    const handleDelete = async () => {
        if (!deleteModal.payment) return
        setDeleting(true)
        try {
            await fetch(`/api/admin/payments/${deleteModal.payment.id}`, { method: 'DELETE' })
            fetchPayments()
            setDeleteModal({ isOpen: false, payment: null })
        } catch (error) {
            console.error('Error deleting payment:', error)
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Metode Pembayaran</h1>
                    <p className="text-gray-500 mt-1">Kelola pilihan pembayaran untuk pelanggan</p>
                </div>
                <Link
                    href="/admin/payments/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
                >
                    <Plus className="h-5 w-5" />
                    Tambah Metode
                </Link>
            </div>

            {payments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12 text-center">
                    <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Metode Pembayaran</h3>
                    <p className="text-gray-500 mb-6">Tambahkan metode pembayaran untuk pelanggan</p>
                    <Link
                        href="/admin/payments/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Metode Pertama
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {payments.map((payment) => (
                        <div
                            key={payment.id}
                            className={`bg-white rounded-2xl border p-5 transition-all shadow-lg hover:shadow-xl ${payment.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${payment.type === 'external' ? 'bg-purple-100' : 'bg-blue-100'
                                        }`}>
                                        {payment.type === 'external' ? (
                                            <ExternalLink className="h-6 w-6 text-purple-600" />
                                        ) : payment.qrCodeImage ? (
                                            <QrCode className="h-6 w-6 text-blue-600" />
                                        ) : (
                                            <Building className="h-6 w-6 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{payment.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${payment.type === 'external'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {payment.type === 'external' ? 'External' : 'Transfer'}
                                            </span>
                                        </div>
                                        {payment.bankName && (
                                            <p className="text-sm text-gray-500">{payment.bankName} - {payment.accountNumber}</p>
                                        )}
                                        {payment.type === 'external' && payment.externalUrl && (
                                            <p className="text-sm text-gray-500 truncate max-w-xs">{payment.externalUrl}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleStatus(payment.id, payment.isActive)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${payment.isActive ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${payment.isActive ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                    <Link
                                        href={`/admin/payments/${payment.id}`}
                                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, payment })}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setDeleteModal({ isOpen: false, payment: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Metode Pembayaran?</h3>
                                <p className="text-gray-500 mb-6">
                                    Apakah Anda yakin ingin menghapus <strong className="text-gray-900">{deleteModal.payment?.name}</strong>?
                                    Tindakan ini tidak dapat dibatalkan.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: false, payment: null })}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {deleting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Menghapus...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4" />
                                                Hapus
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
