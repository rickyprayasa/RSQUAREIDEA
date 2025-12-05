'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ShoppingCart, Clock, CheckCircle, XCircle, Eye, ChevronDown, Mail, Phone, Package, Trash2, Loader2, Image as ImageIcon, Check, X, ZoomIn, ZoomOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'

interface PaymentConfirmation {
    id: number
    proofImage: string
    status: 'pending' | 'approved' | 'rejected'
    notes: string | null
    adminNotes: string | null
    createdAt: string
    approvedAt: string | null
    approvedBy: string | null
}

interface Order {
    id: number
    orderNumber: string
    customerEmail: string
    customerName: string
    customerPhone: string | null
    productTitle: string
    amount: number
    paymentMethod: string | null
    status: string
    notes: string | null
    createdAt: string
    confirmation: PaymentConfirmation | null
}

const statusConfig = {
    pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    paid: { label: 'Dibayar', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    confirmed: { label: 'Dikonfirmasi', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
    completed: { label: 'Selesai', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const confirmationStatusConfig = {
    pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Disetujui', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700' },
}

type FilterType = 'all' | 'pending_confirmation' | 'pending' | 'paid' | 'completed'

export default function OrdersPage() {
    const searchParams = useSearchParams()
    const initialFilter = (searchParams.get('filter') as FilterType) || 'all'

    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; order: Order | null }>({ isOpen: false, order: null })
    const [pendingCount, setPendingCount] = useState(0)
    const [processingConfirmation, setProcessingConfirmation] = useState(false)
    const [adminNotes, setAdminNotes] = useState('')
    const [zoomedImage, setZoomedImage] = useState<string | null>(null)
    const [filter, setFilter] = useState<FilterType>(initialFilter)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders')
            const data = await res.json()
            if (data.orders) setOrders(data.orders)
            if (data.pendingConfirmationsCount !== undefined) setPendingCount(data.pendingConfirmationsCount)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (orderId: number, newStatus: string) => {
        setUpdatingStatus(orderId)
        try {
            await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            fetchOrders()
        } catch (error) {
            console.error('Error updating status:', error)
        } finally {
            setUpdatingStatus(null)
        }
    }

    const handleConfirmationAction = async (confirmationId: number, status: 'approved' | 'rejected') => {
        setProcessingConfirmation(true)
        try {
            const res = await fetch('/api/admin/qris-confirmations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: confirmationId,
                    status,
                    adminNotes,
                }),
            })

            if (res.ok) {
                await fetchOrders()
                setSelectedOrder(null)
                setAdminNotes('')
            }
        } catch (error) {
            console.error('Error updating confirmation:', error)
        } finally {
            setProcessingConfirmation(false)
        }
    }

    const deleteOrder = async () => {
        if (!deleteModal.order) return
        setDeletingId(deleteModal.order.id)
        try {
            const res = await fetch(`/api/admin/orders/${deleteModal.order.id}`, { method: 'DELETE' })
            if (res.ok) {
                await fetchOrders()
                setDeleteModal({ isOpen: false, order: null })
            }
        } catch (error) {
            console.error('Error deleting order:', error)
        } finally {
            setDeletingId(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true
        if (filter === 'pending_confirmation') return order.confirmation?.status === 'pending'
        return order.status === filter
    })

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="bg-white rounded-xl p-12">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
                        {pendingCount > 0 && (
                            <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                                {pendingCount} Menunggu Konfirmasi
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 mt-1">Kelola pesanan dan konfirmasi pembayaran ({orders.length} pesanan)</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                {[
                    { key: 'all', label: 'Semua' },
                    { key: 'pending_confirmation', label: `Menunggu Konfirmasi${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
                    { key: 'pending', label: 'Menunggu Bayar' },
                    { key: 'paid', label: 'Dibayar' },
                    { key: 'completed', label: 'Selesai' },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key as typeof filter)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === f.key
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Tidak ada pesanan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">No. Pesanan</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Pelanggan</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Produk</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Bukti Bayar</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((order) => {
                                    const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                                    const confirmStatus = order.confirmation ? confirmationStatusConfig[order.confirmation.status] : null
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                                                <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{order.customerName}</p>
                                                <p className="text-sm text-gray-500">{order.customerEmail}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-900 line-clamp-2 max-w-xs">{order.productTitle}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">Rp {order.amount.toLocaleString('id-ID')}</p>
                                                {order.paymentMethod && (
                                                    <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                                        disabled={updatingStatus === order.id}
                                                        className={`appearance-none cursor-pointer pr-8 pl-3 py-1.5 text-xs font-medium rounded-full border-0 ${status.color} ${updatingStatus === order.id ? 'opacity-50' : ''}`}
                                                    >
                                                        <option value="pending">Menunggu</option>
                                                        <option value="paid">Dibayar</option>
                                                        <option value="confirmed">Dikonfirmasi</option>
                                                        <option value="completed">Selesai</option>
                                                        <option value="cancelled">Dibatalkan</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.confirmation ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
                                                            onClick={() => setZoomedImage(order.confirmation!.proofImage)}>
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={order.confirmation.proofImage}
                                                                alt="Bukti"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                                <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${confirmStatus?.color}`}>
                                                            {confirmStatus?.label}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    {/* Quick approve/reject for pending confirmations */}
                                                    {order.confirmation?.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleConfirmationAction(order.confirmation!.id, 'approved')}
                                                                disabled={processingConfirmation}
                                                                className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Setujui Pembayaran"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleConfirmationAction(order.confirmation!.id, 'rejected')}
                                                                disabled={processingConfirmation}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Tolak Pembayaran"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, order })}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setSelectedOrder(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b bg-gray-50 sticky top-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg">Detail Pesanan</h3>
                                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 font-mono mt-1">{selectedOrder.orderNumber}</p>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        {/* Customer Info */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Data Pelanggan</h4>
                                            <div className="space-y-2">
                                                <p className="flex items-center gap-2 text-gray-600">
                                                    <span className="font-medium">{selectedOrder.customerName}</span>
                                                </p>
                                                <p className="flex items-center gap-2 text-gray-600">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    {selectedOrder.customerEmail}
                                                </p>
                                                {selectedOrder.customerPhone && (
                                                    <p className="flex items-center gap-2 text-gray-600">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        {selectedOrder.customerPhone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Products */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Produk</h4>
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <p className="flex items-start gap-2">
                                                    <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                                                    <span className="text-gray-700">{selectedOrder.productTitle}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Pembayaran</h4>
                                            <div className="p-4 bg-orange-50 rounded-xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Total</span>
                                                    <span className="text-xl font-bold text-orange-600">
                                                        Rp {selectedOrder.amount.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                {selectedOrder.paymentMethod && (
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Metode: {selectedOrder.paymentMethod}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Status Pesanan</h4>
                                            <select
                                                value={selectedOrder.status}
                                                onChange={(e) => {
                                                    updateStatus(selectedOrder.id, e.target.value)
                                                    setSelectedOrder({ ...selectedOrder, status: e.target.value })
                                                }}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            >
                                                <option value="pending">Menunggu Pembayaran</option>
                                                <option value="paid">Sudah Dibayar</option>
                                                <option value="confirmed">Dikonfirmasi</option>
                                                <option value="completed">Selesai</option>
                                                <option value="cancelled">Dibatalkan</option>
                                            </select>
                                        </div>

                                        <div className="text-xs text-gray-400">
                                            Dibuat: {formatDate(selectedOrder.createdAt)}
                                        </div>
                                    </div>

                                    {/* Right Column - Payment Proof */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Bukti Pembayaran</h4>
                                        {selectedOrder.confirmation ? (
                                            <div className="space-y-4">
                                                {/* Proof Image */}
                                                <div
                                                    className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer group"
                                                    onClick={() => setZoomedImage(selectedOrder.confirmation!.proofImage)}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={selectedOrder.confirmation.proofImage}
                                                        alt="Bukti Pembayaran"
                                                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                                                            <ZoomIn className="h-6 w-6 text-gray-700" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 text-center">Klik gambar untuk memperbesar</p>

                                                {/* Confirmation Status */}
                                                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Status Konfirmasi</span>
                                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${confirmationStatusConfig[selectedOrder.confirmation.status].color}`}>
                                                            {confirmationStatusConfig[selectedOrder.confirmation.status].label}
                                                        </span>
                                                    </div>
                                                    {selectedOrder.confirmation.notes && (
                                                        <div>
                                                            <p className="text-xs text-gray-500">Catatan Pelanggan:</p>
                                                            <p className="text-sm text-gray-700">{selectedOrder.confirmation.notes}</p>
                                                        </div>
                                                    )}
                                                    {selectedOrder.confirmation.approvedAt && (
                                                        <p className="text-xs text-gray-400">
                                                            Dikonfirmasi: {formatDate(selectedOrder.confirmation.approvedAt)}
                                                            {selectedOrder.confirmation.approvedBy && ` oleh ${selectedOrder.confirmation.approvedBy}`}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Approve/Reject Actions */}
                                                {selectedOrder.confirmation.status === 'pending' && (
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={adminNotes}
                                                            onChange={(e) => setAdminNotes(e.target.value)}
                                                            placeholder="Catatan admin (opsional)..."
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                            rows={2}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleConfirmationAction(selectedOrder.confirmation!.id, 'approved')}
                                                                disabled={processingConfirmation}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                                                            >
                                                                {processingConfirmation ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Check className="h-4 w-4" />
                                                                )}
                                                                Setujui
                                                            </button>
                                                            <button
                                                                onClick={() => handleConfirmationAction(selectedOrder.confirmation!.id, 'rejected')}
                                                                disabled={processingConfirmation}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                                                            >
                                                                {processingConfirmation ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <X className="h-4 w-4" />
                                                                )}
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-xl text-gray-400">
                                                <ImageIcon className="h-12 w-12 mb-2" />
                                                <p className="text-sm">Belum ada bukti pembayaran</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Image Zoom Modal */}
            <AnimatePresence>
                {zoomedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setZoomedImage(null)}
                    >
                        <button
                            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            onClick={() => setZoomedImage(null)}
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
                            <ZoomOut className="h-4 w-4" />
                            <span>Klik di mana saja untuk menutup</span>
                        </div>

                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            src={zoomedImage}
                            alt="Bukti Pembayaran - Fullscreen"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, order: null })}
                onConfirm={deleteOrder}
                title="Hapus Pesanan"
                message="Apakah Anda yakin ingin menghapus pesanan ini? Semua data terkait akan ikut terhapus."
                itemName={deleteModal.order?.orderNumber}
                isDeleting={deletingId !== null}
            />
        </div>
    )
}
