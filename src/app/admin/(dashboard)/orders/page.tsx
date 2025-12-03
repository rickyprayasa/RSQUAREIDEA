'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Clock, CheckCircle, XCircle, Eye, ChevronDown, Mail, Phone, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
}

const statusConfig = {
    pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    paid: { label: 'Dibayar', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    confirmed: { label: 'Dikonfirmasi', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
    completed: { label: 'Selesai', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders')
            const data = await res.json()
            if (data.orders) setOrders(data.orders)
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
                <p className="text-gray-500 mt-1">Kelola pesanan pelanggan ({orders.length} pesanan)</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada pesanan</p>
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => {
                                    const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                                    const StatusIcon = status.icon
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
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
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
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg">Detail Pesanan</h3>
                                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 font-mono mt-1">{selectedOrder.orderNumber}</p>
                            </div>

                            <div className="p-6 space-y-6">
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
                                    <h4 className="font-semibold text-gray-900 mb-3">Status</h4>
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
