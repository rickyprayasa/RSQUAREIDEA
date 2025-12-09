'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, X, Loader2, Send, Eye, ChevronLeft } from 'lucide-react'

interface Customer {
    id: number
    name: string
    email: string
}

interface EmailCampaignModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    selectedCustomers: Customer[]
}

const DEFAULT_SUBJECT = 'Terima Kasih & Hadiah Spesial dari RSQUARE 🎁'
const DEFAULT_TEMPLATE = `Halo {nama},

Terima kasih sudah mempercayai RSQUARE untuk kebutuhan template spreadsheet Anda!

Kami ingin mendengar pengalaman Anda. Sebagai apresiasi, kami akan memberikan **1 Template Google Sheets GRATIS** setelah Anda memberikan feedback!

👉 Berikan feedback di: {feedback_url}

Setelah mengisi feedback, kode voucher akan dikirimkan ke email Anda.

Terima kasih atas dukungan Anda!

Salam hangat,
Tim RSQUARE`

export default function EmailCampaignModal({ isOpen, onClose, onSuccess, selectedCustomers }: EmailCampaignModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [subject, setSubject] = useState(DEFAULT_SUBJECT)
    const [template, setTemplate] = useState(DEFAULT_TEMPLATE)

    const handleSend = async () => {
        if (selectedCustomers.length === 0) {
            setError('Pilih minimal 1 pelanggan')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const res = await fetch('/api/admin/email/send-campaign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customers: selectedCustomers,
                    subject,
                    template,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Gagal mengirim email')

            setSuccess(`Berhasil mengirim ${data.sent} email!`)
            setTimeout(() => {
                onSuccess()
                onClose()
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const getPreviewContent = () => {
        const sampleCustomer = selectedCustomers[0] || { name: 'Nama Pelanggan' }
        return template
            .replace(/{nama}/g, sampleCustomer.name)
            .replace(/{feedback_url}/g, 'https://www.rsquareidea.my.id/feedback')
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                {showPreview && (
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mr-1"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                )}
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Mail className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {showPreview ? 'Preview Email' : 'Kirim Email Campaign'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {selectedCustomers.length} pelanggan dipilih
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">
                                    {success}
                                </div>
                            )}

                            {showPreview ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Subject:</p>
                                        <p className="font-medium text-gray-900">{subject}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-2">Isi Email:</p>
                                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                            {getPreviewContent()}
                                        </pre>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-xl">
                                        <p className="text-sm text-orange-700">
                                            <strong>Catatan:</strong> Kode voucher akan dikirim otomatis via email setelah pelanggan submit feedback dengan rating 4-5 bintang.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Subject Email
                                        </label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Template Email
                                        </label>
                                        <textarea
                                            value={template}
                                            onChange={(e) => setTemplate(e.target.value)}
                                            rows={12}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">
                                            Variabel: {'{nama}'}, {'{feedback_url}'}, {'{voucher_code}'}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-xl">
                                        <p className="text-sm font-medium text-blue-800 mb-2">Penerima:</p>
                                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                            {selectedCustomers.map((c) => (
                                                <span
                                                    key={c.id}
                                                    className="inline-flex items-center px-2 py-1 bg-white text-blue-700 rounded-lg text-xs border border-blue-200"
                                                >
                                                    {c.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-4 py-3 text-gray-700 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            {showPreview ? (
                                <button
                                    onClick={handleSend}
                                    disabled={loading || selectedCustomers.length === 0}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5" />
                                            Kirim Email
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowPreview(true)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
                                >
                                    <Eye className="h-5 w-5" />
                                    Preview
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
