'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const features = [
    { iconSrc: 'https://cdn.lordicon.com/hvueufdo.json', text: 'Desain Sesuai Kebutuhan', color: 'primary:#f97316' },
    { iconSrc: 'https://cdn.lordicon.com/kbtmbyzy.json', text: 'Pengerjaan Cepat', color: 'primary:#f97316' },
    { iconSrc: 'https://cdn.lordicon.com/jgnvfzqg.json', text: 'Revisi Gratis', color: 'primary:#f97316' },
    { iconSrc: 'https://cdn.lordicon.com/akqsdstj.json', text: 'Support Prioritas', color: 'primary:#f97316' },
]

export function RequestTemplate() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

    return (
        <section ref={sectionRef} className="py-20 relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
                    
                    {/* Left: Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="relative order-2 lg:order-1"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-amber-100 rounded-3xl blur-2xl opacity-60 scale-90" />
                            
                            <Image
                                src="/images/spreadsheets-illustration.png"
                                alt="Custom Spreadsheet Illustration"
                                width={500}
                                height={500}
                                className="relative z-10 w-full max-w-md mx-auto drop-shadow-xl"
                            />
                        </div>

                        {/* Floating badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="absolute -bottom-2 left-4 lg:left-8 bg-white rounded-2xl shadow-xl px-5 py-3 border border-gray-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    <lord-icon
                                        src="https://cdn.lordicon.com/oqdmuxru.json"
                                        trigger="loop"
                                        delay="2000"
                                        colors="primary:#16a34a"
                                        style={{ width: '24px', height: '24px' }}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">100+ Template</p>
                                    <p className="text-xs text-gray-500">Sudah dibuat</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                        className="order-1 lg:order-2"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-6"
                        >
                            <lord-icon
                                src="https://cdn.lordicon.com/hvueufdo.json"
                                trigger="loop"
                                delay="2000"
                                colors="primary:#ea580c"
                                style={{ width: '18px', height: '18px' }}
                            />
                            Custom Template Service
                        </motion.div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                            Butuh Template
                            <span className="block bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                                Khusus?
                            </span>
                        </h2>

                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Tidak menemukan yang Kamu cari? Kami siap membuat template spreadsheet yang 100% sesuai dengan kebutuhan bisnis Kamu.
                        </p>

                        {/* Features grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.text}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                    className="flex items-center gap-3 text-gray-700"
                                >
                                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <lord-icon
                                            src={feature.iconSrc}
                                            trigger="loop"
                                            delay="3000"
                                            colors={feature.color}
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <Link 
                                href="/jasa-kustom"
                                className="group relative h-12 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all duration-300 inline-flex items-center justify-center gap-2 overflow-hidden"
                            >
                                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <span className="relative z-10">Request Template</span>
                                <lord-icon
                                    src="https://cdn.lordicon.com/whtfgdfm.json"
                                    trigger="loop-on-hover"
                                    colors="primary:#ffffff"
                                    style={{ width: '20px', height: '20px' }}
                                    className="relative z-10"
                                />
                            </Link>
                            <Link 
                                href="/kontak"
                                className="group h-12 px-6 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2"
                            >
                                <span>Konsultasi Gratis</span>
                                <lord-icon
                                    src="https://cdn.lordicon.com/fdxqrdfe.json"
                                    trigger="loop-on-hover"
                                    colors="primary:#374151"
                                    style={{ width: '18px', height: '18px' }}
                                />
                            </Link>
                        </motion.div>

                        {/* Trust indicator */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className="mt-6 text-sm text-gray-500 flex items-center gap-2"
                        >
                            <lord-icon
                                src="https://cdn.lordicon.com/oqdmuxru.json"
                                trigger="loop"
                                delay="3000"
                                colors="primary:#22c55e"
                                style={{ width: '18px', height: '18px' }}
                            />
                            Respon dalam 24 jam • Tanpa biaya konsultasi awal
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
