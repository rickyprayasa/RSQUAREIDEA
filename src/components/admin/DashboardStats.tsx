'use client'

import { motion } from 'framer-motion'
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
    stats: {
        totalProducts: number
        activeProducts: number
        totalOrders: number
        totalUsers: number
    }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const statCards = [
        {
            title: 'Total Produk',
            value: stats.totalProducts,
            icon: Package,
            color: 'bg-blue-500',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: 'Produk Aktif',
            value: stats.activeProducts,
            icon: TrendingUp,
            color: 'bg-green-500',
            bgLight: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            title: 'Total Pesanan',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: 'bg-orange-500',
            bgLight: 'bg-orange-50',
            textColor: 'text-orange-600'
        },
        {
            title: 'Total Admin',
            value: stats.totalUsers,
            icon: Users,
            color: 'bg-purple-500',
            bgLight: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 overflow-hidden relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.color}`}>
                            <stat.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{stat.title}</p>
                            <motion.p
                                className="text-2xl font-bold text-gray-900"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                            >
                                {stat.value}
                            </motion.p>
                        </div>
                    </div>

                    {/* Decorative background */}
                    <motion.div
                        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.bgLight} opacity-50`}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                </motion.div>
            ))}
        </div>
    )
}
