'use client'

import { motion } from 'framer-motion'

export default function JasaKustomPage() {
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
                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600 ring-1 ring-inset ring-orange-200 mb-6">
                                <lord-icon
                                    src="https://cdn.lordicon.com/wloilxuq.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#ea580c"
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Jasa Kustom
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                                Template{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                                    Sesuai Kebutuhan
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Butuh solusi yang dibuat khusus? Pesan jasa template Google Sheets kustom yang dirancang sempurna untuk alur kerja unik Kamu.
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
                        className="max-w-2xl mx-auto"
                    >
                        {/* Info Box */}
                        <div className="mb-8 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                            <div className="flex items-start gap-3 mb-4">
                                <lord-icon
                                    src="https://cdn.lordicon.com/rjzlnunf.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#ea580c"
                                    style={{ width: '24px', height: '24px', marginTop: '2px' }}
                                />
                                <h3 className="font-bold text-lg text-orange-900">Harap Dibaca Sebelum Mengisi</h3>
                            </div>
                            
                            <div className="space-y-4 text-sm text-orange-800">
                                <div>
                                    <h4 className="font-semibold mb-1">Harga & Waktu Pengerjaan</h4>
                                    <ul className="list-disc list-inside space-y-1 text-orange-700">
                                        <li>Setiap template kustom adalah sebuah investasi. Harga pengerjaan mulai dari <strong>Rp 250.000,-</strong> tergantung tingkat kerumitan.</li>
                                        <li>Proses pengerjaan normalnya memakan waktu 7-14 hari kerja setelah detail disetujui.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">Disclaimer Penting</h4>
                                    <ul className="list-disc list-inside space-y-1 text-orange-700">
                                        <li><strong>Hak untuk Menolak:</strong> Kami berhak menolak permintaan template kustom jika proyek berada di luar cakupan keahlian kami.</li>
                                        <li><strong>Penggunaan Etis:</strong> Kami tidak akan mengerjakan permintaan template yang ditujukan untuk aktivitas ilegal atau tidak etis.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-10">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Kamu
                                        </label>
                                        <input
                                            type="text"
                                            id="nama"
                                            name="nama"
                                            required
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                            placeholder="Masukkan nama"
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
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nomor HP <span className="text-gray-400">(Opsional)</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                                            Target Tanggal Selesai <span className="text-gray-400">(Opsional)</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="deadline"
                                            name="deadline"
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                                        Jelaskan Kebutuhan Kamu
                                    </label>
                                    <textarea
                                        id="requirements"
                                        name="requirements"
                                        rows={8}
                                        required
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                                        placeholder="Jelaskan sedetail mungkin..."
                                    />
                                    <div className="mt-3 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
                                        <p className="font-semibold mb-2">Mohon sertakan detail berikut agar kami bisa memberikan estimasi yang akurat:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li><strong>Tujuan Utama:</strong> Apa masalah utama yang ingin diselesaikan oleh template ini?</li>
                                            <li><strong>Data Input:</strong> Data apa saja yang akan Kamu masukkan secara manual?</li>
                                            <li><strong>Data Output:</strong> Laporan atau hasil apa yang Kamu harapkan?</li>
                                            <li><strong>Fitur Khusus:</strong> Adakah fitur spesifik yang Kamu inginkan?</li>
                                        </ul>
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative w-full h-14 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg shadow-lg shadow-orange-200/50 flex items-center justify-center gap-2 overflow-hidden"
                                >
                                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        <lord-icon
                                            src="https://cdn.lordicon.com/ternnbni.json"
                                            trigger="loop-on-hover"
                                            colors="primary:#ffffff"
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                        Kirim Permintaan
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}
