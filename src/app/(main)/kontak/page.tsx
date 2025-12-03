'use client'

import { motion } from 'framer-motion'
import { Mail, MessageSquare, Send } from 'lucide-react'

export default function KontakPage() {
    return (
        <main className="min-h-screen relative">
            {/* Global Grid Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
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
                            <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600 ring-1 ring-inset ring-orange-200 mb-6">
                                <MessageSquare className="w-4 h-4 mr-2" />
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
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-xl mx-auto"
                    >
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-10">
                            <form className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Kamu
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                        placeholder="Masukkan nama Kamu"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Alamat Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Pesan Kamu
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={5}
                                        required
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                                        placeholder="Tulis pesan Kamu di sini..."
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full h-14 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg shadow-lg shadow-orange-200/50 flex items-center justify-center gap-2 group relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Send className="w-5 h-5" />
                                        Kirim Pesan
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </motion.button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-500 text-sm">
                                Atau hubungi kami langsung via email
                            </p>
                            <a 
                                href="mailto:hello@rsquareidea.my.id" 
                                className="inline-flex items-center gap-2 text-orange-600 font-medium mt-2 hover:text-orange-700 transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                hello@rsquareidea.my.id
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}
