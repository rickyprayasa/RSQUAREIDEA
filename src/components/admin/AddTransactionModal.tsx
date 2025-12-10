'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Receipt, X, Loader2, Calendar, Package, DollarSign } from 'lucide-react'

interface Product {
    id: number
    title: string
    price: number
}

interface AddTransactionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    customerId: number
    customerName: string
}

const PLATFORM_OPTIONS = [
    { value: 'lynk_id', label: 'Lynk.id' },
    { value: 'karyakarsa', label: 'Karyakarsa' },
    { value: 'mayar', label: 'Mayar' },
    { value: 'tokopedia', label: 'Tokopedia' },
    { value: 'shopee', label: 'Shopee' },
    { value: 'other', label: 'Lainnya' },
]

export default function AddTransactionModal({ isOpen, onClose, onSuccess, customerId, customerName }: AddTransactionModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    const [form, setForm] = useState({
        product_name: '',
        amount: '',
        platform: 'lynk_id',
        purchase_date: new Date().toISOString().split('T')[0],
        notes: '',
    })

    useEffect(() => {
        if (isOpen) {
            fetch('/api/products')
                .then(res => res.json())
                .then(data => {
                    if (data.products) setProducts(data.products)
                })
                .catch(console.error)
            
            // Reset form
            setForm({
                product_name: '',
                amount: '',
                platform: 'lynk_id',
                purchase_date: new Date().toISOString().split('T')[0],
                notes: '',
            })
            setError('')
        }
    }, [isOpen])

    const handleProductSelect = (productTitle: string) => {
        const product = products.find(p => p.title === productTitle)
        setForm({
            ...form,
            product_name: productTitle,
            amount: product ? String(product.price) : form.amount,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!form.product_name.trim()) {
            setError('Nama produk wajib diisi')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/admin/customers/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: customerId,
                    product_name: form.product_name,
                    amount: parseInt(form.amount) || 0,
                    platform: form.platform,
                    purchase_date: form.purchase_date,
                    notes: form.notes,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Gagal menambah transaksi')

            onSuccess()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

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
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Receipt className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Tambah Transaksi</h3>
                                    <p className="text-sm text-gray-500">{customerName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <Package className="inline h-4 w-4 mr-1" />
                                    Produk <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.product_name}
                                    onChange={(e) => handleProductSelect(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                >
                                    <option value="">Pilih produk...</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.title}>
                                            {product.title} - Rp {product.price.toLocaleString('id-ID')}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Atau ketik manual:</p>
                                <input
                                    type="text"
                                    value={form.product_name}
                                    onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                                    placeholder="Nama produk"
                                    className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <DollarSign className="inline h-4 w-4 mr-1" />
                                    Nominal (Rp)
                                </label>
                                <input
                                    type="number"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    placeholder="0"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Platform Pembelian
                                </label>
                                <select
                                    value={form.platform}
                                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                >
                                    {PLATFORM_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <Calendar className="inline h-4 w-4 mr-1" />
                                    Tanggal Pembelian
                                </label>
                                <input
                                    type="date"
                                    value={form.purchase_date}
                                    onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Catatan
                                </label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Catatan tambahan (opsional)"
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 text-gray-700 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Transaksi'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
