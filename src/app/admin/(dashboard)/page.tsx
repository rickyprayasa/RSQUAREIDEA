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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
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

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Pendapatan</p>
                            <p className="text-2xl font-bold text-gray-900">
                                Rp {stats.totalRevenue.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Pesanan</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                            {stats.pendingOrders > 0 && (
                                <p className="text-xs text-amber-600 mt-1">{stats.pendingOrders} menunggu</p>
                            )}
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Pelanggan</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Produk Aktif</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}/{stats.totalProducts}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Package className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Pendapatan 6 Bulan Terakhir</h2>
                            <p className="text-sm text-gray-500">Grafik pendapatan bulanan</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex items-end justify-between gap-2 h-48">
                        {stats.revenueByMonth.map((item, index) => (
                            <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                                <motion.div 
                                    className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-lg relative group"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                    style={{ minHeight: item.revenue > 0 ? '20px' : '4px' }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Rp {item.revenue.toLocaleString('id-ID')}
                                    </div>
                                </motion.div>
                                <span className="text-xs text-gray-500">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Top Products */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Produk Terlaris</h2>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    {stats.topProducts.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">Belum ada data penjualan</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.topProducts.map((product, index) => (
                                <div key={product.title} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-50 text-gray-500'
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
                                </div>
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
                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Status Pesanan</h2>
                    {stats.ordersByStatus.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">Belum ada pesanan</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.ordersByStatus.map((item) => {
                                const statusColors: Record<string, string> = {
                                    pending: 'bg-amber-100 text-amber-700',
                                    processing: 'bg-blue-100 text-blue-700',
                                    completed: 'bg-green-100 text-green-700',
                                    cancelled: 'bg-red-100 text-red-700',
                                }
                                const statusLabels: Record<string, string> = {
                                    pending: 'Menunggu',
                                    processing: 'Diproses',
                                    completed: 'Selesai',
                                    cancelled: 'Dibatalkan',
                                }
                                return (
                                    <div key={item.status} className="flex items-center justify-between">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {statusLabels[item.status] || item.status}
                                        </span>
                                        <span className="text-lg font-bold text-gray-900">{item.count}</span>
                                    </div>
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
                    className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Pesanan Terbaru</h2>
                    {stats.recentOrders.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">Belum ada pesanan</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentOrders.map((order) => {
                                const statusLabels: Record<string, string> = {
                                    pending: 'Menunggu',
                                    paid: 'Dibayar',
                                    confirmed: 'Dikonfirmasi',
                                    completed: 'Selesai',
                                    cancelled: 'Dibatalkan',
                                }
                                return (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 font-mono text-sm">{order.orderNumber || `#${order.id}`}</p>
                                            <p className="text-xs text-gray-500">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                }) : '-'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                                Rp {(order.amount || 0).toLocaleString('id-ID')}
                                            </p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                order.status === 'completed' || order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {statusLabels[order.status] || order.status}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
