'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DialogState {
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
}

export default function KontakPage() {
    const [contactEmail, setContactEmail] = useState('hello@rsquareidea.my.id')
    const [formStatus, setFormStatus] = useState<'idle' | 'sending'>('idle')
    const [dialog, setDialog] = useState<DialogState>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    })

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings?.contact_email) {
                    setContactEmail(data.settings.contact_email)
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
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    subject: formData.get('subject'),
                    message: formData.get('message'),
                }),
            })

            if (res.ok) {
                setFormStatus('idle')
                form.reset()
                setDialog({
                    isOpen: true,
                    type: 'success',
                    title: 'Pesan Terkirim!',
                    message: 'Terima kasih telah menghubungi kami. Kami akan segera merespons pesan Kamu.'
                })
            } else {
                setFormStatus('idle')
                setDialog({
                    isOpen: true,
                    type: 'error',
                    title: 'Gagal Mengirim',
                    message: 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.'
                })
            }
        } catch (error) {
            console.error('Error:', error)
            setFormStatus('idle')
            setDialog({
                isOpen: true,
                type: 'error',
                title: 'Koneksi Gagal',
                message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
            })
        }
    }

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Floating Pentagon */}
                <motion.div
                    className="absolute top-24 right-[10%] w-16 h-16 opacity-15"
                    animate={{ y: [0, -20, 0], rotate: [0, 72, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-orange-400">
                        <polygon points="50,5 97,35 82,90 18,90 3,35" />
                    </svg>
                </motion.div>

                {/* Floating Blur Circle */}
                <motion.div
                    className="absolute top-40 left-[8%] w-28 h-28 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-xl"
                    animate={{ y: [0, 25, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />

                {/* Floating Cross/Plus */}
                <motion.div
                    className="absolute bottom-40 right-[15%] w-14 h-14 opacity-10"
                    animate={{ y: [0, 15, 0], rotate: [0, 90, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-orange-500">
                        <rect x="40" y="10" width="20" height="80" />
                        <rect x="10" y="40" width="80" height="20" />
                    </svg>
                </motion.div>

                {/* Floating Diamond */}
                <motion.div
                    className="absolute bottom-32 left-[12%] w-12 h-12 opacity-15"
                    animate={{ y: [0, -18, 0], rotate: [45, 45, 45], scale: [1, 1.15, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 rounded-sm transform rotate-45" />
                </motion.div>

                {/* Floating Donut */}
                <motion.div
                    className="absolute top-1/2 left-[5%] w-20 h-20 opacity-10"
                    animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                >
                    <div className="w-full h-full border-4 border-amber-400 rounded-full" />
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
                                <lord-icon
                                    src="https://cdn.lordicon.com/fdxqrdfe.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#ea580c"
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Hubungi Kami
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                                Ada Pertanyaan?{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                                    Kami Siap Membantu
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Punya pertanyaan, masukan, atau butuh bantuan? Kami siap mendengarkan dan merespons dengan cepat.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-5 gap-8">
                            {/* Contact Info Cards */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="md:col-span-2 space-y-4"
                            >
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                                        <lord-icon
                                            src="https://cdn.lordicon.com/nzixoeyk.json"
                                            trigger="loop"
                                            delay="2000"
                                            colors="primary:#ea580c"
                                            style={{ width: '28px', height: '28px' }}
                                        />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                                    <a
                                        href={`mailto:${contactEmail}`}
                                        className="text-orange-600 hover:text-orange-700 transition-colors break-all"
                                    >
                                        {contactEmail}
                                    </a>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                        <lord-icon
                                            src="https://cdn.lordicon.com/surcxhka.json"
                                            trigger="loop"
                                            delay="2500"
                                            colors="primary:#2563eb"
                                            style={{ width: '28px', height: '28px' }}
                                        />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Lokasi</h3>
                                    <p className="text-gray-600 text-sm">Indonesia</p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                                        <lord-icon
                                            src="https://cdn.lordicon.com/aycieyht.json"
                                            trigger="loop"
                                            delay="3000"
                                            colors="primary:#7c3aed"
                                            style={{ width: '28px', height: '28px' }}
                                        />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Jam Operasional</h3>
                                    <p className="text-gray-600 text-sm">Senin - Jumat, 09:00 - 17:00</p>
                                </div>
                            </motion.div>

                            {/* Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="md:col-span-3"
                            >
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                                    <div className="flex items-center gap-2 mb-6">
                                        <lord-icon
                                            src="https://cdn.lordicon.com/hvueufdo.json"
                                            trigger="loop"
                                            delay="2000"
                                            colors="primary:#f97316"
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                        <h2 className="text-xl font-bold text-gray-900">Kirim Pesan</h2>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nama Kamu
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                                    placeholder="Nama lengkap"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                                Subjek
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                                placeholder="Topik pesan Kamu"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                                Pesan
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={4}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all resize-none"
                                                placeholder="Tulis pesan Kamu di sini..."
                                            />
                                        </div>

                                        <motion.button
                                            type="submit"
                                            disabled={formStatus === 'sending'}
                                            whileHover={formStatus === 'idle' ? { scale: 1.02 } : {}}
                                            whileTap={formStatus === 'idle' ? { scale: 0.98 } : {}}
                                            className={`group relative w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 overflow-hidden transition-all ${formStatus === 'sending'
                                                ? 'bg-gray-400 cursor-wait'
                                                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:shadow-orange-200'
                                                }`}
                                        >
                                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                            {formStatus === 'sending' ? (
                                                <>
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/xjovhxra.json"
                                                        trigger="loop"
                                                        colors="primary:#ffffff"
                                                        style={{ width: '24px', height: '24px' }}
                                                    />
                                                    <span className="relative z-10">Mengirim...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/ternnbni.json"
                                                        trigger="loop-on-hover"
                                                        colors="primary:#ffffff"
                                                        style={{ width: '20px', height: '20px' }}
                                                    />
                                                    <span className="relative z-10">Kirim Pesan</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </div>
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
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`h-2 ${dialog.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`} />

                            <div className="p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                                    className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${dialog.type === 'success'
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-200'
                                        : 'bg-gradient-to-br from-red-500 to-rose-500 shadow-lg shadow-red-200'
                                        }`}
                                >
                                    <lord-icon
                                        src={dialog.type === 'success'
                                            ? "https://cdn.lordicon.com/oqdmuxru.json"
                                            : "https://cdn.lordicon.com/usownftb.json"
                                        }
                                        trigger="loop"
                                        delay="300"
                                        colors="primary:#ffffff"
                                        style={{ width: '48px', height: '48px' }}
                                    />
                                </motion.div>

                                <h3 className={`text-2xl font-bold mb-3 ${dialog.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                    {dialog.title}
                                </h3>

                                <p className="text-gray-600 leading-relaxed mb-8">
                                    {dialog.message}
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={closeDialog}
                                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${dialog.type === 'success'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-200'
                                        : 'bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-lg hover:shadow-red-200'
                                        }`}
                                >
                                    {dialog.type === 'success' ? 'Tutup' : 'Coba Lagi'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}
