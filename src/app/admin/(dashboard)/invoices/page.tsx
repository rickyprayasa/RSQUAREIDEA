'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    Plus,
    Send,
    Check,
    X,
    Loader2,
    Clock,
    DollarSign,
    Mail,
    Phone,
    User,
    Trash2,
    AlertTriangle,
    Package,
    ExternalLink,
    Download,
    Pencil,
    XCircle,
    Receipt,
    ChevronDown,
    Eye
} from 'lucide-react'
import { DEFAULT_TERMS } from '@/lib/invoice-pdf'

interface InvoiceItem {
    name: string
    qty: number
    price: number
}

interface Invoice {
    id: number
    request_id: number | null
    invoice_number: string
    customer_name: string
    customer_email: string
    customer_phone: string | null
    description: string | null
    app_type: string | null
    items: InvoiceItem[]
    subtotal: number
    tax_percent: number
    tax_amount: number
    discount: number
    total: number
    status: 'draft' | 'sent' | 'paid' | 'cancelled'
    due_date: string | null
    paid_at: string | null
    sent_at: string | null
    notes: string | null
    terms_conditions: string | null
    delivery_status: 'pending' | 'delivered'
    delivery_url: string | null
    delivery_file_url: string | null
    delivered_at: string | null
    created_at: string
    template_requests?: {
        template_name: string
        name: string
        email: string
    } | null
}

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
    sent: { label: 'Terkirim', color: 'bg-blue-100 text-blue-700', icon: Send },
    paid: { label: 'Lunas', color: 'bg-green-100 text-green-700', icon: Check },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function InvoicesPage() {
    const searchParams = useSearchParams()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'cancelled'>('all')
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
    const [showCreate, setShowCreate] = useState(false)
    const [showDeliver, setShowDeliver] = useState(false)
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; invoice: Invoice | null }>({ isOpen: false, invoice: null })
    const [sending, setSending] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })

    // Create form state
    const [form, setForm] = useState({
        id: undefined as number | undefined,
        request_id: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        description: '',
        app_type: '',
        items: [{ name: '', qty: 1, price: 0 }] as InvoiceItem[],
        tax_percent: 0,
        discount: 0,
        due_date: '',
        notes: '',
        terms_conditions: DEFAULT_TERMS,
    })

    // Deliver form state
    const [deliverForm, setDeliverForm] = useState({
        delivery_url: '',
        delivery_file_url: '',
        message: '',
    })

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
    }, [])

    const fetchInvoices = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/request-invoices')
            const data = await res.json()
            if (data.invoices) setInvoices(data.invoices)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchInvoices()
    }, [fetchInvoices])

    // Auto-open create modal with prefilled data from requests page
    useEffect(() => {
        if (searchParams.get('create') === '1') {
            const prefill = sessionStorage.getItem('prefill_invoice')
            if (prefill) {
                try {
                    const data = JSON.parse(prefill)
                    setForm(prev => ({
                        ...prev,
                        request_id: data.request_id?.toString() || '',
                        customer_name: data.customer_name || '',
                        customer_email: data.customer_email || '',
                        customer_phone: data.customer_phone || '',
                        description: data.description || '',
                    }))
                    sessionStorage.removeItem('prefill_invoice')
                } catch (e) {
                    console.error('Failed to parse prefill data:', e)
                }
            }
            setShowCreate(true)
        }
    }, [searchParams])

    const createInvoice = async () => {
        setActionLoading(true)
        try {
            const res = await fetch('/api/admin/request-invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    request_id: form.request_id ? parseInt(form.request_id) : null,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                showToast('Invoice berhasil dibuat!', 'success')
                setShowCreate(false)
                setForm({
                    id: undefined,
                    request_id: '',
                    customer_name: '',
                    customer_email: '',
                    customer_phone: '',
                    description: '',
                    app_type: '',
                    items: [{ name: '', qty: 1, price: 0 }],
                    tax_percent: 0,
                    discount: 0,
                    due_date: '',
                    notes: '',
                    terms_conditions: DEFAULT_TERMS,
                })
                await fetchInvoices()
            } else {
                showToast(data.error || 'Gagal membuat invoice', 'error')
            }
        } catch {
            showToast('Gagal membuat invoice', 'error')
        } finally {
            setActionLoading(false)
        }
    }

    const sendInvoice = async (invoiceId: number) => {
        setSending(true)
        try {
            const res = await fetch('/api/admin/request-invoices/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId }),
            })
            if (res.ok) {
                showToast('Invoice berhasil dikirim ke email!', 'success')
                setSelectedInvoice(null)
                await fetchInvoices()
            } else {
                const d = await res.json()
                showToast(d.details || d.error || 'Gagal mengirim invoice', 'error')
            }
        } catch (error: any) {
            showToast(error?.message || 'Gagal mengirim invoice', 'error')
        } finally {
            setSending(false)
        }
    }

    const markAsPaid = async (invoiceId: number) => {
        setActionLoading(true)
        try {
            const res = await fetch('/api/admin/request-invoices', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: invoiceId, status: 'paid' }),
            })
            if (res.ok) {
                showToast('Invoice ditandai lunas!', 'success')
                setSelectedInvoice(null)
                await fetchInvoices()
            }
        } catch {
            showToast('Gagal update status', 'error')
        } finally {
            setActionLoading(false)
        }
    }

    const cancelInvoice = async (invoiceId: number) => {
        setActionLoading(true)
        try {
            const res = await fetch('/api/admin/request-invoices', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: invoiceId, status: 'cancelled' }),
            })
            if (res.ok) {
                showToast('Invoice dibatalkan', 'success')
                setSelectedInvoice(null)
                await fetchInvoices()
            }
        } catch {
            showToast('Gagal update status', 'error')
        } finally {
            setActionLoading(false)
        }
    }

    const deliverApp = async () => {
        if (!selectedInvoice) return
        setActionLoading(true)
        try {
            const res = await fetch('/api/admin/request-invoices/deliver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceId: selectedInvoice.id,
                    deliveryUrl: deliverForm.delivery_url || null,
                    deliveryFileUrl: deliverForm.delivery_file_url || null,
                    message: deliverForm.message || null,
                }),
            })
            if (res.ok) {
                showToast('Aplikasi berhasil dikirim ke pelanggan!', 'success')
                setShowDeliver(false)
                setDeliverForm({ delivery_url: '', delivery_file_url: '', message: '' })
                setSelectedInvoice(null)
                await fetchInvoices()
            } else {
                const d = await res.json()
                showToast(d.error || 'Gagal mengirim aplikasi', 'error')
            }
        } catch {
            showToast('Gagal mengirim aplikasi', 'error')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteModal.invoice) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/request-invoices?id=${deleteModal.invoice.id}`, { method: 'DELETE' })
            if (res.ok) {
                showToast('Invoice berhasil dihapus', 'success')
                setDeleteModal({ isOpen: false, invoice: null })
                await fetchInvoices()
            }
        } catch {
            showToast('Gagal menghapus invoice', 'error')
        } finally {
            setDeleting(false)
        }
    }

    const addItem = () => {
        setForm(prev => ({ ...prev, items: [...prev.items, { name: '', qty: 1, price: 0 }] }))
    }

    const removeItem = (idx: number) => {
        setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
    }

    const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
        }))
    }

    const filteredInvoices = invoices.filter(inv => filter === 'all' || inv.status === filter)

    const stats = {
        total: invoices.length,
        draft: invoices.filter(i => i.status === 'draft').length,
        sent: invoices.filter(i => i.status === 'sent').length,
        paid: invoices.filter(i => i.status === 'paid').length,
        totalRevenue: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0),
    }

    const calcSubtotal = form.items.reduce((s, i) => s + (i.qty * i.price), 0)
    const calcTax = calcSubtotal * (form.tax_percent / 100)
    const calcTotal = calcSubtotal + calcTax - form.discount

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-2xl text-white font-medium ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
                    <p className="text-gray-500 mt-1">Kelola invoice untuk request aplikasi</p>
                </div>
                <button
                    onClick={() => {
                        setForm({
                            id: undefined,
                            request_id: '',
                            customer_name: '',
                            customer_email: '',
                            customer_phone: '',
                            description: '',
                            app_type: '',
                            items: [{ name: '', qty: 1, price: 0 }],
                            tax_percent: 0,
                            discount: 0,
                            due_date: '',
                            notes: '',
                            terms_conditions: DEFAULT_TERMS,
                        })
                        setShowCreate(true)
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium shadow-lg shadow-orange-500/20"
                >
                    <Plus className="h-5 w-5" />
                    Buat Invoice
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Invoice', value: stats.total, icon: Receipt, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
                    { label: 'Draft', value: stats.draft, icon: FileText, color: 'from-gray-500 to-slate-500', bg: 'bg-gray-50' },
                    { label: 'Terkirim', value: stats.sent, icon: Send, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
                    { label: 'Lunas', value: stats.paid, icon: Check, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                <stat.icon className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))` }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue card */}
            {stats.totalRevenue > 0 && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-6 w-6" />
                        <div>
                            <p className="text-sm opacity-90">Total Pendapatan (Lunas)</p>
                            <p className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl overflow-x-auto">
                {(['all', 'draft', 'sent', 'paid', 'cancelled'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        {f === 'all' && 'Semua'}
                        {f === 'draft' && `Draft (${stats.draft})`}
                        {f === 'sent' && `Terkirim (${stats.sent})`}
                        {f === 'paid' && `Lunas (${stats.paid})`}
                        {f === 'cancelled' && 'Dibatalkan'}
                    </button>
                ))}
            </div>

            {/* Invoice List */}
            {filteredInvoices.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-lg">
                    <Receipt className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Invoice</h3>
                    <p className="text-gray-500">Buat invoice pertama dari request pelanggan</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredInvoices.map((inv) => {
                        const status = statusConfig[inv.status]
                        const StatusIcon = status.icon
                        return (
                            <motion.div
                                key={inv.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                                onClick={() => setSelectedInvoice(inv)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Receipt className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-bold text-gray-900">{inv.invoice_number}</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {status.label}
                                                </span>
                                                {inv.delivery_status === 'delivered' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                                                        <Package className="h-3 w-3" />
                                                        Terkirim
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{inv.customer_name} • {inv.customer_email}</p>
                                            {inv.description && (
                                                <p className="text-gray-500 text-sm mt-1 line-clamp-1">{inv.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                <span className="font-semibold text-gray-900">Rp {(inv.total || 0).toLocaleString('id-ID')}</span>
                                                {inv.due_date && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(inv.due_date).toLocaleDateString('id-ID')}
                                                    </span>
                                                )}
                                                <span>{new Date(inv.created_at).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, invoice: inv }) }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedInvoice && !showDeliver && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Detail Invoice</h2>
                                        <p className="text-sm text-gray-500">{selectedInvoice.invoice_number}</p>
                                    </div>
                                    <button onClick={() => setSelectedInvoice(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2 mb-6">
                                    {(() => {
                                        const st = statusConfig[selectedInvoice.status]
                                        const StIcon = st.icon
                                        return (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${st.color}`}>
                                                <StIcon className="h-4 w-4" /> {st.label}
                                            </span>
                                        )
                                    })()}
                                    {selectedInvoice.delivery_status === 'delivered' && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-emerald-100 text-emerald-700">
                                            <Package className="h-4 w-4" /> Aplikasi Terkirim
                                        </span>
                                    )}
                                </div>

                                {/* Customer Info */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{selectedInvoice.customer_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700 text-sm">{selectedInvoice.customer_email}</span>
                                    </div>
                                    {selectedInvoice.customer_phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-700">{selectedInvoice.customer_phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* App Type & Description */}
                                {(selectedInvoice.app_type || selectedInvoice.description) && (
                                    <div className="mb-6 flex gap-4">
                                        {selectedInvoice.app_type && (
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Jenis Aplikasi</p>
                                                <span className="inline-block px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200">{selectedInvoice.app_type}</span>
                                            </div>
                                        )}
                                        {selectedInvoice.description && (
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Deskripsi</p>
                                                <p className="text-sm text-gray-700">{selectedInvoice.description}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Items */}
                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-gray-900 mb-3">Rincian Item</p>
                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2.5 text-left text-gray-600 font-medium">Item</th>
                                                    <th className="px-4 py-2.5 text-center text-gray-600 font-medium">Qty</th>
                                                    <th className="px-4 py-2.5 text-right text-gray-600 font-medium">Harga</th>
                                                    <th className="px-4 py-2.5 text-right text-gray-600 font-medium">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(selectedInvoice.items || []).map((item, idx) => (
                                                    <tr key={idx} className="border-t border-gray-100">
                                                        <td className="px-4 py-2.5 text-gray-900">{item.name}</td>
                                                        <td className="px-4 py-2.5 text-center text-gray-600">{item.qty}</td>
                                                        <td className="px-4 py-2.5 text-right text-gray-600">Rp {item.price.toLocaleString('id-ID')}</td>
                                                        <td className="px-4 py-2.5 text-right font-medium text-gray-900">Rp {(item.qty * item.price).toLocaleString('id-ID')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="border-t border-gray-200 pt-4 mb-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-900">Rp {(selectedInvoice.subtotal || 0).toLocaleString('id-ID')}</span>
                                    </div>
                                    {selectedInvoice.tax_percent > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Pajak ({selectedInvoice.tax_percent}%)</span>
                                            <span className="text-gray-900">Rp {(selectedInvoice.tax_amount || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    {selectedInvoice.discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Diskon</span>
                                            <span className="text-red-500">- Rp {(selectedInvoice.discount || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-2 border-t border-gray-200">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-lg font-bold text-orange-600">Rp {(selectedInvoice.total || 0).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                {/* Due date & delivery info */}
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                    {selectedInvoice.due_date && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            Jatuh tempo: {new Date(selectedInvoice.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    )}
                                    {selectedInvoice.delivered_at && (
                                        <span className="flex items-center gap-1 text-green-600">
                                            <Package className="h-4 w-4" />
                                            Dikirim: {new Date(selectedInvoice.delivered_at).toLocaleDateString('id-ID')}
                                        </span>
                                    )}
                                </div>

                                {/* Delivery Links */}
                                {selectedInvoice.delivery_status === 'delivered' && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                        <p className="text-sm font-semibold text-green-800 mb-2">Link Aplikasi</p>
                                        {selectedInvoice.delivery_url && (
                                            <a href={selectedInvoice.delivery_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900">
                                                <ExternalLink className="h-4 w-4" /> {selectedInvoice.delivery_url}
                                            </a>
                                        )}
                                        {selectedInvoice.delivery_file_url && (
                                            <a href={selectedInvoice.delivery_file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 mt-1">
                                                <Download className="h-4 w-4" /> Download File
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Notes */}
                                {selectedInvoice.notes && (
                                    <div className="mb-6">
                                        <p className="text-sm text-gray-500 mb-1">Catatan</p>
                                        <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
                                    </div>
                                )}

                                {/* PDF Preview */}
                                {/* PDF Preview Make it a 2-column grid to squeeze Edit button */}
                                <div className="pt-4 border-t flex gap-3">
                                    <button
                                        onClick={() => {
                                            setForm({
                                                id: selectedInvoice.id,
                                                request_id: selectedInvoice.request_id?.toString() || '',
                                                customer_name: selectedInvoice.customer_name,
                                                customer_email: selectedInvoice.customer_email,
                                                customer_phone: selectedInvoice.customer_phone || '',
                                                description: selectedInvoice.description || '',
                                                app_type: selectedInvoice.app_type || '',
                                                items: selectedInvoice.items || [{ name: '', qty: 1, price: 0 }],
                                                tax_percent: selectedInvoice.tax_percent,
                                                discount: selectedInvoice.discount,
                                                due_date: selectedInvoice.due_date ? selectedInvoice.due_date.split('T')[0] : '',
                                                notes: selectedInvoice.notes || '',
                                                terms_conditions: selectedInvoice.terms_conditions || DEFAULT_TERMS,
                                            })
                                            setSelectedInvoice(null)
                                            setShowCreate(true)
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 text-orange-700 rounded-xl font-medium hover:bg-orange-200 transition-colors border border-orange-200"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit Invoice
                                    </button>
                                    <button
                                        onClick={() => window.open(`/api/admin/request-invoices/pdf?id=${selectedInvoice.id}`, '_blank')}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors border border-gray-200"
                                    >
                                        <Eye className="h-5 w-5" />
                                        Preview PDF
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3">
                                    {/* Primary Invoice Sequence Actions */}
                                    {(selectedInvoice.status === 'draft' || selectedInvoice.status === 'sent') && (
                                        <div className="flex gap-3">
                                            {selectedInvoice.status === 'draft' ? (
                                                <button
                                                    onClick={() => sendInvoice(selectedInvoice.id)}
                                                    disabled={sending}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                                                >
                                                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                                    Kirim Invoice
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => sendInvoice(selectedInvoice.id)}
                                                        disabled={sending}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                                                    >
                                                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                        Kirim Ulang Email
                                                    </button>
                                                    <button
                                                        onClick={() => markAsPaid(selectedInvoice.id)}
                                                        disabled={actionLoading}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        Tandai Lunas
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Delivery and Cancellation */}
                                    {selectedInvoice.status !== 'cancelled' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowDeliver(true)
                                                    setDeliverForm({
                                                        delivery_url: selectedInvoice.delivery_url || '',
                                                        delivery_file_url: selectedInvoice.delivery_file_url || '',
                                                        message: '',
                                                    })
                                                }}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${selectedInvoice.delivery_status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                                            >
                                                <Package className="h-4 w-4" />
                                                {selectedInvoice.delivery_status === 'delivered' ? 'Kirim Ulang Aplikasi' : 'Kirim Aplikasi'}
                                            </button>
                                            {selectedInvoice.status !== 'paid' && (
                                                <button
                                                    onClick={() => cancelInvoice(selectedInvoice.id)}
                                                    disabled={actionLoading}
                                                    title="Batalkan Invoice"
                                                    className="flex-none flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-500 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Deliver Modal */}
            <AnimatePresence>
                {showDeliver && selectedInvoice && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Kirim Aplikasi</h2>
                                    <button onClick={() => setShowDeliver(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-500 mb-4">
                                    Kirim link atau file aplikasi ke <strong>{selectedInvoice.customer_name}</strong> ({selectedInvoice.customer_email})
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Sheet / Web (URL)</label>
                                        <div className="relative">
                                            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="url"
                                                placeholder="https://app.example.com"
                                                value={deliverForm.delivery_url}
                                                onChange={e => setDeliverForm(prev => ({ ...prev, delivery_url: e.target.value }))}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Download Source Code / ZIP (opsional)</label>
                                        <div className="relative">
                                            <Download className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="url"
                                                placeholder="https://storage.example.com/file.zip"
                                                value={deliverForm.delivery_file_url}
                                                onChange={e => setDeliverForm(prev => ({ ...prev, delivery_file_url: e.target.value }))}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pesan Tambahan (opsional)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Instruksi penggunaan, catatan tambahan..."
                                            value={deliverForm.message}
                                            onChange={e => setDeliverForm(prev => ({ ...prev, message: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-y"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowDeliver(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={deliverApp}
                                        disabled={actionLoading || (!deliverForm.delivery_url && !deliverForm.delivery_file_url)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-medium disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Kirim ke Email
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Invoice Modal */}
            <AnimatePresence>
                {showCreate && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">{form.id ? 'Edit Invoice' : 'Buat Invoice Baru'}</h2>
                                    <button onClick={() => setShowCreate(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Customer Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan *</label>
                                            <input
                                                type="text"
                                                value={form.customer_name}
                                                onChange={e => setForm(prev => ({ ...prev, customer_name: e.target.value }))}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                placeholder="Nama lengkap"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                            <input
                                                type="email"
                                                value={form.customer_email}
                                                onChange={e => setForm(prev => ({ ...prev, customer_email: e.target.value }))}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                                            <input
                                                type="tel"
                                                value={form.customer_phone}
                                                onChange={e => setForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                placeholder="08xx"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Request ID</label>
                                            <input
                                                type="number"
                                                value={form.request_id}
                                                onChange={e => setForm(prev => ({ ...prev, request_id: e.target.value }))}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                placeholder="ID request (opsional)"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Aplikasi</label>
                                            <select
                                                value={form.app_type}
                                                onChange={e => setForm(prev => ({ ...prev, app_type: e.target.value }))}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
                                            >
                                                <option value="">Pilih jenis aplikasi</option>
                                                <option value="Google Sheets Templates">Google Sheets Templates</option>
                                                <option value="Google Web Apps">Google Web Apps</option>
                                                <option value="Full Stack Development">Full Stack Development</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Pekerjaan</label>
                                            <input
                                                type="text"
                                                value={form.description}
                                                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                placeholder="Deskripsi singkat (opsional)"
                                            />
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Item</label>
                                            <button onClick={addItem} className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                                                <Plus className="h-4 w-4" /> Tambah Item
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {form.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Nama item"
                                                        value={item.name}
                                                        onChange={e => updateItem(idx, 'name', e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Qty"
                                                        value={item.qty}
                                                        onChange={e => updateItem(idx, 'qty', parseInt(e.target.value) || 0)}
                                                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Harga"
                                                        value={item.price || ''}
                                                        onChange={e => updateItem(idx, 'price', parseInt(e.target.value) || 0)}
                                                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    />
                                                    {form.items.length > 1 && (
                                                        <button onClick={() => removeItem(idx)} className="p-1.5 text-gray-400 hover:text-red-500">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tax, Discount, Due Date */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pajak (%)</label>
                                            <input
                                                type="number"
                                                value={form.tax_percent || ''}
                                                onChange={e => setForm(prev => ({ ...prev, tax_percent: parseFloat(e.target.value) || 0 }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Diskon (Rp)</label>
                                            <input
                                                type="number"
                                                value={form.discount || ''}
                                                onChange={e => setForm(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Jatuh Tempo</label>
                                            <input
                                                type="date"
                                                value={form.due_date}
                                                onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                                        <textarea
                                            rows={2}
                                            value={form.notes}
                                            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none"
                                            placeholder="Catatan internal/untuk pelanggan..."
                                        />
                                    </div>

                                    {/* Terms & Conditions */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Syarat & Ketentuan</label>
                                        <textarea
                                            rows={3}
                                            value={form.terms_conditions}
                                            onChange={e => setForm(prev => ({ ...prev, terms_conditions: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none"
                                            placeholder="Syarat dan ketentuan (otomatis tampil di invoice)..."
                                        />
                                    </div>

                                    {/* Calculated Total */}
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="text-gray-900">Rp {calcSubtotal.toLocaleString('id-ID')}</span>
                                        </div>
                                        {form.tax_percent > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Pajak ({form.tax_percent}%)</span>
                                                <span className="text-gray-900">Rp {calcTax.toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        {form.discount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Diskon</span>
                                                <span className="text-red-500">- Rp {form.discount.toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t border-gray-200">
                                            <span className="font-bold text-gray-900">Total</span>
                                            <span className="font-bold text-orange-600">Rp {calcTotal.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowCreate(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={createInvoice}
                                        disabled={actionLoading || !form.customer_name || !form.customer_email || form.items.some(i => !i.name)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                                        {form.id ? 'Simpan Perubahan' : 'Buat Invoice'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setDeleteModal({ isOpen: false, invoice: null })}
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
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Invoice?</h3>
                                <p className="text-gray-500 mb-6">
                                    Hapus <strong className="text-gray-900">{deleteModal.invoice?.invoice_number}</strong>? Tindakan ini tidak dapat dibatalkan.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: false, invoice: null })}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Hapus
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
