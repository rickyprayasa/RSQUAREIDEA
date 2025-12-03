'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Sparkles, Clock, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
    { icon: Sparkles, text: 'Desain Sesuai Kebutuhan' },
    { icon: Clock, text: 'Pengerjaan Cepat' },
    { icon: Shield, text: 'Revisi Gratis' },
    { icon: Zap, text: 'Support Prioritas' },
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
                            {/* Glow effect behind image */}
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
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
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
                            <Sparkles className="w-4 h-4" />
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
                                        <feature.icon className="w-4 h-4 text-orange-500" />
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
                            <Button asChild size="lg" className="h-12 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all duration-300">
                                <Link href="/jasa-kustom">
                                    Request Template
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-12 px-6 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
                                <Link href="/kontak">
                                    Konsultasi Gratis
                                </Link>
                            </Button>
                        </motion.div>

                        {/* Trust indicator */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className="mt-6 text-sm text-gray-500 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Respon dalam 24 jam • Tanpa biaya konsultasi awal
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
