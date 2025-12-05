'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DialogState {
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
}

export default function JasaKustomPage() {
    const [formStatus, setFormStatus] = useState<'idle' | 'sending'>('idle')
    const [dialog, setDialog] = useState<DialogState>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    })

    const closeDialog = () => {
        setDialog(prev => ({ ...prev, isOpen: false }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormStatus('sending')

        const formData = new FormData(e.currentTarget)
        const form = e.currentTarget

        try {
            const res = await fetch('/api/template-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('nama'),
                    email: formData.get('email'),
                    phone: formData.get('phone') || null,
                    deadline: formData.get('deadline') || null,
                    requirements: formData.get('requirements'),
                }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setFormStatus('idle')
                form.reset()
                setDialog({
                    isOpen: true,
                    type: 'success',
                    title: 'Permintaan Terkirim!',
                    message: 'Terima kasih atas permintaan Kamu. Tim kami akan menghubungi Kamu dalam 1-2 hari kerja untuk diskusi lebih lanjut.'
                })
            } else {
                setFormStatus('idle')
                setDialog({
                    isOpen: true,
                    type: 'error',
                    title: 'Gagal Mengirim',
                    message: data.error || 'Terjadi kesalahan saat mengirim permintaan. Silakan coba lagi.'
                })
            }
        } catch {
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
            {/* Animated Background with Grid */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Floating Gear */}
                <motion.div
                    className="absolute top-24 right-[10%] w-16 h-16 opacity-15"
                    animate={{ y: [0, -15, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-orange-400">
                        <path d="M50,20 L55,35 L70,30 L65,45 L80,50 L65,55 L70,70 L55,65 L50,80 L45,65 L30,70 L35,55 L20,50 L35,45 L30,30 L45,35 Z" />
                        <circle cx="50" cy="50" r="12" className="fill-white" />
                    </svg>
                </motion.div>

                {/* Floating Blur Circle */}
                <motion.div
                    className="absolute top-40 left-[8%] w-28 h-28 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-xl"
                    animate={{ y: [0, 25, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />

                {/* Floating Brackets */}
                <motion.div
                    className="absolute bottom-40 right-[12%] w-14 h-20 opacity-12"
                    animate={{ y: [0, -18, 0], x: [0, 5, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <svg viewBox="0 0 50 70" className="w-full h-full stroke-orange-500" fill="none" strokeWidth="4">
                        <path d="M15,5 L5,5 L5,65 L15,65" />
                        <path d="M35,5 L45,5 L45,65 L35,65" />
                    </svg>
                </motion.div>

                {/* Floating Cube */}
                <motion.div
                    className="absolute bottom-32 left-[15%] w-12 h-12 opacity-15"
                    animate={{ y: [0, 20, 0], rotate: [0, 45, 0] }}
                    transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-400 rounded-lg transform rotate-12" />
                </motion.div>

                {/* Floating Code Symbol */}
                <motion.div
                    className="absolute top-1/2 left-[5%] w-16 h-12 opacity-10"
                    animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                >
                    <svg viewBox="0 0 60 40" className="w-full h-full stroke-amber-500" fill="none" strokeWidth="3">
                        <path d="M20,5 L5,20 L20,35" />
                        <path d="M40,5 L55,20 L40,35" />
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
                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                    disabled={formStatus === 'sending'}
                                    whileHover={{ scale: formStatus === 'sending' ? 1 : 1.02, y: formStatus === 'sending' ? 0 : -2 }}
                                    whileTap={{ scale: formStatus === 'sending' ? 1 : 0.98 }}
                                    className="group relative w-full h-14 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg shadow-lg shadow-orange-200/50 flex items-center justify-center gap-2 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        {formStatus === 'sending' ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/ternnbni.json"
                                                    trigger="loop-on-hover"
                                                    colors="primary:#ffffff"
                                                    style={{ width: '24px', height: '24px' }}
                                                />
                                                Kirim Permintaan
                                            </>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Success/Error Dialog */}
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
                            className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${dialog.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                {dialog.type === 'success' ? (
                                    <lord-icon
                                        src="https://cdn.lordicon.com/lomfljuq.json"
                                        trigger="loop"
                                        delay="500"
                                        colors="primary:#22c55e"
                                        style={{ width: '40px', height: '40px' }}
                                    />
                                ) : (
                                    <lord-icon
                                        src="https://cdn.lordicon.com/tdrtiskw.json"
                                        trigger="loop"
                                        delay="500"
                                        colors="primary:#ef4444"
                                        style={{ width: '40px', height: '40px' }}
                                    />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{dialog.title}</h3>
                            <p className="text-gray-600 mb-6">{dialog.message}</p>
                            <button
                                onClick={closeDialog}
                                className={`w-full py-3 rounded-xl font-medium text-white transition-colors ${dialog.type === 'success'
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {dialog.type === 'success' ? 'Tutup' : 'Coba Lagi'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}
