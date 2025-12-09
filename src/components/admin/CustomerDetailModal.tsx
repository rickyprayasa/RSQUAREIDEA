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
    Check
} from 'lucide-react'

interface Product {
    id: number
    title: string
}

interface Customer {
    id: number
    name: string
    email: string
    phone: string | null
    source?: string
    notes?: string
    purchased_products?: string[]
    feedback_email_sent_at?: string | null
    feedback_voucher_code?: string | null
    voucher_sent_at?: string | null
    total_orders: number
    total_spent: number
    last_order_at: string | null
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

export default function CustomerDetailModal({ isOpen, onClose, onUpdate, customer }: CustomerDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        source: '',
        notes: '',
    })

    useEffect(() => {
        if (isOpen && customer) {
            setForm({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                source: customer.source || 'website',
                notes: customer.notes || '',
            })
            setSelectedProducts(customer.purchased_products || customer.products || [])
            setIsEditing(false)
            setError('')
            
            // Fetch products
            fetch('/api/products')
                .then(res => res.json())
                .then(data => {
                    if (data.products) setProducts(data.products)
                })
                .catch(console.error)
        }
    }, [isOpen, customer])

    const toggleProduct = (title: string) => {
        setSelectedProducts(prev => 
            prev.includes(title) 
                ? prev.filter(p => p !== title)
                : [...prev, title]
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

    if (!isOpen || !customer) return null

    const isComplete = customer.name && customer.email && (customer.products?.length > 0 || selectedProducts.length > 0)

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
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {customer.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Detail Pelanggan</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {isComplete ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                                <CheckCircle className="h-3 w-3" />
                                                Data lengkap
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                                <AlertCircle className="h-3 w-3" />
                                                Data belum lengkap
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isEditing && (
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

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Name */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <User className="h-4 w-4 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Nama</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{customer.name || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Email</p>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{customer.email || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Telepon</p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{customer.phone || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Source */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Tag className="h-4 w-4 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Sumber</p>
                                    {isEditing ? (
                                        <select
                                            value={form.source}
                                            onChange={(e) => setForm({ ...form, source: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                                        >
                                            {SOURCE_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="font-medium text-gray-900">
                                            {SOURCE_OPTIONS.find(o => o.value === customer.source)?.label || customer.source || '-'}
                                        </p>
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
                                                <label
                                                    key={product.id}
                                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${
                                                        selectedProducts.includes(product.title)
                                                            ? 'bg-orange-50 text-orange-700'
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProducts.includes(product.title)}
                                                        onChange={() => toggleProduct(product.title)}
                                                        className="rounded text-orange-500 focus:ring-orange-500"
                                                    />
                                                    <span className="truncate">{product.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {customer.products?.length > 0 ? (
                                                customer.products.map((p, i) => (
                                                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                                        {p}
                                                    </span>
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
                                        <textarea
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
                                        />
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
                                        {customer.voucher_sent_at ? (
                                            <p className="text-xs text-green-600 mt-1">
                                                ✓ Terkirim {new Date(customer.voucher_sent_at).toLocaleDateString('id-ID')}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-amber-600 mt-1">
                                                Menunggu feedback dari pelanggan
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Terdaftar</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(customer.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        {isEditing && (
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
                </div>
            )}
        </AnimatePresence>
    )
}
