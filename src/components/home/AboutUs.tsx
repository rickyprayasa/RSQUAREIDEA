'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const highlights = [
    { text: 'Template Berkualitas Tinggi', iconSrc: 'https://cdn.lordicon.com/xzalkbkz.json' },
    { text: 'Support Bahasa Indonesia', iconSrc: 'https://cdn.lordicon.com/fdxqrdfe.json' },
    { text: 'Update Gratis Seumur Hidup', iconSrc: 'https://cdn.lordicon.com/qhkvfxpn.json' },
    { text: 'Panduan Video Lengkap', iconSrc: 'https://cdn.lordicon.com/aklfruoc.json' },
]

export function AboutUs() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

    return (
        <section ref={sectionRef} className="py-20 relative overflow-hidden">
            {/* Grid Background with Floating Shapes */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Floating Chart/Analytics Icon */}
                <motion.div
                    className="absolute top-20 right-[12%] w-14 h-14 opacity-12"
                    animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                >
                    <svg viewBox="0 0 50 50" className="w-full h-full fill-orange-400">
                        <rect x="5" y="30" width="8" height="15" rx="1" />
                        <rect x="17" y="20" width="8" height="25" rx="1" />
                        <rect x="29" y="10" width="8" height="35" rx="1" />
                        <rect x="41" y="25" width="8" height="20" rx="1" />
                    </svg>
                </motion.div>

                {/* Floating Blur Circle */}
                <motion.div
                    className="absolute bottom-[25%] left-[5%] w-28 h-28 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/15 blur-2xl"
                    animate={{ y: [0, 20, 0], scale: [1, 1.12, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />

                {/* Floating Checkmark/Badge */}
                <motion.div
                    className="absolute top-[40%] left-[8%] w-12 h-12 opacity-12"
                    animate={{ y: [0, -18, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <svg viewBox="0 0 50 50" className="w-full h-full">
                        <circle cx="25" cy="25" r="20" className="fill-green-400" />
                        <path d="M15,25 L22,32 L35,18" className="stroke-white fill-none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.div>

                {/* Floating Triangle */}
                <motion.div
                    className="absolute bottom-[35%] right-[10%] w-10 h-10 opacity-10"
                    animate={{ y: [0, 15, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                    <svg viewBox="0 0 50 50" className="w-full h-full fill-amber-400">
                        <polygon points="25,5 45,45 5,45" />
                    </svg>
                </motion.div>

                {/* Floating Dots Pattern */}
                <motion.div
                    className="absolute top-[60%] right-[20%] w-16 h-16 opacity-8"
                    animate={{ y: [0, -12, 0], opacity: [0.08, 0.12, 0.08] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <svg viewBox="0 0 50 50" className="w-full h-full fill-orange-400">
                        <circle cx="10" cy="10" r="4" />
                        <circle cx="25" cy="10" r="4" />
                        <circle cx="40" cy="10" r="4" />
                        <circle cx="10" cy="25" r="4" />
                        <circle cx="25" cy="25" r="4" />
                        <circle cx="40" cy="25" r="4" />
                        <circle cx="10" cy="40" r="4" />
                        <circle cx="25" cy="40" r="4" />
                        <circle cx="40" cy="40" r="4" />
                    </svg>
                </motion.div>
            </div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-amber-100 rounded-3xl blur-2xl opacity-50 scale-95" />

                        {/* Illustration */}
                        <Image
                            src="/images/visual-data-illustration.png"
                            alt="Visual Data Illustration"
                            width={500}
                            height={500}
                            className="relative z-10 w-full max-w-md mx-auto drop-shadow-lg"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="inline-flex items-center gap-2 text-orange-500 font-semibold text-sm uppercase tracking-wider mb-3"
                        >
                            <lord-icon
                                src="https://cdn.lordicon.com/yqzmiobz.json"
                                trigger="loop"
                                delay="3000"
                                colors="primary:#f97316"
                                style={{ width: '20px', height: '20px' }}
                            />
                            Mengapa RSQUARE
                        </motion.span>

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
                            Solusi Spreadsheet{' '}
                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                                Untuk Bisnis Kamu
                            </span>
                        </h2>

                        <p className="text-gray-600 mb-4 leading-relaxed">
                            RSQUARE hadir untuk menyederhanakan pengelolaan data bagi UMKM dan profesional di Indonesia. Kami percaya bahwa produktivitas tidak harus mahal atau rumit.
                        </p>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Dengan template Google Sheets yang powerful dan desain antarmuka yang intuitif, kami menciptakan alat bantu yang fungsional dan menyenangkan untuk digunakan.
                        </p>

                        <ul className="space-y-3 mb-8">
                            {highlights.map((item, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <lord-icon
                                            src={item.iconSrc}
                                            trigger="loop"
                                            delay="3000"
                                            colors="primary:#f97316"
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                    </div>
                                    <span className="text-gray-700 font-medium">{item.text}</span>
                                </motion.li>
                            ))}
                        </ul>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4, delay: 0.7 }}
                        >
                            <Link
                                href="/tentang-kami"
                                className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 transition-colors group"
                            >
                                <span>Selengkapnya tentang kami</span>
                                <lord-icon
                                    src="https://cdn.lordicon.com/vduvxizq.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#ea580c"
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
