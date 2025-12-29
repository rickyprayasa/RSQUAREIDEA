'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Mail,
    Phone,
    ShoppingCart,
    DollarSign,
    Download,
    Loader2,
    Search,
    Trash2,
    UserPlus,
    Send,
    CheckSquare,
    Square,
    Upload,
    Tag,
    TrendingUp
} from 'lucide-react'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'
import AddCustomerModal from '@/components/admin/AddCustomerModal'
import EmailCampaignModal from '@/components/admin/EmailCampaignModal'
import CustomerDetailModal from '@/components/admin/CustomerDetailModal'
import ImportCustomerModal from '@/components/admin/ImportCustomerModal'

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

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
    website: { label: 'Website', color: 'bg-green-100 text-green-700' },
    lynk_id: { label: 'Lynk.id', color: 'bg-purple-100 text-purple-700' },
    karyakarsa: { label: 'Karyakarsa', color: 'bg-blue-100 text-blue-700' },
    mayar: { label: 'Mayar', color: 'bg-orange-100 text-orange-700' },
    tokopedia: { label: 'Tokopedia', color: 'bg-green-100 text-green-700' },
    shopee: { label: 'Shopee', color: 'bg-orange-100 text-orange-700' },
    import: { label: 'Import', color: 'bg-cyan-100 text-cyan-700' },
    other: { label: 'Lainnya', color: 'bg-gray-100 text-gray-700' },
    manual: { label: 'Manual', color: 'bg-gray-100 text-gray-700' },
}

