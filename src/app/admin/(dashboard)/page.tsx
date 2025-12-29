'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Loader2,
    Package,
    ShoppingCart,
    Users,
    TrendingUp,
    DollarSign,
    BarChart3
} from 'lucide-react'

interface Order {
    id: number
    orderNumber: string
    customerName: string
    customerEmail: string
    productTitle: string
    amount: number
    status: string
    createdAt: string
}

interface Product {
    id: number
    title: string
    slug: string
    price: number
    is_active: boolean
    is_free: boolean
}

interface Stats {
    totalProducts: number
    activeProducts: number
    totalOrders: number
    totalRevenue: number
    totalCustomers: number
    pendingOrders: number
    topProducts: { title: string; count: number; revenue: number }[]
    revenueByMonth: { month: string; revenue: number }[]
    ordersByStatus: { status: string; count: number }[]
    recentOrders: Order[]
}

// Skeleton Components
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg animate-pulse">
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        </div>
    </div>
)

const SkeletonChart = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-6">
            <div>
                <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-36"></div>
            </div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-end justify-between gap-2 h-48">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                        className="w-full bg-gray-200 rounded-t-lg"
                        style={{ height: `${20 + Math.random() * 60}%` }}
                    ></div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                </div>
            ))}
        </div>
    </div>
)

