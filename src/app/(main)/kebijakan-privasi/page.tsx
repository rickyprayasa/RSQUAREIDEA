'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function KebijakanPrivasiPage() {
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
                                <Shield className="w-4 h-4 mr-2" />
                                Legal
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                                Kebijakan{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                                    Privasi
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Privasi Kamu penting bagi kami. Terakhir diperbarui: 17 Juli 2025
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                            <div className="prose prose-lg max-w-none">
                                <h2 className="text-2xl font-bold text-gray-900 mt-0 mb-4 pb-3 border-b border-gray-100">
                                    Pendahuluan
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Selamat datang di RSQUARE. Kami menghargai privasi Kamu dan berkomitmen untuk melindungi data pribadi Kamu. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi yang Kamu berikan saat menggunakan situs web kami.
                                </p>

                                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-3 border-b border-gray-100">
                                    Informasi yang Kami Kumpulkan
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Kami mengumpulkan informasi melalui cara-cara berikut:
                                </p>
                                <ul className="text-gray-600 space-y-3 mt-4">
                                    <li>
                                        <strong>Informasi yang Kamu Berikan Langsung:</strong> Saat Kamu mengisi formulir kontak, kami akan mengumpulkan nama dan alamat email Kamu agar kami dapat merespons pertanyaan Kamu.
                                    </li>
                                    <li>
                                        <strong>Data Penggunaan Otomatis:</strong> Seperti kebanyakan situs web, kami mungkin mengumpulkan data non-pribadi secara otomatis, seperti jenis browser, alamat IP, dan halaman yang Kamu kunjungi, untuk membantu kami memahami bagaimana pengunjung menggunakan situs kami dan untuk meningkatkan layanan kami.
                                    </li>
                                </ul>

                                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-3 border-b border-gray-100">
                                    Bagaimana Kami Menggunakan Informasi Kamu
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Informasi yang kami kumpulkan digunakan untuk tujuan berikut:
                                </p>
                                <ul className="text-gray-600 space-y-3 mt-4">
                                    <li>Untuk berkomunikasi dengan Kamu dan menjawab pertanyaan yang Kamu ajukan melalui formulir kontak.</li>
                                    <li>Untuk menganalisis dan meningkatkan pengalaman pengguna di situs web kami.</li>
                                    <li>Untuk menjaga keamanan situs web kami.</li>
                                </ul>

                                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-3 border-b border-gray-100">
                                    Tautan ke Situs Pihak Ketiga
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Website kami berisi tautan ke situs pihak ketiga untuk proses pembelian produk. Saat Kamu mengklik tautan tersebut dan melakukan transaksi, data pribadi dan pembayaran Kamu akan diatur oleh kebijakan privasi dari platform pihak ketiga tersebut. Kami tidak mengumpulkan atau menyimpan informasi kartu kredit atau detail pembayaran Kamu. Kami menganjurkan Kamu untuk membaca kebijakan privasi mereka.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}
