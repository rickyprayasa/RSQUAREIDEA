'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

interface DeletePaymentButtonProps {
    paymentId: number
    paymentName: string
}

export function DeletePaymentButton({ paymentId, paymentName }: DeletePaymentButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/payments/${paymentId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Error deleting payment:', error)
        } finally {
            setLoading(false)
            setShowConfirm(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div 
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowConfirm(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4 w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Hapus Metode Pembayaran?
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Anda yakin ingin menghapus &quot;{paymentName}&quot;?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Menghapus...
                                    </>
                                ) : (
                                    'Hapus'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
