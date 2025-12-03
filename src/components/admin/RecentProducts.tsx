'use client'

import { motion } from 'framer-motion'
import { Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RecentProduct {
    id: number
    title: string
    slug: string
    price: number
    category: string
    isActive: boolean
    isFree: boolean
}

interface RecentProductsProps {
    products: RecentProduct[]
}

export function RecentProducts({ products }: RecentProductsProps) {
    return (
        <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
        >
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Produk Terbaru</h2>
                    <Link 
                        href="/admin/products" 
                        className="group flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                        Lihat Semua
                        <motion.div
                            className="inline-block"
                            initial={{ x: 0 }}
                            whileHover={{ x: 5 }}
                        >
                            <ArrowRight className="h-4 w-4" />
                        </motion.div>
                    </Link>
                </div>
            </div>
            <div className="divide-y divide-gray-100">
                {products.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        </motion.div>
                        Belum ada produk
                    </div>
                ) : (
                    products.map((product, index) => (
                        <motion.div 
                            key={product.id} 
                            className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                            whileHover={{ x: 5 }}
                        >
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center"
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                >
                                    <Package className="h-6 w-6 text-orange-600" />
                                </motion.div>
                                <div>
                                    <p className="font-medium text-gray-900">{product.title}</p>
                                    <p className="text-sm text-gray-500">{product.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                    {product.isFree ? 'Gratis' : `Rp ${product.price.toLocaleString('id-ID')}`}
                                </p>
                                <motion.span 
                                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                        product.isActive 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    {product.isActive ? 'Aktif' : 'Nonaktif'}
                                </motion.span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    )
}
