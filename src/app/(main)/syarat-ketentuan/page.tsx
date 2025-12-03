'use client'

import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

export default function SyaratKetentuanPage() {
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
                                <FileText className="w-4 h-4 mr-2" />
                                Legal
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                                Syarat &{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                                    Ketentuan
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Harap baca dengan saksama sebelum menggunakan situs web atau membeli produk kami.
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
                                    1. Pendahuluan
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Dengan mengakses situs web ini dan/atau membeli produk dari RSQUARE (&quot;kami&quot;), Kamu setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Kamu tidak setuju dengan bagian mana pun dari persyaratan ini, Kamu tidak diizinkan untuk menggunakan situs web atau produk kami.
                                </p>

                                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-3 border-b border-gray-100">
                                    2. Lisensi Penggunaan & Batasan Tegas
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Saat Kamu membeli template, Kamu mendapatkan lisensi untuk satu orang (pembeli) yang tidak dapat dipindahtangankan. Lisensi ini mengizinkan Kamu untuk menggunakan template untuk keperluan pribadi atau bisnis Kamu sendiri. Namun, Kamu dilarang keras untuk:
                                </p>
                                <ul className="text-gray-600 space-y-3 mt-4">
                                    <li>
                                        <strong>Menjual kembali, menyewakan, meminjamkan, atau mendistribusikan ulang</strong> template atau turunannya dalam bentuk apa pun, baik gratis maupun berbayar.
                                    </li>
                                    <li>
                                        <strong>Membagikan</strong> tautan template atau file PDF berisi link kepada orang lain. Setiap lisensi hanya untuk satu pengguna.
                                    </li>
                                    <li>
                                        <strong>Menghapus atau mengubah</strong> merek atau nama RSQUARE pada template untuk diklaim sebagai karya Kamu sendiri.
                                    </li>
                                    <li>
                                        <strong>Menggunakan</strong> bagian dari desain atau formula kami untuk membuat produk saingan.
                                    </li>
                                </ul>

                                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-3 border-b border-gray-100">
                                    3. Pelanggaran dan Konsekuensi
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Pelanggaran terhadap batasan lisensi di atas dianggap sebagai pelanggaran hak cipta. Kami memantau penyebaran ilegal dari produk digital kami. Jika terbukti terjadi pelanggaran, kami berhak untuk <strong>mencabut lisensi penggunaan Kamu secara permanen tanpa pengembalian dana</strong> dan mengambil tindakan hukum yang diperlukan untuk melindungi kekayaan intelektual kami.
                                </p>

                                <div className="mt-10 p-6 bg-orange-50 rounded-xl border border-orange-100">
                                    <p className="text-orange-800 text-sm m-0">
                                        <strong>Catatan:</strong> Dengan membeli dan menggunakan template kami, Kamu menyatakan telah membaca, memahami, dan menyetujui semua syarat dan ketentuan di atas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}
