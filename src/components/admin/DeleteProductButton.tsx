'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'

interface DeleteProductButtonProps {
    productId: number
    productTitle: string
}

export function DeleteProductButton({ productId, productTitle }: DeleteProductButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Error deleting product:', error)
        } finally {
            setLoading(false)
            setShowConfirm(false)
        }
    }

    return (
        <>
            <motion.button
                onClick={() => setShowConfirm(true)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Trash2 className="h-4 w-4" />
            </motion.button>

            <AnimatePresence>
                {showConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <motion.div 
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowConfirm(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div 
                            className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4 w-full"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <motion.div
                                className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.5 }}
                            >
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </motion.div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                                Hapus Produk?
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 text-center">
                                Anda yakin ingin menghapus &quot;{productTitle}&quot;? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3">
                                <motion.button
                                    onClick={() => setShowConfirm(false)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Batal
                                </motion.button>
                                <motion.button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <Loader2 className="h-4 w-4" />
                                            </motion.div>
                                            Menghapus...
                                        </>
                                    ) : (
                                        'Hapus'
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
