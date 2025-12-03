'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function KontakPage() {
    const [contactEmail, setContactEmail] = useState('hello@rsquareidea.my.id')
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setFormStatus('sending')
        setTimeout(() => {
            setFormStatus('sent')
            setTimeout(() => setFormStatus('idle'), 3000)
        }, 1000)
    }

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
                
                {/* Floating Orbs */}
                <motion.div
                    className="absolute top-20 right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-40 left-10 w-72 h-72 bg-amber-200/40 rounded-full blur-3xl"
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
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
                                            src="https://cdn.lordicon.com/diihvcfp.json"
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
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                        <lord-icon
                                            src="https://cdn.lordicon.com/srsgifqc.json"
                                            trigger="loop"
                                            delay="2500"
                                            colors="primary:#16a34a"
                                            style={{ width: '28px', height: '28px' }}
                                        />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
                                    <p className="text-gray-600 text-sm">Respon cepat via WhatsApp</p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                        <lord-icon
                                            src="https://cdn.lordicon.com/surcxhka.json"
                                            trigger="loop"
                                            delay="3000"
                                            colors="primary:#2563eb"
                                            style={{ width: '28px', height: '28px' }}
                                        />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Lokasi</h3>
                                    <p className="text-gray-600 text-sm">Indonesia</p>
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
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`group relative w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 overflow-hidden transition-all ${
                                                formStatus === 'sent' 
                                                    ? 'bg-green-500' 
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
                                            ) : formStatus === 'sent' ? (
                                                <>
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/oqdmuxru.json"
                                                        trigger="loop"
                                                        colors="primary:#ffffff"
                                                        style={{ width: '24px', height: '24px' }}
                                                    />
                                                    <span className="relative z-10">Pesan Terkirim!</span>
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
        </main>
    )
}