const SkeletonList = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
            ))}
        </div>
    </div>
)

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const [productsRes, ordersRes, customersRes] = await Promise.all([
                    fetch('/api/admin/products'),
                    fetch('/api/admin/orders'),
                    fetch('/api/admin/customers'),
                ])

                const productsData = await productsRes.json()
                const ordersData = await ordersRes.json()
                const customersData = await customersRes.json()

                const products: Product[] = productsData.products || []
                const orders: Order[] = ordersData.orders || []
                const customers = customersData.customers || []

                // Calculate top products from orders
                const productSales: Record<string, { count: number; revenue: number }> = {}
                orders.forEach(order => {
                    const title = order.productTitle || 'Unknown'
                    if (!productSales[title]) {
                        productSales[title] = { count: 0, revenue: 0 }
                    }
                    productSales[title].count += 1
                    productSales[title].revenue += order.amount || 0
                })
                const topProducts = Object.entries(productSales)
                    .map(([title, data]) => ({ title, ...data }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)

                // Calculate revenue by month (last 6 months) - only count paid/completed orders
                const revenueByMonth: { month: string; revenue: number }[] = []
                const now = new Date()
                for (let i = 5; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
                    const monthName = date.toLocaleDateString('id-ID', { month: 'short' })
                    const monthOrders = orders.filter(o => {
                        const orderDate = new Date(o.createdAt)
                        const isPaid = ['paid', 'confirmed', 'completed'].includes(o.status)
                        return isPaid &&
                            orderDate.getMonth() === date.getMonth() &&
                            orderDate.getFullYear() === date.getFullYear()
                    })
                    const revenue = monthOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
                    revenueByMonth.push({ month: monthName, revenue })
                }

                // Orders by status
                const statusCount: Record<string, number> = {}
                orders.forEach(o => {
                    const status = o.status || 'pending'
                    statusCount[status] = (statusCount[status] || 0) + 1
                })
                const ordersByStatus = Object.entries(statusCount)
                    .map(([status, count]) => ({ status, count }))

                // Total revenue only from paid orders
                const totalRevenue = orders
                    .filter(o => ['paid', 'confirmed', 'completed'].includes(o.status))
                    .reduce((sum, o) => sum + (o.amount || 0), 0)
                const pendingOrders = orders.filter(o => o.status === 'pending').length

                setStats({
                    totalProducts: products.length,
                    activeProducts: products.filter(p => p.is_active).length,
                    totalOrders: orders.length,
                    totalRevenue,
                    totalCustomers: customers.length,
                    pendingOrders,
                    topProducts,
                    revenueByMonth,
                    ordersByStatus,
                    recentOrders: orders.slice(0, 5),
                })
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2"><SkeletonChart /></div>
                    <SkeletonList />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <SkeletonList />
                    <div className="lg:col-span-2"><SkeletonList /></div>
                </div>
            </div>
        )
    }

    if (!stats) return null

    const maxRevenue = Math.max(...stats.revenueByMonth.map(r => r.revenue), 1)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Selamat datang di panel admin RSQUARE</p>
            </div>

            {/* Main Stats - Enhanced with better shadows */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-green-500/25 border border-green-400/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Total Pendapatan</p>
                            <p className="text-2xl font-bold mt-1">
                                Rp {stats.totalRevenue.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/25 border border-orange-400/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Total Pesanan</p>
                            <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
                            {stats.pendingOrders > 0 && (
                                <p className="text-xs text-white/70 mt-1">{stats.pendingOrders} menunggu</p>
                            )}
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/25 border border-blue-400/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Total Pelanggan</p>
                            <p className="text-2xl font-bold mt-1">{stats.totalCustomers}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Users className="h-6 w-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/25 border border-purple-400/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Produk Aktif</p>
                            <p className="text-2xl font-bold mt-1">{stats.activeProducts}/{stats.totalProducts}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Package className="h-6 w-6" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart - Fixed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Pendapatan 6 Bulan Terakhir</h2>
                            <p className="text-sm text-gray-500">Grafik pendapatan bulanan</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-orange-600" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between gap-3 h-48">
                        {stats.revenueByMonth.map((item, index) => {
                            const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
                            const barHeight = item.revenue > 0 ? Math.max(heightPercent, 8) : 2
                            return (
                                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full flex-1 flex items-end justify-center">
                                        <motion.div
                                            className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-xl relative cursor-pointer hover:from-orange-400 hover:to-amber-300 transition-colors shadow-md"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${barHeight}%` }}
                                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5, ease: "easeOut" }}
                                            style={{ minHeight: item.revenue > 0 ? '24px' : '4px' }}
                                        >
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                                                Rp {item.revenue.toLocaleString('id-ID')}
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">{item.month}</span>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Produk Terlaris</h2>
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                    </div>
                    {stats.topProducts.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-400 text-sm">Belum ada data penjualan</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.topProducts.map((product, index) => (
                                <motion.div
                                    key={product.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.05 }}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white' :
                                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                                            index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                                        <p className="text-xs text-gray-500">{product.count} terjual</p>
                                    </div>
                                    <p className="text-sm font-semibold text-green-600">
                                        Rp {product.revenue.toLocaleString('id-ID')}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Order Status & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Status Pesanan</h2>
                    {stats.ordersByStatus.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-400 text-sm">Belum ada pesanan</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.ordersByStatus.map((item, index) => {
                                const statusColors: Record<string, string> = {
                                    pending: 'bg-amber-100 text-amber-700 border-amber-200',
                                    processing: 'bg-blue-100 text-blue-700 border-blue-200',
                                    completed: 'bg-green-100 text-green-700 border-green-200',
                                    cancelled: 'bg-red-100 text-red-700 border-red-200',
                                    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                    confirmed: 'bg-teal-100 text-teal-700 border-teal-200',
                                }
                                const statusLabels: Record<string, string> = {
                                    pending: 'Menunggu',
                                    processing: 'Diproses',
                                    completed: 'Selesai',
                                    cancelled: 'Dibatalkan',
                                    paid: 'Dibayar',
                                    confirmed: 'Dikonfirmasi',
                                }
                                return (
                                    <motion.div
                                        key={item.status}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 + index * 0.05 }}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                                    >
                                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[item.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                            {statusLabels[item.status] || item.status}
                                        </span>
                                        <span className="text-xl font-bold text-gray-900">{item.count}</span>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Recent Orders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Pesanan Terbaru</h2>
                    {stats.recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-400 text-sm">Belum ada pesanan</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentOrders.map((order, index) => {
                                const statusLabels: Record<string, string> = {
                                    pending: 'Menunggu',
                                    paid: 'Dibayar',
                                    confirmed: 'Dikonfirmasi',
                                    completed: 'Selesai',
                                    cancelled: 'Dibatalkan',
                                }
                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 + index * 0.05 }}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900 font-mono text-sm">{order.orderNumber || `#${order.id}`}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                }) : '-'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">
                                                Rp {(order.amount || 0).toLocaleString('id-ID')}
                                            </p>
                                            <span className={`inline-block mt-1 text-xs px-2.5 py-1 rounded-full font-medium ${order.status === 'completed' || order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {statusLabels[order.status] || order.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