const TAG_LABELS: Record<string, { label: string; color: string }> = {
    vip: { label: 'VIP', color: 'bg-amber-100 text-amber-700' },
    repeat_buyer: { label: 'Repeat Buyer', color: 'bg-green-100 text-green-700' },
    new_customer: { label: 'New Customer', color: 'bg-blue-100 text-blue-700' },
    potential: { label: 'Potential', color: 'bg-purple-100 text-purple-700' },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-700' },
    vip: { label: 'VIP', color: 'bg-amber-100 text-amber-700' },
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sourceFilter, setSourceFilter] = useState<string>('all')
    const [exporting, setExporting] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; customer: Customer | null }>({ isOpen: false, customer: null })
    const [addModal, setAddModal] = useState(false)
    const [emailModal, setEmailModal] = useState(false)
    const [importModal, setImportModal] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [detailModal, setDetailModal] = useState<{ isOpen: boolean; customer: Customer | null }>({ isOpen: false, customer: null })
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [tagFilter, setTagFilter] = useState<string>('all')

    useEffect(() => {
        fetchCustomers()
    }, [])

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/admin/customers')
            const data = await res.json()
            if (data.customers) setCustomers(data.customers)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteCustomer = async () => {
        if (!deleteModal.customer) return
        setDeletingId(deleteModal.customer.id)
        try {
            const res = await fetch(`/api/admin/customers/${deleteModal.customer.id}`, { method: 'DELETE' })
            if (res.ok) {
                await fetchCustomers()
                setDeleteModal({ isOpen: false, customer: null })
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setDeletingId(null)
        }
    }

    const handleExport = async (format: 'csv' | 'excel') => {
        setExporting(true)
        try {
            const headers = ['ID', 'Nama', 'Email', 'Telepon', 'Total Pesanan', 'Total Belanja', 'Pesanan Terakhir', 'Terdaftar']
            const rows = customers.map(c => [
                c.id,
                c.name,
                c.email,
                c.phone || '-',
                c.total_orders,
                c.total_spent,
                c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('id-ID') : '-',
                new Date(c.created_at).toLocaleDateString('id-ID'),
            ])

            if (format === 'csv') {
                const csvContent = [
                    headers.join(','),
                    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
                ].join('\n')

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`
                link.click()
                URL.revokeObjectURL(url)
            } else {
                // Simple Excel format (tab-separated)
                const excelContent = [
                    headers.join('\t'),
                    ...rows.map(row => row.join('\t'))
                ].join('\n')

                const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `customers_${new Date().toISOString().split('T')[0]}.xls`
                link.click()
                URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error('Error exporting:', error)
        } finally {
            setExporting(false)
        }
    }

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            (c.phone && c.phone.includes(search))
        const matchesSource = sourceFilter === 'all' || c.source === sourceFilter
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter
        const matchesTag = tagFilter === 'all' || (c.tags && c.tags.includes(tagFilter))
        return matchesSearch && matchesSource && matchesStatus && matchesTag
    })

    const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0)

    // Analytics by source
    const sourceStats = Object.entries(SOURCE_LABELS).map(([key, val]) => {
        const sourceCustomers = customers.filter(c => c.source === key)
        return {
            source: key,
            label: val.label,
            color: val.color,
            count: sourceCustomers.length,
            revenue: sourceCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
        }
    }).filter(s => s.count > 0).sort((a, b) => b.revenue - a.revenue)

    const toggleSelect = (id: number) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredCustomers.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredCustomers.map(c => c.id)))
        }
    }

    const selectedCustomers = customers.filter(c => selectedIds.has(c.id))

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pelanggan</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Database pelanggan ({customers.length} total)</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setAddModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">Tambah</span>
                    </button>
                    <button
                        onClick={() => setImportModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-500 text-white rounded-xl text-sm font-medium hover:bg-cyan-600 transition-colors"
                    >
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">Import</span>
                    </button>
                    <button
                        onClick={() => setEmailModal(true)}
                        disabled={selectedIds.size === 0}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-4 w-4" />
                        <span className="hidden sm:inline">Email</span>
                        {selectedIds.size > 0 && <span className="ml-1">({selectedIds.size})</span>}
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={exporting}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">CSV</span>
                    </button>
                </div>
            </div>

            {/* Stats - horizontal scroll on mobile */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-lg min-w-[140px] flex-shrink-0 md:min-w-0">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center">
                            <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-gray-500">Pelanggan</p>
                            <p className="text-lg md:text-2xl font-bold text-gray-900">{customers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-lg min-w-[160px] flex-shrink-0 md:min-w-0">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg md:rounded-xl flex items-center justify-center">
                            <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-gray-500">Pendapatan</p>
                            <p className="text-lg md:text-2xl font-bold text-gray-900">Rp {(totalRevenue / 1000).toFixed(0)}k</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-lg min-w-[140px] flex-shrink-0 md:min-w-0">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-lg md:rounded-xl flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-gray-500">Pesanan</p>
                            <p className="text-lg md:text-2xl font-bold text-gray-900">{customers.reduce((sum, c) => sum + (c.total_orders || 0), 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Source Analytics */}
            {sourceStats.length > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <h3 className="font-medium text-gray-700 text-sm">Revenue per Platform</h3>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {sourceStats.slice(0, 5).map((stat) => (
                            <div
                                key={stat.source}
                                onClick={() => setSourceFilter(stat.source)}
                                className={`flex-shrink-0 px-3 py-2 rounded-lg cursor-pointer transition-all ${sourceFilter === stat.source
                                        ? 'ring-2 ring-orange-500 ' + stat.color
                                        : stat.color + ' hover:opacity-80'
                                    }`}
                            >
                                <p className="font-medium text-xs">{stat.label}</p>
                                <p className="font-bold text-sm">Rp {(stat.revenue / 1000).toFixed(0)}k</p>
                                <p className="text-xs opacity-75">{stat.count} pelanggan</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari pelanggan..."
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                        <option value="all">Semua Sumber</option>
                        {Object.entries(SOURCE_LABELS).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                        <option value="all">Semua Status</option>
                        {Object.entries(STATUS_LABELS).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                    <select
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                        <option value="all">Semua Tag</option>
                        {Object.entries(TAG_LABELS).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Selection indicator */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <span className="text-sm text-blue-700 font-medium">
                        {selectedIds.size} pelanggan dipilih
                    </span>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                        Batal pilih
                    </button>
                </div>
            )}

            {/* Empty state */}
            {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-gray-200 shadow-lg">
                    <Users className="h-12 w-12 md:h-16 md:w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Belum Ada Pelanggan</h3>
                    <p className="text-sm text-gray-500">Data pelanggan akan muncul setelah ada pembelian</p>
                </div>
            ) : (
                <>
                    {/* Mobile: Card layout */}
                    <div className="md:hidden space-y-3">
                        {filteredCustomers.map((customer) => (
                            <div
                                key={customer.id}
                                onClick={() => setDetailModal({ isOpen: true, customer })}
                                className={`bg-white rounded-2xl p-4 border-2 transition-colors cursor-pointer shadow-lg hover:shadow-xl ${selectedIds.has(customer.id) ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'}`}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSelect(customer.id); }}
                                        className="mt-0.5 text-gray-400 hover:text-blue-600"
                                    >
                                        {selectedIds.has(customer.id) ? (
                                            <CheckSquare className="h-5 w-5 text-blue-600" />
                                        ) : (
                                            <Square className="h-5 w-5" />
                                        )}
                                    </button>
                                    <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, customer }); }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {customer.source && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${SOURCE_LABELS[customer.source]?.color || 'bg-gray-100 text-gray-700'}`}>
                                            {SOURCE_LABELS[customer.source]?.label || customer.source}
                                        </span>
                                    )}
                                    {customer.feedback_email_sent_at && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                            Email terkirim
                                        </span>
                                    )}
                                </div>
                                {customer.products?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {customer.products.slice(0, 2).map((product, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs truncate max-w-[120px]">
                                                {product}
                                            </span>
                                        ))}
                                        {customer.products.length > 2 && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">+{customer.products.length - 2}</span>
                                        )}
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                                            <ShoppingCart className="h-3 w-3" />
                                            {customer.total_orders || 0} pesanan
                                        </span>
                                    </div>
                                    <span className="font-semibold text-green-600 text-sm">
                                        Rp {(customer.total_spent || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Table layout */}
                    <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-center px-4 py-4 w-12">
                                            <button onClick={toggleSelectAll} className="text-gray-400 hover:text-blue-600">
                                                {selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0 ? (
                                                    <CheckSquare className="h-5 w-5 text-blue-600" />
                                                ) : (
                                                    <Square className="h-5 w-5" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Pelanggan</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Kontak</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Sumber</th>
                                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Pesanan</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Total Belanja</th>
                                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredCustomers.map((customer) => (
                                        <motion.tr
                                            key={customer.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            onClick={() => setDetailModal({ isOpen: true, customer })}
                                            className={`transition-colors cursor-pointer ${selectedIds.has(customer.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className="text-center px-4 py-4">
                                                <button onClick={(e) => { e.stopPropagation(); toggleSelect(customer.id); }} className="text-gray-400 hover:text-blue-600">
                                                    {selectedIds.has(customer.id) ? (
                                                        <CheckSquare className="h-5 w-5 text-blue-600" />
                                                    ) : (
                                                        <Square className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Bergabung {new Date(customer.created_at).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {customer.email}
                                                    </div>
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone className="h-3.5 w-3.5" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {customer.source && (
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${SOURCE_LABELS[customer.source]?.color || 'bg-gray-100 text-gray-700'}`}>
                                                            {SOURCE_LABELS[customer.source]?.label || customer.source}
                                                        </span>
                                                    )}
                                                    {customer.feedback_email_sent_at && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                            Email terkirim
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                                    <ShoppingCart className="h-3.5 w-3.5" />
                                                    {customer.total_orders || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-semibold text-green-600">
                                                    Rp {(customer.total_spent || 0).toLocaleString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, customer }); }}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, customer: null })}
                onConfirm={deleteCustomer}
                title="Hapus Pelanggan"
                message="Apakah Anda yakin ingin menghapus pelanggan ini? Riwayat pesanan pelanggan ini akan tetap tersimpan."
                itemName={deleteModal.customer?.name}
                isDeleting={deletingId !== null}
            />

            {/* Add Customer Modal */}
            <AddCustomerModal
                isOpen={addModal}
                onClose={() => setAddModal(false)}
                onSuccess={fetchCustomers}
            />

            {/* Email Campaign Modal */}
            <EmailCampaignModal
                isOpen={emailModal}
                onClose={() => setEmailModal(false)}
                onSuccess={() => {
                    fetchCustomers()
                    setSelectedIds(new Set())
                }}
                selectedCustomers={selectedCustomers}
            />

            {/* Customer Detail Modal */}
            <CustomerDetailModal
                isOpen={detailModal.isOpen}
                onClose={() => setDetailModal({ isOpen: false, customer: null })}
                onUpdate={fetchCustomers}
                customer={detailModal.customer}
            />

            {/* Import Customer Modal */}
            <ImportCustomerModal
                isOpen={importModal}
                onClose={() => setImportModal(false)}
                onSuccess={fetchCustomers}
            />
        </div>
    )
}
