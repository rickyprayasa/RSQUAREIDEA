'use client'

import { ClientLordIcon } from '@/components/ui/lordicon'

import { motion } from 'framer-motion'
import Link from 'next/link'

const sections = [
    {
        title: 'Pendahuluan',
        content: 'Dengan mengakses situs web ini dan/atau membeli produk dari RSQUARE ("kami"), Kamu setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Kamu tidak setuju dengan bagian mana pun dari persyaratan ini, Kamu tidak diizinkan untuk menggunakan situs web atau produk kami.',
    },
    {
        title: 'Lisensi Penggunaan & Batasan Tegas',
        content: 'Saat Kamu membeli template, Kamu mendapatkan lisensi untuk satu orang (pembeli) yang tidak dapat dipindahtangankan. Lisensi ini mengizinkan Kamu untuk menggunakan template untuk keperluan pribadi atau bisnis Kamu sendiri. Namun, Kamu dilarang keras untuk:',
        list: [
            {
                title: 'Menjual kembali, menyewakan, meminjamkan, atau mendistribusikan ulang',
                desc: 'template atau turunannya dalam bentuk apa pun, baik gratis maupun berbayar.'
            },
            {
                title: 'Membagikan',
                desc: 'tautan template atau file PDF berisi link kepada orang lain. Setiap lisensi hanya untuk satu pengguna.'
            },
            {
                title: 'Menghapus atau mengubah',
                desc: 'merek atau nama RSQUARE pada template untuk diklaim sebagai karya Kamu sendiri.'
            },
            {
                title: 'Menggunakan',
                desc: 'bagian dari desain atau formula kami untuk membuat produk saingan.'
            },
        ]
    },
    {
        title: 'Pelanggaran dan Konsekuensi',
        content: 'Pelanggaran terhadap batasan lisensi di atas dianggap sebagai pelanggaran hak cipta. Kami memantau penyebaran ilegal dari produk digital kami. Jika terbukti terjadi pelanggaran, kami berhak untuk mencabut lisensi penggunaan Kamu secara permanen tanpa pengembalian dana dan mengambil tindakan hukum yang diperlukan untuk melindungi kekayaan intelektual kami.',
        warning: true,
    },
    {
        title: 'Pengembalian Dana',
        content: 'Karena sifat produk digital, semua penjualan bersifat final. Kami tidak menawarkan pengembalian dana setelah pembelian selesai. Pastikan untuk membaca deskripsi produk dengan seksama sebelum melakukan pembelian.',
    },
    {
        title: 'Perubahan Syarat',
        content: 'Kami berhak untuk memperbarui syarat dan ketentuan ini kapan saja. Perubahan akan berlaku segera setelah diposting di situs web ini. Penggunaan berkelanjutan Kamu atas situs web dan produk kami setelah perubahan tersebut merupakan penerimaan Kamu terhadap syarat yang direvisi.',
    },
]

export default function SyaratKetentuanPage() {
    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
                
                {/* Floating Orbs */}
                <motion.div
                    className="absolute top-40 left-20 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-40 right-20 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl"
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
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/nocovwne.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#ea580c"
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Legal
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="inline-block text-gray-900"
                                >
                                    Syarat &{' '}
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
                                    Ketentuan
                                </motion.span>
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Harap baca dengan saksama sebelum menggunakan situs web atau membeli produk kami.
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
                                                                    <span className="font-semibold text-gray-800">{item.title}</span>
                                                                    <span className="text-gray-600"> {item.desc}</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                {section.warning && (
                                                    <div className="mt-6 p-5 bg-red-50 border border-red-100 rounded-xl">
                                                        <div className="flex items-start gap-3">
                                                            <ClientLordIcon
                                                                src="https://cdn.lordicon.com/usownftb.json"
                                                                trigger="loop"
                                                                delay="2000"
                                                                colors="primary:#dc2626"
                                                                style={{ width: '24px', height: '24px', flexShrink: 0 }}
                                                            />
                                                            <p className="text-red-700 text-sm font-medium">
                                                                Pelanggaran dapat mengakibatkan pencabutan lisensi permanen tanpa pengembalian dana dan tindakan hukum.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Agreement Note */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className="mt-12 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100"
                                >
                                    <div className="flex items-start gap-4">
                                        <ClientLordIcon
                                            src="https://cdn.lordicon.com/egiwmiit.json"
                                            trigger="loop"
                                            delay="2000"
                                            colors="primary:#ea580c"
                                            style={{ width: '28px', height: '28px', flexShrink: 0 }}
                                        />
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Catatan:</span> Dengan membeli dan menggunakan template kami, Kamu menyatakan telah membaca, memahami, dan menyetujui semua syarat dan ketentuan di atas.
                                        </p>
                                    </div>
                                </motion.div>

                                {/* CTA */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                    className="mt-8 pt-8 border-t border-gray-100"
                                >
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/ujxzdfjx.json"
                                                trigger="loop"
                                                delay="2000"
                                                colors="primary:#6b7280"
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                            Ada pertanyaan tentang syarat ini?
                                        </p>
                                        <Link
                                            href="/kontak"
                                            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all hover:-translate-y-0.5"
                                        >
                                            <span>Hubungi Kami</span>
                                            <ClientLordIcon
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
