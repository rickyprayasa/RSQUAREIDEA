'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
    Loader2, 
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
    PieChart,
    Clock,
    ExternalLink
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

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('7d')

    useEffect(() => {
        fetchAnalytics()
    }, [period])

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!data) return null

    const maxDailyViews = Math.max(...data.dailyViews.map(d => d.views), 1)
    const maxHourlyViews = Math.max(...data.hourlyViews, 1)
    const totalDevices = Object.values(data.deviceStats).reduce((a, b) => a + b, 0) || 1

    return (
        <div className="space-y-6">
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

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-5 border border-gray-100"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Views</p>
                            <p className="text-xl font-bold text-gray-900">{data.summary.totalViews.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-5 border border-gray-100"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Unique Visitors</p>
                            <p className="text-xl font-bold text-gray-900">{data.summary.uniqueVisitors.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-5 border border-gray-100"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <MousePointer className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Product Clicks</p>
                            <p className="text-xl font-bold text-gray-900">{data.summary.totalProductClicks.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-5 border border-gray-100"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Add to Cart</p>
                            <p className="text-xl font-bold text-gray-900">{data.summary.addToCartClicks.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl p-5 border border-gray-100"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Button Clicks</p>
                            <p className="text-xl font-bold text-gray-900">{data.summary.buttonClicks.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Daily Views Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 border border-gray-100"
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
                    <div className="flex items-end gap-1 h-48">
                        {data.dailyViews.map((day, index) => (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
                                <motion.div 
                                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t relative"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(day.views / maxDailyViews) * 100}%` }}
                                    transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                                    style={{ minHeight: day.views > 0 ? '8px' : '2px' }}
                                >
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        <div>{day.views} views</div>
                                        <div>{day.visitors} visitors</div>
                                    </div>
                                </motion.div>
                                <span className="text-[10px] text-gray-400 truncate w-full text-center">
                                    {new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl p-6 border border-gray-100"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Halaman Populer</h2>
                    {data.topPages.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Belum ada data</p>
                    ) : (
                        <div className="space-y-3">
                            {data.topPages.map((page, index) => (
                                <div key={page.path} className="flex items-center gap-3">
                                    <span className="text-sm text-gray-400 w-6">{index + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{page.path}</p>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                            <div 
                                                className="bg-blue-500 h-1.5 rounded-full" 
                                                style={{ width: `${(page.count / data.topPages[0].count) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">{page.count}</span>
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
                    className="bg-white rounded-xl p-6 border border-gray-100"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Produk Paling Dilihat</h2>
                    {data.topProducts.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Belum ada data</p>
                    ) : (
                        <div className="space-y-3">
                            {data.topProducts.map((product, index) => (
                                <div key={product.slug} className="flex items-center gap-3">
                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
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
                                                <Eye className="h-3 w-3" /> {product.views}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ShoppingCart className="h-3 w-3" /> {product.addToCart}
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
                    className="bg-white rounded-xl p-6 border border-gray-100"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Device</h2>
                    <div className="space-y-3">
                        {Object.entries(data.deviceStats).map(([device, count]) => {
                            const Icon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor
                            const percent = Math.round((count / totalDevices) * 100)
                            return (
                                <div key={device} className="flex items-center gap-3">
                                    <Icon className="h-5 w-5 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize text-gray-700">{device}</span>
                                            <span className="font-medium">{percent}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                                                style={{ width: `${percent}%` }}
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
                    className="bg-white rounded-xl p-6 border border-gray-100"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Sumber Traffic</h2>
                    {data.trafficSources.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Belum ada data</p>
                    ) : (
                        <div className="space-y-2">
                            {data.trafficSources.slice(0, 6).map((source) => (
                                <div key={source.source} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">{source.source}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{source.count}</span>
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
                    className="bg-white rounded-xl p-6 border border-gray-100"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-gray-900">Traffic per Jam (Hari Ini)</h2>
                    </div>
                    <div className="flex items-end gap-0.5 h-24">
                        {data.hourlyViews.map((views, hour) => (
                            <div 
                                key={hour}
                                className="flex-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t group relative"
                                style={{ 
                                    height: `${Math.max((views / maxHourlyViews) * 100, 4)}%`,
                                    opacity: views > 0 ? 1 : 0.3
                                }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {hour}:00 - {views}
                                </div>
                            </div>
                        ))}
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
