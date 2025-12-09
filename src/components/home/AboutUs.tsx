'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ClientLordIcon } from '@/components/ui/lordicon'

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
        <section ref={sectionRef} className="py-20 relative">
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
                            <ClientLordIcon
                                src="https://cdn.lordicon.com/yqzmiobz.json"
                                trigger="loop"
                                delay="3000"
                                colors="primary:#f97316"
                                style={{ width: '20px', height: '20px' }}
                            />
                            Mengapa RSQUARE
                        </motion.span>

                        <h2 className="text-3xl md:text-4xl font-bold mb-5">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="inline-block text-gray-900"
                            >
                                Solusi Spreadsheet{' '}
                            </motion.span>
                            <span className="relative inline-block">
                                <motion.span
                                    initial={{ opacity: 0, scaleY: 0 }}
                                    animate={isInView ? { opacity: 1, scaleY: 1 } : {}}
                                    transition={{ duration: 0.7, delay: 0.5, type: "spring", stiffness: 120 }}
                                    className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent inline-block"
                                    style={{ transformOrigin: 'bottom' }}
                                >
                                    Untuk Bisnis Kamu
                                </motion.span>
                                <motion.span
                                    initial={{ width: 0 }}
                                    animate={isInView ? { width: "100%" } : {}}
                                    transition={{ duration: 0.6, delay: 0.7 }}
                                    className="absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-orange-400 to-amber-400"
                                />
                            </span>
                        </h2>

                        <motion.p 
                            className="text-gray-600 mb-4 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            RSQUARE hadir untuk menyederhanakan pengelolaan data bagi UMKM dan profesional di Indonesia. Kami percaya bahwa produktivitas tidak harus mahal atau rumit.
                        </motion.p>
                        <motion.p 
                            className="text-gray-600 mb-8 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            Dengan template Google Sheets yang powerful dan desain antarmuka yang intuitif, kami menciptakan alat bantu yang fungsional dan menyenangkan untuk digunakan.
                        </motion.p>

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
                                        <ClientLordIcon
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
                                <ClientLordIcon
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
