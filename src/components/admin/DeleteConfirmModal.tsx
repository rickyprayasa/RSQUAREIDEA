'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message?: string
    itemName?: string
    isDeleting?: boolean
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Hapus Data',
    message = 'Apakah Anda yakin ingin menghapus data ini?',
    itemName,
    isDeleting = false
}: DeleteConfirmModalProps) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-gray-600">{message}</p>
                            {itemName && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Item yang akan dihapus:</p>
                                    <p className="font-semibold text-gray-900">{itemName}</p>
                                </div>
                            )}
                            <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                ⚠️ Tindakan ini tidak dapat dibatalkan
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 text-gray-700 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Menghapus...
                                    </>
                                ) : (
                                    'Ya, Hapus'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
