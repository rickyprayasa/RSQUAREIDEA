'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ClientLordIcon } from '@/components/ui/lordicon'

interface Product {
    id: number
    title: string
}

interface DialogState {
    isOpen: boolean
    type: 'success' | 'error' | 'low_rating' | 'invalid_token'
    title: string
    message: string
}

function FeedbackContent() {
    const searchParams = useSearchParams()
    const inviteToken = searchParams.get('invite')
    const isInvited = !!inviteToken
    
    const [rating, setRating] = useState(5)
    const [formStatus, setFormStatus] = useState<'idle' | 'sending'>('idle')
    const [products, setProducts] = useState<Product[]>([])
    const [dialog, setDialog] = useState<DialogState>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    })

    useEffect(() => {
        // Fetch products from CMS
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (data.products) {
                    setProducts(data.products)
                }
            })
            .catch(console.error)
    }, [])

    const closeDialog = () => {
        setDialog(prev => ({ ...prev, isOpen: false }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormStatus('sending')

        const formData = new FormData(e.currentTarget)
        const form = e.currentTarget

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    socialMedia: formData.get('social'),
                    socialMediaUrl: formData.get('socialUrl'),
                    templateName: formData.get('template'),
                    rating: rating,
                    likes: formData.get('likes'),
                    improvements: formData.get('improvements'),
                    testimonialPermission: formData.get('permission') === 'yes',
                    inviteToken: inviteToken,
                }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setFormStatus('idle')
                
                // Only show voucher-related dialogs for invited users
                if (data.isInvited) {
                    // Check for low rating (invited user with rating < 4)
                    if (rating < 4 && data.voucherDebug === 'low_rating') {
                        // Don't reset form - let user retry with higher rating
                        setDialog({
                            isOpen: true,
                            type: 'low_rating',
                            title: 'Yah, Sayang Sekali... 😢',
                            message: 'Feedback Kamu sudah terkirim, terima kasih!\n\nNamun, kode voucher template gratis hanya diberikan untuk rating 4 atau 5.\n\nKami sangat menghargai masukan Kamu! Jika Kamu bersedia memberikan rating yang lebih baik, silakan kirim feedback lagi dan dapatkan template gratis sebagai apresiasi dari kami. 💝'
                        })
                        return
                    }
                    
                    // Check for invalid token (invited but token doesn't match any customer)
                    if (rating >= 4 && data.voucherDebug === 'invalid_token') {
                        // Don't reset form - let user know there's an issue
                        setDialog({
                            isOpen: true,
                            type: 'invalid_token',
                            title: 'Link Tidak Valid 🔗',
                            message: 'Feedback Kamu sudah terkirim, terima kasih!\n\nNamun, link undangan yang Kamu gunakan sudah tidak valid atau kadaluarsa.\n\nJika Kamu merasa ini adalah kesalahan, silakan hubungi kami melalui halaman Kontak.'
                        })
                        return
                    }
                    
                    // Check for email mismatch
                    if (rating >= 4 && data.voucherDebug === 'email_mismatch') {
                        // Don't reset form - let user fix email
                        setDialog({
                            isOpen: true,
                            type: 'invalid_token',
                            title: 'Email Tidak Cocok 📧',
                            message: 'Feedback Kamu sudah terkirim, terima kasih!\n\nNamun, email yang Kamu masukkan tidak sesuai dengan data pelanggan yang diundang.\n\nPastikan menggunakan email yang sama saat menerima undangan feedback untuk mendapatkan kode voucher gratis. Silakan kirim feedback lagi dengan email yang benar!'
                        })
                        return
                    }
                    
                    // Voucher sent successfully
                    if (data.voucherSent) {
                        form.reset()
                        setRating(5)
                        setDialog({
                            isOpen: true,
                            type: 'success',
                            title: 'Terima Kasih! 🎁',
                            message: 'Feedback Kamu sangat berarti bagi kami!\n\n🎁 Kode voucher template gratis sudah dikirim ke email Kamu! Cek inbox atau folder spam.\n\nGunakan kode voucher tersebut untuk mendapatkan 1 template berbayar secara gratis.'
                        })
                        return
                    }
                    
                    // Voucher already sent before
                    if (data.voucherDebug === 'already_sent') {
                        form.reset()
                        setRating(5)
                        setDialog({
                            isOpen: true,
                            type: 'success',
                            title: 'Terima Kasih!',
                            message: 'Feedback Kamu sangat berarti bagi kami!\n\n📧 Kode voucher sudah pernah dikirim ke email Kamu sebelumnya. Cek inbox atau folder spam jika belum menemukannya.'
                        })
                        return
                    }
                    
                    // Send failed - SMTP issue
                    if (data.voucherDebug === 'send_failed') {
                        form.reset()
                        setRating(5)
                        setDialog({
                            isOpen: true,
                            type: 'success',
                            title: 'Terima Kasih!',
                            message: 'Feedback Kamu sangat berarti bagi kami!\n\n⚠️ Terjadi kendala saat mengirim kode voucher. Tim kami akan mengirimkan voucher ke email Kamu dalam 1x24 jam.'
                        })
                        return
                    }
                    
                    // No voucher code for this customer
                    if (data.voucherDebug === 'no_voucher_code') {
                        form.reset()
                        setRating(5)
                        setDialog({
                            isOpen: true,
                            type: 'success',
                            title: 'Terima Kasih!',
                            message: 'Feedback Kamu sangat berarti bagi kami untuk terus berkembang dan memberikan template terbaik.'
                        })
                        return
                    }
                }
                
                // Regular visitor or other success cases - reset form
                form.reset()
                setRating(5)
                
                let message = 'Feedback Kamu sangat berarti bagi kami untuk terus berkembang dan memberikan template terbaik.'
                
                if (formData.get('permission') === 'yes') {
                    message += '\n\nJika Kamu mengizinkan, testimoni Kamu mungkin akan ditampilkan di halaman utama.'
                }
                
                setDialog({
                    isOpen: true,
                    type: 'success',
                    title: 'Terima Kasih!',
                    message
                })
            } else {
                setFormStatus('idle')
                setDialog({
                    isOpen: true,
                    type: 'error',
                    title: 'Gagal Mengirim',
                    message: data.error || 'Terjadi kesalahan saat mengirim masukan. Silakan coba lagi.'
                })
            }
        } catch (error) {
            console.error('Error:', error)
            setFormStatus('idle')
            setDialog({
                isOpen: true,
                type: 'error',
                title: 'Koneksi Gagal',
                message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.'
            })
        }
    }

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Floating Heart */}
                <motion.div
                    className="absolute top-28 right-[12%] w-14 h-14 opacity-15"
                    animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-red-400">
                        <path d="M50,88 C25,70 5,55 5,35 C5,20 17,8 32,8 C40,8 47,12 50,18 C53,12 60,8 68,8 C83,8 95,20 95,35 C95,55 75,70 50,88 Z" />
                    </svg>
                </motion.div>

                {/* Floating Blur Circle */}
                <motion.div
                    className="absolute top-48 left-[8%] w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-xl"
                    animate={{ y: [0, 25, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />

                {/* Floating Star */}
                <motion.div
                    className="absolute bottom-36 right-[10%] w-16 h-16 opacity-12"
                    animate={{ y: [0, 18, 0], rotate: [0, 72, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-400">
                        <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" />
                    </svg>
                </motion.div>

                {/* Floating Pill */}
                <motion.div
                    className="absolute bottom-48 left-[15%] w-20 h-8 opacity-15"
                    animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <div className="w-full h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" />
                </motion.div>

                {/* Floating Zigzag */}
                <motion.div
                    className="absolute top-1/2 right-[6%] w-12 h-16 opacity-10"
                    animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
                    transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                >
                    <svg viewBox="0 0 40 60" className="w-full h-full stroke-orange-500" fill="none" strokeWidth="4">
                        <path d="M5,5 L35,20 L5,35 L35,50" />
                    </svg>
                </motion.div>
            </div>

            {/* Hero Header */}
            <section className="relative py-16 md:py-20 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-2xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-600 mb-6">
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/ohfmmfhn.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#ea580c"
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Masukan & Testimoni
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="inline-block text-gray-900"
                                >
                                    Bantu Kami{' '}
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ 
                                        duration: 0.8, 
                                        delay: 0.3,
                                        type: "spring",
                                        stiffness: 120,
                                        damping: 20
                                    }}
                                    whileHover={{ 
                                        scale: 1.02,
                                        transition: { duration: 0.2 }
                                    }}
                                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500"
                                >
                                    Berkembang
                                </motion.span>
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Kami sangat menghargai waktu Kamu untuk membantu kami berkembang. Setiap masukan sangat berharga!
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            {/* Header decoration */}
                            <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />

                            <div className="p-8 md:p-10">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Name & Email */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                                <ClientLordIcon
                                                    src="https://cdn.lordicon.com/dxjqoygy.json"
                                                    trigger="hover"
                                                    colors="primary:#6b7280"
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                Nama Kamu
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                required
                                                placeholder="Nama lengkap atau panggilan"
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                                <ClientLordIcon
                                                    src="https://cdn.lordicon.com/diihvcfp.json"
                                                    trigger="hover"
                                                    colors="primary:#6b7280"
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                required
                                                placeholder="email@example.com"
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Social Media */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="social" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                                <ClientLordIcon
                                                    src="https://cdn.lordicon.com/uvqnvwbl.json"
                                                    trigger="hover"
                                                    colors="primary:#6b7280"
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                Instagram / Twitter (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                id="social"
                                                name="social"
                                                placeholder="@username"
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="socialUrl" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                                <ClientLordIcon
                                                    src="https://cdn.lordicon.com/nduddlov.json"
                                                    trigger="hover"
                                                    colors="primary:#6b7280"
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                Link Profil (Opsional)
                                            </label>
                                            <input
                                                type="url"
                                                id="socialUrl"
                                                name="socialUrl"
                                                placeholder="https://instagram.com/username"
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Template Selection */}
                                    <div>
                                        <label htmlFor="template" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/ghhwiltn.json"
                                                trigger="hover"
                                                colors="primary:#6b7280"
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            Template RSQUARE mana yang Kamu gunakan?
                                        </label>
                                        <select
                                            id="template"
                                            name="template"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                        >
                                            <option value="">-- Pilih Template --</option>
                                            {products.map((product) => (
                                                <option key={product.id} value={product.title}>{product.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Rating */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/hvueufdo.json"
                                                trigger="hover"
                                                colors="primary:#6b7280"
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            Secara keseluruhan, seberapa puas kah Kamu?
                                        </label>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                                            <span className="text-sm text-gray-500">Tidak Puas</span>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setRating(value)}
                                                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold transition-all ${rating === value
                                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                                                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-orange-300'
                                                            }`}
                                                    >
                                                        {value}
                                                    </button>
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-500">Sangat Puas</span>
                                        </div>
                                        <input type="hidden" name="rating" value={rating} />
                                    </div>

                                    {/* What do you like */}
                                    <div>
                                        <label htmlFor="likes" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/egiwmiit.json"
                                                trigger="hover"
                                                colors="primary:#6b7280"
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            Apa yang paling Kamu sukai dari template ini?
                                        </label>
                                        <textarea
                                            id="likes"
                                            name="likes"
                                            rows={4}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all resize-none"
                                            placeholder="Ceritakan pengalaman positif Kamu..."
                                        />
                                    </div>

                                    {/* What needs improvement */}
                                    <div>
                                        <label htmlFor="improvements" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/wloilxuq.json"
                                                trigger="hover"
                                                colors="primary:#6b7280"
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            Adakah bagian yang bisa kami tingkatkan?
                                        </label>
                                        <textarea
                                            id="improvements"
                                            name="improvements"
                                            rows={4}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all resize-none"
                                            placeholder="Berikan saran untuk perbaikan..."
                                        />
                                    </div>

                                    {/* Testimonial Permission */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/ujxzdfjx.json"
                                                trigger="hover"
                                                colors="primary:#6b7280"
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            Bolehkah kami mengutip masukan Kamu sebagai testimoni?
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <label className="flex items-center p-4 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="permission"
                                                    value="yes"
                                                    defaultChecked
                                                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                                                />
                                                <span className="ml-3 text-gray-700">Ya, tentu saja!</span>
                                            </label>
                                            <label className="flex items-center p-4 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="permission"
                                                    value="no"
                                                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                                                />
                                                <span className="ml-3 text-gray-700">Tidak, terima kasih.</span>
                                            </label>
                                        </div>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={formStatus === 'sending'}
                                        whileHover={formStatus === 'idle' ? { scale: 1.02 } : {}}
                                        whileTap={formStatus === 'idle' ? { scale: 0.98 } : {}}
                                        className={`group relative w-full h-14 rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-2 overflow-hidden transition-all ${formStatus === 'sending'
                                                ? 'bg-gray-400 cursor-wait'
                                                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:shadow-orange-200'
                                            }`}
                                    >
                                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                        {formStatus === 'sending' ? (
                                            <>
                                                <ClientLordIcon
                                                    src="https://cdn.lordicon.com/xjovhxra.json"
                                                    trigger="loop"
                                                    colors="primary:#ffffff"
                                                    style={{ width: '24px', height: '24px' }}
                                                />
                                                <span className="relative z-10">Mengirim...</span>
                                            </>
                                        ) : (
                                            <>
                                                <ClientLordIcon
                                                    src="https://cdn.lordicon.com/ternnbni.json"
                                                    trigger="loop-on-hover"
                                                    colors="primary:#ffffff"
                                                    style={{ width: '22px', height: '22px' }}
                                                />
                                                <span className="relative z-10">Kirim Masukan</span>
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Dialog Modal */}
            <AnimatePresence>
                {dialog.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={closeDialog}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                        {/* Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header decoration */}
                            <div className={`h-2 ${
                                dialog.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                                dialog.type === 'low_rating' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                dialog.type === 'invalid_token' ? 'bg-gradient-to-r from-gray-500 to-slate-500' :
                                'bg-gradient-to-r from-red-500 to-rose-500'
                            }`} />

                            <div className="p-8 text-center">
                                {/* Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                                    className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                                        dialog.type === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-200' :
                                        dialog.type === 'low_rating' ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-200' :
                                        dialog.type === 'invalid_token' ? 'bg-gradient-to-br from-gray-500 to-slate-500 shadow-lg shadow-gray-200' :
                                        'bg-gradient-to-br from-red-500 to-rose-500 shadow-lg shadow-red-200'
                                    }`}
                                >
                                    <ClientLordIcon
                                        src={
                                            dialog.type === 'success' ? "https://cdn.lordicon.com/oqdmuxru.json" :
                                            dialog.type === 'low_rating' ? "https://cdn.lordicon.com/drxwpfop.json" :
                                            dialog.type === 'invalid_token' ? "https://cdn.lordicon.com/nduddlov.json" :
                                            "https://cdn.lordicon.com/usownftb.json"
                                        }
                                        trigger="loop"
                                        delay="300"
                                        colors="primary:#ffffff"
                                        style={{ width: '48px', height: '48px' }}
                                    />
                                </motion.div>

                                {/* Title */}
                                <h3 className={`text-2xl font-bold mb-3 ${
                                    dialog.type === 'success' ? 'text-green-800' : 
                                    dialog.type === 'low_rating' ? 'text-amber-800' :
                                    dialog.type === 'invalid_token' ? 'text-gray-800' :
                                    'text-red-800'
                                }`}>
                                    {dialog.title}
                                </h3>

                                {/* Message */}
                                <div className="text-gray-600 leading-relaxed mb-8 text-center">
                                    {dialog.message.split('\n').map((line, i) => (
                                        <p key={i} className={line ? '' : 'h-2'}>{line}</p>
                                    ))}
                                </div>

                                {/* Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={closeDialog}
                                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                                        dialog.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-200' :
                                        dialog.type === 'low_rating' ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-200' :
                                        dialog.type === 'invalid_token' ? 'bg-gradient-to-r from-gray-500 to-slate-500 hover:shadow-lg hover:shadow-gray-200' :
                                        'bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-lg hover:shadow-red-200'
                                    }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <ClientLordIcon
                                            src={
                                                dialog.type === 'success' ? "https://cdn.lordicon.com/egiwmiit.json" :
                                                dialog.type === 'low_rating' ? "https://cdn.lordicon.com/lomfljuq.json" :
                                                dialog.type === 'invalid_token' ? "https://cdn.lordicon.com/egiwmiit.json" :
                                                "https://cdn.lordicon.com/akuwjdzh.json"
                                            }
                                            trigger="hover"
                                            colors="primary:#ffffff"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        {dialog.type === 'success' ? 'Tutup' : 
                                         dialog.type === 'low_rating' ? 'Coba Rating Lebih Tinggi' :
                                         dialog.type === 'invalid_token' ? 'Tutup' :
                                         'Coba Lagi'}
                                    </span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}

export default function FeedbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        }>
            <FeedbackContent />
        </Suspense>
    )
}
