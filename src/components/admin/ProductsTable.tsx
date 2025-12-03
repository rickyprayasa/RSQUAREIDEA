'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Package, Pencil } from 'lucide-react'
import { DeleteProductButton } from './DeleteProductButton'

interface Product {
    id: number
    title: string
    slug: string
    description?: string | null
    price: number
    discountPrice?: number | null
    category: string
    image?: string | null
    images?: string[] | null
    demoUrl?: string | null
    downloadUrl?: string | null
    isFeatured?: boolean | null
    isFree?: boolean | null
    isActive?: boolean | null
    features?: string[] | null
    createdAt?: string | Date
    updatedAt?: string | Date
}

interface ProductsTableProps {
    products: Product[]
}

export function ProductsTable({ products }: ProductsTableProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
                    <p className="text-gray-500 mt-1">Kelola produk template Anda</p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
                    >
                        <motion.div
                            whileHover={{ rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Plus className="h-5 w-5" />
                        </motion.div>
                        Tambah Produk
                    </Link>
                </motion.div>
            </div>

            <motion.div 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Produk
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Kategori
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Harga
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        </motion.div>
                                        <p className="text-gray-500">Belum ada produk</p>
                                        <Link
                                            href="/admin/products/new"
                                            className="inline-flex items-center gap-1 mt-2 text-orange-600 hover:text-orange-700 font-medium text-sm"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Tambah produk pertama
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <motion.tr 
                                        key={product.id} 
                                        className="hover:bg-gray-50"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.03 }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <motion.div 
                                                    className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                                >
                                                    <Package className="h-6 w-6 text-orange-600" />
                                                </motion.div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.title}</p>
                                                    <p className="text-sm text-gray-500">{product.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.isFree ? (
                                                <span className="text-green-600 font-medium">Gratis</span>
                                            ) : (
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Rp {(product.discountPrice || product.price).toLocaleString('id-ID')}
                                                    </p>
                                                    {product.discountPrice && (
                                                        <p className="text-sm text-gray-500 line-through">
                                                            Rp {product.price.toLocaleString('id-ID')}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <motion.span 
                                                    className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                                                        product.isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    {product.isActive ? 'Aktif' : 'Nonaktif'}
                                                </motion.span>
                                                {product.isFeatured && (
                                                    <motion.span 
                                                        className="inline-flex px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full"
                                                        animate={{ scale: [1, 1.05, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    >
                                                        Unggulan
                                                    </motion.span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Link
                                                        href={`/admin/products/${product.id}`}
                                                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </motion.div>
                                                <DeleteProductButton productId={product.id} productTitle={product.title} />
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}
