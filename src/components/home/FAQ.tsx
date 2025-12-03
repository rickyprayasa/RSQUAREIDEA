'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const faqs = [
    {
        question: "Apakah saya perlu berlangganan bulanan?",
        answer: "Tidak! Semua template RSQUARE adalah sekali bayar (one-time purchase). Kamu bisa menggunakannya selamanya tanpa biaya tambahan.",
    },
    {
        question: "Apakah template ini bisa digunakan di Excel?",
        answer: "Template kami dirancang khusus untuk Google Sheets untuk memanfaatkan fitur kolaborasi dan otomatisasi online. Beberapa fitur mungkin tidak berjalan sempurna jika diekspor ke Excel.",
    },
    {
        question: "Bagaimana jika saya butuh bantuan?",
        answer: "Setiap pembelian dilengkapi dengan panduan video lengkap. Jika masih ada kendala, tim support kami siap membantu melalui WhatsApp atau Email.",
    },
    {
        question: "Apakah saya bisa request fitur tambahan?",
        answer: "Tentu! Kami menyediakan layanan kustomisasi template dengan biaya tambahan sesuai tingkat kesulitan request Kamu.",
    },
    {
        question: "Apakah data saya aman?",
        answer: "Sangat aman. Template ini berjalan di akun Google Drive Kamu sendiri. Kami tidak memiliki akses ke data yang Kamu input.",
    },
]

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)
    const sectionRef = useRef(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

    return (
        <section ref={sectionRef} className="py-20 md:py-28 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 via-white to-white" />
                
                {/* Floating Circles */}
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl"
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-100/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.03]" />
            </div>

            <div className="container mx-auto px-6">
                {/* Header */}
                <motion.div 
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-5"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <lord-icon
                            src="https://cdn.lordicon.com/ujxzdfjx.json"
                            trigger="loop"
                            delay="3000"
                            colors="primary:#ea580c"
                            style={{ width: '20px', height: '20px' }}
                        />
                        <span className="text-sm font-medium text-orange-700">FAQ</span>
                    </motion.div>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Pertanyaan yang Sering{' '}
                        <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                            Ditanyakan
                        </span>
                    </h2>
                    <p className="text-gray-600 max-w-xl mx-auto text-lg">
                        Temukan jawaban untuk pertanyaan umum seputar template dan layanan kami
                    </p>
                </motion.div>

                {/* FAQ Cards */}
                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                        >
                            <div
                                className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                                    openIndex === index 
                                        ? 'border-orange-300 shadow-lg shadow-orange-100' 
                                        : 'border-gray-100 hover:border-orange-200 hover:shadow-md'
                                }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full px-6 py-5 flex items-center gap-4 text-left group"
                                >
                                    {/* Question */}
                                    <span className={`flex-1 font-semibold text-lg transition-colors ${
                                        openIndex === index ? 'text-orange-600' : 'text-gray-900'
                                    }`}>
                                        {faq.question}
                                    </span>
                                    
                                    {/* Toggle Icon */}
                                    <motion.div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                            openIndex === index 
                                                ? 'bg-orange-500' 
                                                : 'bg-gray-100 group-hover:bg-orange-100'
                                        }`}
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <lord-icon
                                            src={openIndex === index 
                                                ? "https://cdn.lordicon.com/hwuyodym.json" 
                                                : "https://cdn.lordicon.com/zrkkrrpl.json"
                                            }
                                            trigger="hover"
                                            colors={openIndex === index ? "primary:#ffffff" : "primary:#6b7280"}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                    </motion.div>
                                </button>
                                
                                {/* Answer */}
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        >
                                            <div className="px-6 pb-5 pt-0">
                                                <div className="pr-12">
                                                    <p className="text-gray-600 leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div 
                    className="text-center mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <p className="text-gray-600 mb-4 flex items-center justify-center gap-2">
                        <lord-icon
                            src="https://cdn.lordicon.com/fdxqrdfe.json"
                            trigger="loop"
                            delay="2000"
                            colors="primary:#f97316"
                            style={{ width: '24px', height: '24px' }}
                        />
                        Masih punya pertanyaan lain?
                    </p>
                    <a
                        href="/kontak"
                        className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-300/50 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                        <lord-icon
                            src="https://cdn.lordicon.com/hvueufdo.json"
                            trigger="loop-on-hover"
                            colors="primary:#ffffff"
                            style={{ width: '20px', height: '20px' }}
                        />
                        <span className="relative z-10">Hubungi Kami</span>
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
