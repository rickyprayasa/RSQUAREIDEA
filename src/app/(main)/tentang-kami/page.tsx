'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Stats {
    activeUsers: string
    averageRating: string
    totalFeedback: number
}

const values = [
    {
        iconSrc: 'https://cdn.lordicon.com/gqdnbnwt.json',
        title: 'Inovasi',
        description: 'Selalu menghadirkan solusi kreatif dan modern untuk setiap kebutuhan bisnis Kamu.',
        color: 'bg-amber-100',
    },
    {
        iconSrc: 'https://cdn.lordicon.com/xzalkbkz.json',
        title: 'Kualitas',
        description: 'Setiap template dibuat dengan standar tertinggi dan diuji secara menyeluruh.',
        color: 'bg-blue-100',
    },
    {
        iconSrc: 'https://cdn.lordicon.com/ohfmmfhn.json',
        title: 'Kepedulian',
        description: 'Kami peduli dengan kesuksesan Kamu dan selalu siap memberikan dukungan terbaik.',
        color: 'bg-rose-100',
    },
    {
        iconSrc: 'https://cdn.lordicon.com/kbtmbyzy.json',
        title: 'Efisiensi',
        description: 'Menghemat waktu dan energi Kamu dengan template yang siap pakai dan mudah dikustomisasi.',
        color: 'bg-orange-100',
    },
]

const defaultStats = [
    { iconSrc: 'https://cdn.lordicon.com/hrjifpbq.json', key: 'activeUsers', label: 'Pengguna Aktif', suffix: '+' },
    { iconSrc: 'https://cdn.lordicon.com/cvwrvyjv.json', key: 'averageRating', label: 'Rating Rata-rata', suffix: '' },
    { iconSrc: 'https://cdn.lordicon.com/kbtmbyzy.json', key: 'responseTime', label: 'Waktu Respon', value: '24jam' },
]

const features = [
    { text: 'Template berkualitas tinggi dengan desain modern', icon: 'https://cdn.lordicon.com/xzalkbkz.json', color: '#16a34a' },
    { text: 'Panduan video lengkap untuk setiap template', icon: 'https://cdn.lordicon.com/aklfruoc.json', color: '#dc2626' },
    { text: 'Support responsif dan profesional via Email', icon: 'https://cdn.lordicon.com/vpbspaec.json', color: '#2563eb' },
    { text: 'Update berkala dengan fitur-fitur baru', icon: 'https://cdn.lordicon.com/qhkvfxpn.json', color: '#7c3aed' },
    { text: 'Garansi kepuasan dengan revisi gratis', icon: 'https://cdn.lordicon.com/lomfljuq.json', color: '#ea580c' },
    { text: 'Komunitas pengguna yang saling membantu', icon: 'https://cdn.lordicon.com/hrjifpbq.json', color: '#0891b2' },
]

