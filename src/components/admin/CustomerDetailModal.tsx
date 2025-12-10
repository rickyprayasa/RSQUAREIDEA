'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    X, 
    Loader2, 
    User, 
    Mail, 
    Phone, 
    ShoppingBag, 
    Calendar,
    Tag,
    FileText,
    Gift,
    CheckCircle,
    AlertCircle,
    Pencil,
    Check,
    Plus,
    Receipt,
    Trash2,
    Clock,
    DollarSign
} from 'lucide-react'
import AddTransactionModal from './AddTransactionModal'

interface Product {
    id: number
    title: string
}

interface Transaction {
    id: number
    product_name: string
    amount: number
    platform: string
    purchase_date: string
    notes: string | null
    created_at: string
}

interface Customer {
    id: number
    name: string
    email: string
    phone: string | null
    source?: string
    notes?: string
    tags?: string[]
    status?: string
    purchased_products?: string[]
    feedback_email_sent_at?: string | null
    feedback_voucher_code?: string | null
    voucher_sent_at?: string | null
    total_orders: number
    total_spent: number
    last_order_at: string | null
    last_activity_at?: string | null
    created_at: string
    products: string[]
}

interface CustomerDetailModalProps {
    isOpen: boolean
    onClose: () => void
    onUpdate: () => void
    customer: Customer | null
}

const SOURCE_OPTIONS = [
    { value: 'website', label: 'Website' },
    { value: 'lynk_id', label: 'Lynk.id' },
    { value: 'karyakarsa', label: 'Karyakarsa' },
    { value: 'mayar', label: 'Mayar' },
    { value: 'other', label: 'Lainnya' },
]

const TAG_OPTIONS = [
    { value: 'vip', label: 'VIP', color: 'bg-amber-100 text-amber-700' },
    { value: 'repeat_buyer', label: 'Repeat Buyer', color: 'bg-green-100 text-green-700' },
    { value: 'new_customer', label: 'New Customer', color: 'bg-blue-100 text-blue-700' },
    { value: 'potential', label: 'Potential', color: 'bg-purple-100 text-purple-700' },
]

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-700' },
    { value: 'vip', label: 'VIP', color: 'bg-amber-100 text-amber-700' },
]

const PLATFORM_LABELS: Record<string, string> = {
    website: 'Website',
    lynk_id: 'Lynk.id',
    karyakarsa: 'Karyakarsa',
    mayar: 'Mayar',
    tokopedia: 'Tokopedia',
    shopee: 'Shopee',
    import: 'Import',
    other: 'Lainnya',
}

