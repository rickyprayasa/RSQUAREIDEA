'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClientLordIcon } from '@/components/ui/lordicon'

interface Review {
    id: number
    name: string
    rating: number
    likes: string
    created_at: string
}

interface ProductReviewProps {
    templateName: string
    productType?: string
    isCustomShowcase?: boolean
}

export function ProductReview({ templateName }: ProductReviewProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const [formData, setFormData] = useState({
        name: '',
        rating: 5,
        likes: ''
    })

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/products/reviews?templateName=${encodeURIComponent(templateName)}`)
                if (res.ok) {
                    const data = await res.json()
                    setReviews(data.reviews || [])
                    setSummary(data.summary || { averageRating: 0, totalReviews: 0 })
                }
            } catch (error) {
                console.error('Failed to fetch reviews', error)
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchReviews()
    }, [templateName])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || formData.rating === 0) return

        setIsSubmitting(true)
        setSubmitStatus('idle')

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    rating: formData.rating,
                    likes: formData.likes,
                    templateName: templateName,
                    testimonialPermission: true // Always request permission for public reviews
                })
            })

            if (res.ok) {
                setSubmitStatus('success')
                setFormData({ name: '', rating: 5, likes: '' })
                setTimeout(() => setIsFormOpen(false), 3000)
            } else {
                setSubmitStatus('error')
            }
        } catch {
            setSubmitStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) return null

    return (
        <section className="py-8">
            <div className="p-6 md:p-8 rounded-2xl border bg-white border-gray-200 shadow-lg transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 text-gray-900">
                            Ulasan Pengguna
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <ClientLordIcon
                                        key={star}
                                        src="https://cdn.lordicon.com/mdgrhyca.json"
                                        trigger="hover"
                                        colors={star <= summary.averageRating ? "primary:#facc15" : "primary:#e5e7eb"}
                                        style={{ width: '24px', height: '24px' }}
                                    />
                                ))}
                            </div>
                            <span className="font-semibold text-gray-900">
                                {summary.averageRating.toFixed(1)} <span className="font-normal text-gray-500">/ 5.0</span>
                            </span>
                            <span className="text-gray-500">
                                • {summary.totalReviews} ulasan
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="px-5 py-2.5 rounded-xl font-medium transition-transform active:scale-95 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white"
                    >
                        <ClientLordIcon
                            src="https://cdn.lordicon.com/puvaffet.json"
                            trigger="loop"
                            delay="3000"
                            colors="primary:#ffffff"
                            style={{ width: '20px', height: '20px' }}
                        />
                        Tulis Ulasan
                    </button>
                </div>

                <AnimatePresence>
                    {isFormOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-8"
                        >
                            <form onSubmit={handleSubmit} className="p-5 rounded-xl border bg-gray-50 border-gray-100">
                                {submitStatus === 'success' ? (
                                    <div className="text-center py-6">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/cgzlioyf.json"
                                                trigger="in"
                                                colors="primary:#16a34a"
                                                style={{ width: '40px', height: '40px' }}
                                            />
                                        </div>
                                        <h4 className="text-lg font-semibold mb-2 text-gray-900">Terima Kasih atas Ulasan Anda!</h4>
                                        <p className="text-gray-500">Ulasan Anda telah dikirim dan akan segera dipublikasikan setelah diverifikasi oleh admin.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-900">Penilaian Anda</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                                        className="focus:outline-none transition-transform hover:scale-110"
                                                    >
                                                        <ClientLordIcon
                                                            src="https://cdn.lordicon.com/mdgrhyca.json"
                                                            trigger="hover"
                                                            colors={star <= formData.rating ? "primary:#facc15" : "primary:#e5e7eb"}
                                                            style={{ width: '36px', height: '36px' }}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5 text-gray-900">Nama Lengkap</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full px-4 py-2.5 rounded-lg border bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500 focus:outline-none focus:ring-2 transition-all"
                                                    placeholder="Masukkan nama Anda"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 text-gray-900">Kesan & Pesan</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.likes}
                                                onChange={(e) => setFormData(prev => ({ ...prev, likes: e.target.value }))}
                                                className="w-full px-4 py-3 rounded-lg border bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500 focus:outline-none focus:ring-2 transition-all resize-none"
                                                placeholder="Ceritakan pengalaman Anda menggunakan template ini..."
                                            />
                                        </div>

                                        {submitStatus === 'error' && (
                                            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                                                <ClientLordIcon
                                                    src="https://cdn.lordicon.com/bmnlikjh.json"
                                                    trigger="loop"
                                                    delay="2000"
                                                    colors="primary:#ef4444"
                                                    style={{ width: '20px', height: '20px' }}
                                                />
                                                Gagal mengirim ulasan. Silakan coba lagi.
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white"
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <ClientLordIcon
                                                        src="https://cdn.lordicon.com/udbbfuld.json"
                                                        trigger="hover"
                                                        colors="primary:#ffffff"
                                                        style={{ width: '20px', height: '20px' }}
                                                    />
                                                )}
                                                Kirim Ulasan
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Review List */}
                <div className="space-y-4">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="p-5 rounded-xl border bg-gray-50 border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-orange-100 text-orange-600">
                                            {review.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{review.name}</h4>
                                            <p className="text-xs text-gray-500">
                                                {new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200">
                                        <ClientLordIcon
                                            src="https://cdn.lordicon.com/mdgrhyca.json"
                                            trigger="hover"
                                            colors="primary:#facc15"
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        <span className="text-sm font-semibold text-gray-900">{review.rating}.0</span>
                                    </div>
                                </div>
                                <p className="leading-relaxed text-gray-500">{review.likes}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 rounded-xl border border-dashed bg-gray-50 border-gray-200">
                            <ClientLordIcon
                                src="https://cdn.lordicon.com/zpxybbhl.json"
                                trigger="loop"
                                delay="3000"
                                colors="primary:#9ca3af,secondary:#d1d5db"
                                style={{ width: '50px', height: '50px', margin: '0 auto 12px' }}
                            />
                            <p className="text-gray-500">Belum ada ulasan untuk produk ini.<br/>Jadilah yang pertama memberikan ulasan!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
