'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Building, ExternalLink } from 'lucide-react'

interface PaymentSetting {
    id: number
    type: 'internal' | 'external'
    name: string
    isActive: boolean
    externalUrl: string | null
    bankName: string | null
    accountNumber: string | null
    accountName: string | null
    qrCodeImage: string | null
    instructions: string | null
}

interface PaymentFormProps {
    payment?: PaymentSetting
}

export function PaymentForm({ payment }: PaymentFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    
    const [formData, setFormData] = useState({
        type: payment?.type || 'internal',
        name: payment?.name || '',
        isActive: payment?.isActive ?? true,
        externalUrl: payment?.externalUrl || '',
        bankName: payment?.bankName || '',
        accountNumber: payment?.accountNumber || '',
        accountName: payment?.accountName || '',
        qrCodeImage: payment?.qrCodeImage || '',
        instructions: payment?.instructions || '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setFormData(prev => ({ ...prev, [name]: checked }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const url = payment 
                ? `/api/admin/payments/${payment.id}` 
                : '/api/admin/payments'
            
            const method = payment ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Gagal menyimpan')
            }

            router.push('/admin/payments')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Tipe Pembayaran *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                formData.type === 'internal'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="internal"
                                    checked={formData.type === 'internal'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <Building className={`h-5 w-5 ${
                                    formData.type === 'internal' ? 'text-blue-600' : 'text-gray-400'
                                }`} />
                                <div>
                                    <p className="font-medium text-gray-900">Internal</p>
                                    <p className="text-xs text-gray-500">Bank, QRIS, E-Wallet</p>
                                </div>
                            </label>
                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                formData.type === 'external'
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="external"
                                    checked={formData.type === 'external'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <ExternalLink className={`h-5 w-5 ${
                                    formData.type === 'external' ? 'text-purple-600' : 'text-gray-400'
                                }`} />
                                <div>
                                    <p className="font-medium text-gray-900">External</p>
                                    <p className="text-xs text-gray-500">Redirect URL</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Metode *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            placeholder="Contoh: Transfer Bank BCA"
                        />
                    </div>

                    {/* Internal Payment Fields */}
                    {formData.type === 'internal' && (
                        <div className="space-y-6 border-t border-gray-100 pt-6">
                            <h3 className="font-semibold text-gray-900">Detail Rekening</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Bank
                                    </label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                        placeholder="BCA, BNI, Mandiri, dll"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nomor Rekening
                                    </label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                        placeholder="1234567890"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Pemilik Rekening
                                </label>
                                <input
                                    type="text"
                                    name="accountName"
                                    value={formData.accountName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                    placeholder="PT RSQUARE INDONESIA"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Gambar QR Code
                                </label>
                                <input
                                    type="url"
                                    name="qrCodeImage"
                                    value={formData.qrCodeImage}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    )}

                    {/* External Payment Fields */}
                    {formData.type === 'external' && (
                        <div className="space-y-6 border-t border-gray-100 pt-6">
                            <h3 className="font-semibold text-gray-900">URL Pembayaran</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Redirect *
                                </label>
                                <input
                                    type="url"
                                    name="externalUrl"
                                    value={formData.externalUrl}
                                    onChange={handleChange}
                                    required={formData.type === 'external'}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                    placeholder="https://saweria.co/username"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Pelanggan akan diarahkan ke URL ini untuk pembayaran
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="border-t border-gray-100 pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instruksi Pembayaran
                        </label>
                        <textarea
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                            placeholder="1. Transfer ke rekening di atas&#10;2. Upload bukti transfer&#10;3. Tunggu konfirmasi"
                        />
                    </div>

                    {/* Status */}
                    <div className="border-t border-gray-100 pt-6">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-gray-700">Aktif (tampil di checkout)</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/payments"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Kembali
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            Simpan
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
