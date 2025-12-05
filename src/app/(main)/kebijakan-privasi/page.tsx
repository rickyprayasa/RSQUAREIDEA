'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface ListItem {
    title?: string
    desc: string
}

interface Section {
    title: string
    content: string
    list?: ListItem[]
}

const sections: Section[] = [
    {
        title: 'Pendahuluan',
        content: 'Selamat datang di RSQUARE. Kami menghargai privasi Kamu dan berkomitmen untuk melindungi data pribadi Kamu. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi yang Kamu berikan saat menggunakan situs web kami.',
    },
    {
        title: 'Informasi yang Kami Kumpulkan',
        content: 'Kami mengumpulkan informasi melalui cara-cara berikut:',
        list: [
            {
                title: 'Informasi yang Kamu Berikan Langsung',
                desc: 'Saat Kamu mengisi formulir kontak, kami akan mengumpulkan nama dan alamat email Kamu agar kami dapat merespons pertanyaan Kamu.'
            },
            {
                title: 'Data Penggunaan Otomatis',
                desc: 'Seperti kebanyakan situs web, kami mungkin mengumpulkan data non-pribadi secara otomatis, seperti jenis browser, alamat IP, dan halaman yang Kamu kunjungi, untuk membantu kami memahami bagaimana pengunjung menggunakan situs kami dan untuk meningkatkan layanan kami.'
            },
        ]
    },
    {
        title: 'Bagaimana Kami Menggunakan Informasi Kamu',
        content: 'Informasi yang kami kumpulkan digunakan untuk tujuan berikut:',
        list: [
            { desc: 'Untuk berkomunikasi dengan Kamu dan menjawab pertanyaan yang Kamu ajukan melalui formulir kontak.' },
            { desc: 'Untuk menganalisis dan meningkatkan pengalaman pengguna di situs web kami.' },
            { desc: 'Untuk menjaga keamanan situs web kami.' },
        ]
    },
    {
        title: 'Tautan ke Situs Pihak Ketiga',
        content: 'Website kami berisi tautan ke situs pihak ketiga untuk proses pembelian produk. Saat Kamu mengklik tautan tersebut dan melakukan transaksi, data pribadi dan pembayaran Kamu akan diatur oleh kebijakan privasi dari platform pihak ketiga tersebut. Kami tidak mengumpulkan atau menyimpan informasi kartu kredit atau detail pembayaran Kamu. Kami menganjurkan Kamu untuk membaca kebijakan privasi mereka.',
    },
    {
        title: 'Keamanan Data',
        content: 'Kami mengambil langkah-langkah keamanan yang wajar untuk melindungi informasi pribadi Kamu dari akses yang tidak sah, penggunaan, atau pengungkapan. Namun, tidak ada metode transmisi melalui internet atau penyimpanan elektronik yang 100% aman.',
    },
    {
        title: 'Hubungi Kami',
        content: 'Jika Kamu memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui halaman kontak.',
    },
]

export default function KebijakanPrivasiPage() {
    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
                
                {/* Floating Orbs */}
                <motion.div
                    className="absolute top-40 right-20 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-40 left-20 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, -20, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Hero Header */}
            <section className="relative py-16 md:py-20 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-600 mb-6">
                                <lord-icon
                                    src="https://cdn.lordicon.com/jgnvfzqg.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#ea580c"
                                    style={{ width: '18px', height: '18px' }}
                                />
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
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            {/* Header decoration */}
                            <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
                            
                            <div className="p-8 md:p-12">
                                <div className="space-y-10">
                                    {sections.map((section, index) => (
                                        <motion.div
                                            key={section.title}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 * index }}
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <span className="text-orange-600 font-bold">{index + 1}</span>
                                                </div>
                                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 pt-1">
                                                    {section.title}
                                                </h2>
                                            </div>
                                            
                                            <div className="ml-14">
                                                <p className="text-gray-600 leading-relaxed">
                                                    {section.content}
                                                </p>
                                                
                                                {section.list && (
                                                    <ul className="mt-4 space-y-3">
                                                        {section.list.map((item, i) => (
                                                            <li key={i} className="flex items-start gap-3">
                                                                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                                                                <div>
                                                                    {item.title && (
                                                                        <span className="font-semibold text-gray-800">{item.title}: </span>
                                                                    )}
                                                                    <span className="text-gray-600">{item.desc}</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className="mt-12 pt-8 border-t border-gray-100"
                                >
                                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <lord-icon
                                                src="https://cdn.lordicon.com/fdxqrdfe.json"
                                                trigger="loop"
                                                delay="2000"
                                                colors="primary:#ea580c"
                                                style={{ width: '32px', height: '32px' }}
                                            />
                                            <p className="text-gray-700 font-medium">Ada pertanyaan tentang kebijakan ini?</p>
                                        </div>
                                        <Link
                                            href="/kontak"
                                            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all hover:-translate-y-0.5"
                                        >
                                            <span>Hubungi Kami</span>
                                            <lord-icon
                                                src="https://cdn.lordicon.com/vduvxizq.json"
                                                trigger="loop-on-hover"
                                                colors="primary:#ffffff"
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}