export default function TentangKamiPage() {
    const heroRef = useRef<HTMLDivElement>(null)
    const missionRef = useRef<HTMLDivElement>(null)
    const valuesRef = useRef<HTMLDivElement>(null)
    const statsRef = useRef<HTMLDivElement>(null)
    
    const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
    const missionInView = useInView(missionRef, { once: true, margin: "-100px" })
    const valuesInView = useInView(valuesRef, { once: true, margin: "-100px" })
    const statsInView = useInView(statsRef, { once: true, margin: "-100px" })

    const [stats, setStats] = useState<Stats>({ activeUsers: '0', averageRating: '0', totalFeedback: 0 })

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error)
    }, [])

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

            {/* Hero Section */}
            <section ref={heroRef} className="relative py-16 md:py-24 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={heroInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-12"
                        >
                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-600 mb-6">
                                <lord-icon
                                    src="https://cdn.lordicon.com/xzalkbkz.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#ea580c"
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Tentang Kami
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Solusi Spreadsheet{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                                    Untuk Bisnis Kamu
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                                RSQUARE hadir untuk membantu bisnis dan individu mengelola data dengan lebih efisien melalui template Google Sheets yang powerful dan mudah digunakan.
                            </p>
                        </motion.div>

                        {/* Logo & Brand */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex justify-center"
                        >
                            <div className="relative p-6 bg-white rounded-3xl shadow-2xl shadow-orange-100 border border-gray-100">
                                <Image
                                    src="/images/rsquare-logo.png"
                                    alt="RSQUARE Logo"
                                    width={120}
                                    height={120}
                                    className="w-24 h-24 md:w-32 md:h-32"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section ref={statsRef} className="py-12 md:py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {defaultStats.map((stat, index) => {
                                let displayValue = stat.value || '0'
                                if (stat.key === 'activeUsers') {
                                    displayValue = stats.activeUsers !== '0' ? `${stats.activeUsers}${stat.suffix}` : '0'
                                } else if (stat.key === 'averageRating') {
                                    displayValue = stats.averageRating !== '0' ? stats.averageRating : '-'
                                }
                                
                                return (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={statsInView ? { opacity: 1, y: 0 } : {}}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
                                    >
                                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <lord-icon
                                                src={stat.iconSrc}
                                                trigger="loop"
                                                delay="2000"
                                                colors="primary:#ea580c"
                                                style={{ width: '28px', height: '28px' }}
                                            />
                                        </div>
                                        <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                                            {displayValue}
                                        </div>
                                        <div className="text-sm text-gray-500">{stat.label}</div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section ref={missionRef} className="py-16 md:py-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Content */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={missionInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                                    <lord-icon
                                        src="https://cdn.lordicon.com/wloilxuq.json"
                                        trigger="loop"
                                        delay="2000"
                                        colors="primary:#ea580c"
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    Misi Kami
                                </div>
                                
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                    Memberdayakan Bisnis Dengan{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                                        Data Yang Terorganisir
                                    </span>
                                </h2>
                                
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                    Kami percaya bahwa setiap bisnis, besar maupun kecil, berhak memiliki alat yang powerful untuk mengelola data mereka. 
                                    Melalui template Google Sheets kami, kami membantu Kamu menghemat waktu, mengurangi kesalahan, dan membuat keputusan bisnis yang lebih baik.
                                </p>

                                {/* Features List */}
                                <div className="space-y-3">
                                    {features.map((feature, index) => (
                                        <motion.div
                                            key={feature.text}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={missionInView ? { opacity: 1, x: 0 } : {}}
                                            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${feature.color}15` }}>
                                                <lord-icon
                                                    src={feature.icon}
                                                    trigger="loop"
                                                    delay="2000"
                                                    colors={`primary:${feature.color}`}
                                                    style={{ width: '20px', height: '20px' }}
                                                />
                                            </div>
                                            <span className="text-gray-700">{feature.text}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Illustration */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={missionInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-amber-100 rounded-3xl blur-2xl opacity-60 scale-90" />
                                <Image
                                    src="/images/visual-data-illustration.png"
                                    alt="Data Visualization"
                                    width={500}
                                    height={500}
                                    className="relative z-10 w-full max-w-md mx-auto drop-shadow-xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section ref={valuesRef} className="py-16 md:py-20 relative">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-14"
                        >
                            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-5">
                                <lord-icon
                                    src="https://cdn.lordicon.com/ohfmmfhn.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#ea580c"
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Nilai-Nilai Kami
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Apa Yang{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                                    Mendorong Kami
                                </span>
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                                Nilai-nilai yang menjadi fondasi dalam setiap produk dan layanan yang kami berikan
                            </p>
                        </motion.div>

                        {/* Values Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {values.map((value, index) => (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${value.color}`}>
                                        <lord-icon
                                            src={value.iconSrc}
                                            trigger="loop"
                                            delay="2000"
                                            colors="primary:#ea580c"
                                            style={{ width: '32px', height: '32px' }}
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />
                            </div>
                            
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                    Siap Tingkatkan Produktivitas Kamu?
                                </h2>
                                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                    Jelajahi koleksi template kami dan temukan solusi yang tepat untuk kebutuhan bisnis Kamu.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href="/templates"
                                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                                    >
                                        <span>Lihat Template</span>
                                        <lord-icon
                                            src="https://cdn.lordicon.com/vduvxizq.json"
                                            trigger="loop-on-hover"
                                            colors="primary:#ea580c"
                                            style={{ width: '22px', height: '22px' }}
                                        />
                                    </Link>
                                    <Link
                                        href="/kontak"
                                        className="group inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/50 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
                                    >
                                        <span>Hubungi Kami</span>
                                        <lord-icon
                                            src="https://cdn.lordicon.com/fdxqrdfe.json"
                                            trigger="loop-on-hover"
                                            colors="primary:#ffffff"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}
