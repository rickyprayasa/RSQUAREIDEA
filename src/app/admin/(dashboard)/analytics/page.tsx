'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Eye,
    Users,
    MousePointer,
    ShoppingCart,
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    TrendingUp,
    BarChart3,
    Clock
} from 'lucide-react'

interface AnalyticsData {
    summary: {
        totalViews: number
        uniqueVisitors: number
        totalProductClicks: number
        addToCartClicks: number
        buttonClicks: number
    }
    topPages: { path: string; count: number }[]
    topProducts: { slug: string; title: string; views: number; clicks: number; addToCart: number }[]
    deviceStats: Record<string, number>
    browserStats: Record<string, number>
    trafficSources: { source: string; count: number }[]
    hourlyViews: number[]
    dailyViews: { date: string; views: number; visitors: number }[]
    topButtons: { name: string; count: number }[]
}

// Skeleton Components
const SkeletonStatCard = () => (
    <div className="bg-gray-200 rounded-2xl p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-xl"></div>
        </div>
        <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
        <div className="h-7 bg-gray-300 rounded w-24"></div>
    </div>
)

const SkeletonChart = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-6">
            <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-end justify-between gap-2 h-48">
            {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                        className="w-full bg-gray-200 rounded-t-lg"
                        style={{ height: `${15 + Math.random() * 70}%` }}
                    ></div>
                    <div className="h-3 bg-gray-200 rounded w-10"></div>
                </div>
            ))}
        </div>
    </div>
)

const SkeletonList = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-200 rounded w-36"></div>
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
            ))}
        </div>
    </div>
)

