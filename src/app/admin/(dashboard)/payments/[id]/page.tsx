'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { PaymentForm } from '@/components/admin/PaymentForm'
import { Loader2 } from 'lucide-react'

interface Payment {
    id: number
    name: string
    type: 'internal' | 'external'
    bankName: string | null
    accountNumber: string | null
    accountName: string | null
    qrCodeImage: string | null
    externalUrl: string | null
    instructions: string | null
    isActive: boolean
}

export default function EditPaymentPage() {
    const params = useParams()
    const [payment, setPayment] = useState<Payment | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const res = await fetch(`/api/admin/payments/${params.id}`)
                if (!res.ok) {
                    setError(true)
                    return
                }
                const data = await res.json()
                if (data.payment) {
                    setPayment(data.payment)
                } else {
                    setError(true)
                }
            } catch {
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchPayment()
        }
    }, [params.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (error || !payment) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Edit Metode Pembayaran</h1>
                <p className="text-gray-500 mt-1">Perbarui informasi pembayaran</p>
            </div>
            
            <PaymentForm payment={payment} />
        </div>
    )
}