export default function CustomerDetailModal({ isOpen, onClose, onUpdate, customer }: CustomerDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'transactions'>('info')
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loadingTransactions, setLoadingTransactions] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [addTransactionModal, setAddTransactionModal] = useState(false)
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        source: '',
        status: 'active',
        notes: '',
    })

    useEffect(() => {
        if (isOpen && customer) {
            setForm({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                source: customer.source || 'website',
                status: customer.status || 'active',
                notes: customer.notes || '',
            })
            setSelectedProducts(customer.purchased_products || customer.products || [])
            setSelectedTags(customer.tags || [])
            setIsEditing(false)
            setError('')
            setActiveTab('info')
            
            // Fetch products
            fetch('/api/products')
                .then(res => res.json())
                .then(data => {
                    if (data.products) setProducts(data.products)
                })
                .catch(console.error)

            // Fetch transactions
            fetchTransactions()
        }
    }, [isOpen, customer])

    const fetchTransactions = async () => {
        if (!customer) return
        setLoadingTransactions(true)
        try {
            const res = await fetch(`/api/admin/customers/transactions?customer_id=${customer.id}`)
            const data = await res.json()
            if (data.transactions) setTransactions(data.transactions)
        } catch (err) {
            console.error('Error fetching transactions:', err)
        } finally {
            setLoadingTransactions(false)
        }
    }

    const toggleProduct = (title: string) => {
        setSelectedProducts(prev => 
            prev.includes(title) 
                ? prev.filter(p => p !== title)
                : [...prev, title]
        )
    }

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    const handleSave = async () => {
        if (!customer) return
        setError('')
        setLoading(true)

        try {
            const res = await fetch(`/api/admin/customers/${customer.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    purchased_products: selectedProducts,
                    tags: selectedTags,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Gagal menyimpan')

            setIsEditing(false)
            onUpdate()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTransaction = async (transactionId: number) => {
        if (!confirm('Hapus transaksi ini?')) return

        try {
            const res = await fetch(`/api/admin/customers/transactions?id=${transactionId}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                fetchTransactions()
                onUpdate()
            }
        } catch (err) {
            console.error('Error deleting transaction:', err)
        }
    }

    if (!isOpen || !customer) return null

    const isComplete = customer.name && customer.email && (customer.products?.length > 0 || selectedProducts.length > 0)
    const statusOption = STATUS_OPTIONS.find(s => s.value === (customer.status || 'active'))

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {customer.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusOption?.color}`}>
                                            {statusOption?.label}
                                        </span>
                                        {customer.tags?.map(tag => {
                                            const tagOpt = TAG_OPTIONS.find(t => t.value === tag)
                                            return tagOpt ? (
                                                <span key={tag} className={`px-2 py-0.5 rounded text-xs font-medium ${tagOpt.color}`}>
                                                    {tagOpt.label}
                                                </span>
                                            ) : null
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isEditing && activeTab === 'info' && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                    >
                                        <Pencil className="h-5 w-5" />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'info' 
                                        ? 'text-orange-600 border-b-2 border-orange-500' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <User className="inline h-4 w-4 mr-1" />
                                Informasi
                            </button>
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'transactions' 
                                        ? 'text-orange-600 border-b-2 border-orange-500' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Receipt className="inline h-4 w-4 mr-1" />
                                Transaksi ({transactions.length})
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            {activeTab === 'info' ? (
                                <div className="space-y-4">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-bold text-blue-600">{customer.total_orders || 0}</p>
                                            <p className="text-xs text-blue-600">Pesanan</p>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-3 text-center">
                                            <p className="text-lg font-bold text-green-600">Rp {((customer.total_spent || 0) / 1000).toFixed(0)}k</p>
                                            <p className="text-xs text-green-600">Total Belanja</p>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                                            <p className="text-sm font-bold text-purple-600">
                                                {customer.last_activity_at 
                                                    ? new Date(customer.last_activity_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                                                    : '-'
                                                }
                                            </p>
                                            <p className="text-xs text-purple-600">Aktivitas Terakhir</p>
                                        </div>
                                    </div>

                                    {/* Email & Phone */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Mail className="h-4 w-4 text-gray-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                                {isEditing ? (
                                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                                                ) : (
                                                    <p className="font-medium text-gray-900 truncate">{customer.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Telepon</p>
                                                {isEditing ? (
                                                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                                                ) : (
                                                    <p className="font-medium text-gray-900">{customer.phone || '-'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Source & Status */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Tag className="h-4 w-4 text-gray-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Sumber</p>
                                                {isEditing ? (
                                                    <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white">
                                                        {SOURCE_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <p className="font-medium text-gray-900">{SOURCE_OPTIONS.find(o => o.value === customer.source)?.label || '-'}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="h-4 w-4 text-gray-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Status</p>
                                                {isEditing ? (
                                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white">
                                                        {STATUS_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <p className="font-medium text-gray-900">{statusOption?.label || 'Active'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Tag className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 mb-1">Tags</p>
                                            {isEditing ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {TAG_OPTIONS.map((tag) => (
                                                        <button
                                                            key={tag.value}
                                                            onClick={() => toggleTag(tag.value)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                                selectedTags.includes(tag.value)
                                                                    ? tag.color + ' ring-2 ring-offset-1 ring-gray-300'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {tag.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {customer.tags && customer.tags.length > 0 ? (
                                                        customer.tags.map(tag => {
                                                            const tagOpt = TAG_OPTIONS.find(t => t.value === tag)
                                                            return tagOpt ? (
                                                                <span key={tag} className={`px-2 py-1 rounded text-xs font-medium ${tagOpt.color}`}>
                                                                    {tagOpt.label}
                                                                </span>
                                                            ) : null
                                                        })
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Belum ada tag</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Products */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <ShoppingBag className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 mb-1">Produk yang Dibeli</p>
                                            {isEditing ? (
                                                <div className="border border-gray-200 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                                                    {products.map((product) => (
                                                        <label key={product.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${selectedProducts.includes(product.title) ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-50'}`}>
                                                            <input type="checkbox" checked={selectedProducts.includes(product.title)} onChange={() => toggleProduct(product.title)} className="rounded text-orange-500 focus:ring-orange-500" />
                                                            <span className="truncate">{product.title}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {customer.products?.length > 0 ? (
                                                        customer.products.map((p, i) => (
                                                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{p}</span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Belum ada produk</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 mb-1">Catatan</p>
                                            {isEditing ? (
                                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none" />
                                            ) : (
                                                <p className="text-gray-900 text-sm">{customer.notes || '-'}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Voucher Status */}
                                    {customer.feedback_voucher_code && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Gift className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Voucher Feedback</p>
                                                <p className="font-mono font-medium text-green-600">{customer.feedback_voucher_code}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Registered Date */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 mb-1">Terdaftar</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(customer.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Transactions Tab */
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-gray-900">Riwayat Transaksi</h4>
                                        <button
                                            onClick={() => setAddTransactionModal(true)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Tambah
                                        </button>
                                    </div>

                                    {loadingTransactions ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                        </div>
                                    ) : transactions.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Receipt className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                            <p>Belum ada transaksi</p>
                                            <p className="text-sm">Klik tombol Tambah untuk input transaksi manual</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {transactions.map((tx) => (
                                                <div key={tx.id} className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{tx.product_name}</p>
                                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <DollarSign className="h-3 w-3" />
                                                                    Rp {(tx.amount || 0).toLocaleString('id-ID')}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Tag className="h-3 w-3" />
                                                                    {PLATFORM_LABELS[tx.platform] || tx.platform}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {new Date(tx.purchase_date).toLocaleDateString('id-ID')}
                                                                </span>
                                                            </div>
                                                            {tx.notes && (
                                                                <p className="text-xs text-gray-400 mt-1">{tx.notes}</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteTransaction(tx.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {isEditing && activeTab === 'info' && (
                            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 text-gray-700 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-5 w-5" />
                                            Simpan
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* Add Transaction Modal */}
                    <AddTransactionModal
                        isOpen={addTransactionModal}
                        onClose={() => setAddTransactionModal(false)}
                        onSuccess={() => {
                            fetchTransactions()
                            onUpdate()
                        }}
                        customerId={customer.id}
                        customerName={customer.name}
                    />
                </div>
            )}
        </AnimatePresence>
    )
}
