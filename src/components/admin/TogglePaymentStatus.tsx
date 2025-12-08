'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TogglePaymentStatusProps {
    paymentId: number
    isActive: boolean
}

export function TogglePaymentStatus({ paymentId, isActive }: TogglePaymentStatusProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        setLoading(true)
        try {
            await fetch(`/api/admin/payments/${paymentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive }),
            })
            router.refresh()
        } catch (error) {
            console.error('Error toggling payment status:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                isActive ? 'bg-green-500' : 'bg-gray-300'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    )
}
