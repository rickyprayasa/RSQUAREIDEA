'use client'

import { useState, useEffect } from 'react'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { RecentProducts } from '@/components/admin/RecentProducts'
import { Loader2 } from 'lucide-react'

interface Stats {
    totalProducts: number
    activeProducts: number
    totalOrders: number
    totalUsers: number
    recentProducts: any[]
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const [productsRes, ordersRes] = await Promise.all([
                    fetch('/api/admin/products'),
                    fetch('/api/admin/orders'),
                ])
                
                const productsData = await productsRes.json()
                const ordersData = await ordersRes.json()
                
                const products = productsData.products || []
                const orders = ordersData.orders || []
                
                setStats({
                    totalProducts: products.length,
                    activeProducts: products.filter((p: any) => p.is_active).length,
                    totalOrders: orders.length,
                    totalUsers: 1,
                    recentProducts: products.slice(0, 5).map((p: any) => ({
                        id: p.id,
                        title: p.title,
                        slug: p.slug,
                        price: p.price,
                        category: p.category,
                        isActive: p.is_active,
                        isFree: p.is_free,
                    })),
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Selamat datang di panel admin RSQUARE</p>
            </div>

            {stats && (
                <>
                    <DashboardStats stats={stats} />
                    <RecentProducts products={stats.recentProducts} />
                </>
            )}
        </div>
    )
}