const SkeletonSmallCard = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-28 mb-4"></div>
        <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const getPageName = (path: string): string => {
    const pageNames: Record<string, string> = {
        '/': 'Beranda',
        '/templates': 'Katalog Template',
        '/jasa-kustom': 'Jasa Kustom',
        '/checkout': 'Checkout',
        '/kontak': 'Kontak',
        '/tentang-kami': 'Tentang Kami',
        '/kebijakan-privasi': 'Kebijakan Privasi',
        '/syarat-ketentuan': 'Syarat & Ketentuan',
        '/admin': 'Admin Dashboard',
        '/feedback': 'Feedback',
        '/cart': 'Keranjang',
        '/login': 'Login',
        '/register': 'Register',
    }

    if (pageNames[path]) {
        return pageNames[path]
    }

    if (path.startsWith('/templates/')) {
        const slug = path.replace('/templates/', '')
        const formattedName = slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        return `Template: ${formattedName}`
    }

    if (path.startsWith('/admin/')) {
        const subPath = path.replace('/admin/', '')
        const adminPages: Record<string, string> = {
            'products': 'Admin: Produk',
            'orders': 'Admin: Pesanan',
            'customers': 'Admin: Pelanggan',
            'analytics': 'Admin: Analytics',
            'videos': 'Admin: Video',
            'categories': 'Admin: Kategori',
            'testimonials': 'Admin: Testimonial',
            'feedback': 'Admin: Feedback',
        }
        return adminPages[subPath] || `Admin: ${subPath}`
    }

    return path
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('7d')

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/admin/analytics?period=${period}`)
                const result = await res.json()
                setData(result)
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [period])

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                        <div className="h-5 bg-gray-200 rounded w-56 animate-pulse"></div>
                    </div>
                    <div className="w-40 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => <SkeletonStatCard key={i} />)}
                </div>

                {/* Chart Skeleton */}
                <SkeletonChart />

                {/* Lists Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkeletonList />
                    <SkeletonList />
                </div>

                {/* Bottom Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SkeletonSmallCard />
                    <SkeletonSmallCard />
                    <SkeletonSmallCard />
                </div>
            </div>
        )
    }

    if (!data) return null

    const maxDailyViews = Math.max(...data.dailyViews.map(d => d.views), 1)
    const maxHourlyViews = Math.max(...data.hourlyViews, 1)
    const totalDevices = Object.values(data.deviceStats).reduce((a, b) => a + b, 0) || 1


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 mt-1">Tracking pengunjung dan interaksi</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                    <option value="24h">24 Jam Terakhir</option>
                    <option value="7d">7 Hari Terakhir</option>
                    <option value="30d">30 Hari Terakhir</option>
                    <option value="90d">90 Hari Terakhir</option>
                </select>
            </div>

            {/* Summary Stats - Using gradient cards like dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/25 border border-blue-400/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Eye className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-white/80 text-sm">Total Views</p>
                    <p className="text-2xl font-bold">{data.summary.totalViews.toLocaleString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-green-500/25 border border-green-400/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-white/80 text-sm">Unique Visitors</p>
                    <p className="text-2xl font-bold">{data.summary.uniqueVisitors.toLocaleString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/25 border border-purple-400/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <MousePointer className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-white/80 text-sm">Product Clicks</p>
                    <p className="text-2xl font-bold">{data.summary.totalProductClicks.toLocaleString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/25 border border-orange-400/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-white/80 text-sm">Add to Cart</p>
                    <p className="text-2xl font-bold">{data.summary.addToCartClicks.toLocaleString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg shadow-pink-500/25 border border-pink-400/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-white/80 text-sm">Button Clicks</p>
                    <p className="text-2xl font-bold">{data.summary.buttonClicks.toLocaleString()}</p>
                </motion.div>
            </div>

            {/* Daily Views Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Traffic Harian</h2>
                        <p className="text-sm text-gray-500">Views dan visitors per hari</p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                {data.dailyViews.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Belum ada data</p>
                ) : (
                    <div className="flex items-end justify-between gap-2 h-48">
                        {data.dailyViews.map((day, index) => {
                            const heightPercent = maxDailyViews > 0 ? (day.views / maxDailyViews) * 100 : 0
                            const barHeight = day.views > 0 ? Math.max(heightPercent, 5) : 2
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full flex-1 flex items-end justify-center">
                                        <motion.div
                                            className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-lg relative cursor-pointer hover:from-orange-400 hover:to-amber-300 transition-colors"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${barHeight}%` }}
                                            transition={{ delay: 0.6 + index * 0.03, duration: 0.4, ease: "easeOut" }}
                                            style={{ minHeight: day.views > 0 ? '20px' : '4px' }}
                                        >
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                                                <div className="font-semibold">{day.views} views</div>
                                                <div className="text-gray-300">{day.visitors} visitors</div>
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 truncate w-full text-center">
                                        {new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Halaman Populer</h2>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    {data.topPages.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Belum ada data</p>
                    ) : (
                        <div className="space-y-3">
                            {data.topPages.map((page, index) => (
                                <div key={page.path} className="flex items-center gap-3">
                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-50 text-gray-500'
                                        }`}>
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{getPageName(page.path)}</p>
                                        <p className="text-xs text-gray-400 truncate">{page.path}</p>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                            <motion.div
                                                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(page.count / data.topPages[0].count) * 100}%` }}
                                                transition={{ delay: 0.7 + index * 0.05, duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{page.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Produk Paling Dilihat</h2>
                        <Eye className="h-5 w-5 text-blue-500" />
                    </div>
                    {data.topProducts.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Belum ada data</p>
                    ) : (
                        <div className="space-y-3">
                            {data.topProducts.map((product, index) => (
                                <div key={product.slug} className="flex items-center gap-3">
                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-50 text-gray-500'
                                        }`}>
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3 text-blue-500" /> {product.views}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ShoppingCart className="h-3 w-3 text-orange-500" /> {product.addToCart}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Device Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Device</h2>
                    <div className="space-y-4">
                        {Object.entries(data.deviceStats).map(([device, count]) => {
                            const Icon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor
                            const percent = Math.round((count / totalDevices) * 100)
                            const colors = {
                                desktop: 'from-blue-500 to-cyan-400',
                                mobile: 'from-purple-500 to-pink-400',
                                tablet: 'from-green-500 to-emerald-400'
                            }
                            return (
                                <div key={device} className="flex items-center gap-3">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${colors[device as keyof typeof colors] || 'from-gray-400 to-gray-500'} rounded-xl flex items-center justify-center`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize text-gray-700 font-medium">{device}</span>
                                            <span className="font-bold text-gray-900">{percent}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <motion.div
                                                className={`bg-gradient-to-r ${colors[device as keyof typeof colors] || 'from-gray-400 to-gray-500'} h-2 rounded-full`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ delay: 0.9, duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Traffic Sources */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Sumber Traffic</h2>
                    {data.trafficSources.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Belum ada data</p>
                    ) : (
                        <div className="space-y-2">
                            {data.trafficSources.slice(0, 6).map((source) => (
                                <div key={source.source} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 truncate">{source.source}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 ml-2">{source.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Hourly Traffic */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-gray-900">Traffic per Jam (Hari Ini)</h2>
                    </div>
                    <div className="flex items-end gap-0.5 h-24">
                        {data.hourlyViews.map((views, hour) => {
                            const barHeight = maxHourlyViews > 0 ? (views / maxHourlyViews) * 100 : 0
                            return (
                                <motion.div
                                    key={hour}
                                    className="flex-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t group relative cursor-pointer hover:from-green-400 hover:to-emerald-300 transition-colors"
                                    initial={{ height: 0 }}
                                    animate={{ height: views > 0 ? `${Math.max(barHeight, 8)}%` : '4px' }}
                                    transition={{ delay: 1.1 + hour * 0.02, duration: 0.3 }}
                                    style={{ opacity: views > 0 ? 1 : 0.3 }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {hour}:00 - {views}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>00:00</span>
                        <span>12:00</span>
                        <span>23:00</span>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
