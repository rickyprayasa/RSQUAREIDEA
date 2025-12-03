'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, CreditCard, ExternalLink, Building, Pencil, QrCode, Loader2, Trash2 } from 'lucide-react'

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

    const deletePayment = async (id: number) => {
        if (!confirm('Yakin ingin menghapus metode pembayaran ini?')) return
        try {
            await fetch(`/api/admin/payments/${id}`, { method: 'DELETE' })
            fetchPayments()
        } catch (error) {
            console.error('Error deleting payment:', error)
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
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
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
                            className={`bg-white rounded-xl border p-5 transition-all ${
                                payment.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        payment.type === 'external' ? 'bg-purple-100' : 'bg-blue-100'
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
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                payment.type === 'external' 
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
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            payment.isActive ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                payment.isActive ? 'translate-x-6' : 'translate-x-1'
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
                                        onClick={() => deletePayment(payment.id)}
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
        </div>
    )
}
