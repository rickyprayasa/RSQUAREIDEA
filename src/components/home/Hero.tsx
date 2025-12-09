'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ClientLordIcon } from '@/components/ui/lordicon'
import { FlipWords } from '@/components/ui/flip-words'

export function Hero() {
    return (
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-32">
            <div className="container mx-auto px-6 text-center relative z-10">
                {/* Badge */}
                <div className="flex justify-center mb-6 md:mb-8 animate-fade-in">
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600 ring-1 ring-inset ring-orange-200 shadow-sm">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        Template Google Sheets Premium #1 di Indonesia
                    </span>
                </div>

                {/* Headline */}
                <h1 className="mx-auto max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 md:mb-8 leading-tight animate-fade-in-up">
                    <span className="inline-block">Ubah Data Rumit Menjadi</span>
                    <br className="hidden sm:block" />
                    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 pb-2">
                        <FlipWords 
                            words={["Keputusan Cerdas", "Laporan Rapi", "Insight Bisnis", "Bisnis Profitable"]}
                            className="text-orange-600 p-0"
                        />
                        <motion.span 
                            className="absolute bottom-0 md:-bottom-1 left-0 right-0 h-2 md:h-3 bg-orange-200/50 -z-10 origin-left"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        />
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-600 mb-8 md:mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
                    Tingkatkan produktivitas bisnis dan personal Kamu dengan template Google Sheets siap pakai. Desain estetik, fitur otomatis, dan{' '}
                    <motion.span 
                        className="font-semibold text-gray-900 relative inline-block"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1, ease: [0.4, 0, 0.2, 1] }}
                    >
                        tanpa biaya langganan bulanan
                        <motion.span 
                            className="absolute -bottom-0.5 left-0 right-0 h-2 bg-orange-200/60 -z-10 origin-left"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, delay: 1.4, ease: [0.4, 0, 0.2, 1] }}
                        />
                    </motion.span>.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 md:mb-16 animate-fade-in-up animation-delay-300">
                    <Link 
                        href="/templates"
                        className="group relative h-12 md:h-14 px-6 md:px-8 text-base md:text-lg rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:shadow-xl transition-shadow duration-300 inline-flex items-center gap-2"
                    >
                        <span>Jelajahi Template</span>
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                    <Link 
                        href="#features"
                        className="group h-12 md:h-14 px-6 md:px-8 text-base md:text-lg rounded-full border-2 border-gray-200 text-gray-700 font-medium hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-300 inline-flex items-center gap-2"
                    >
                        <span>Pelajari Lebih Lanjut</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </Link>
                </div>

                {/* Hero Image */}
                <div className="relative mx-auto max-w-5xl animate-fade-in-up animation-delay-400">
                    <Image
                        src="/images/hero-image.png"
                        alt="Kumpulan Template RSQUARE"
                        width={1200}
                        height={800}
                        className="w-full h-auto drop-shadow-2xl"
                        priority
                    />

                    {/* Glow Effect - only on desktop */}
                    <div className="absolute inset-0 -z-10 bg-orange-500/15 blur-[80px] rounded-full transform scale-75 hidden md:block" />

                    {/* Floating Elements - only on desktop */}
                    <motion.div 
                        className="absolute -right-4 top-10 md:-right-8 md:top-16 bg-white p-3 md:p-4 rounded-xl shadow-lg border border-gray-200 hidden lg:block z-20"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/ghhwiltn.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#16a34a,secondary:#4ade80"
                                    style={{ width: '24px', height: '24px' }}
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Fitur Pintar</p>
                                <p className="text-base font-bold text-gray-900">Rumus Otomatis</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="absolute -left-4 bottom-10 md:-left-8 md:bottom-16 bg-white p-3 md:p-4 rounded-xl shadow-lg border border-gray-200 hidden lg:block z-20"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/gqdnbnwt.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#2563eb,secondary:#60a5fa"
                                    style={{ width: '24px', height: '24px' }}
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Visualisasi</p>
                                <p className="text-base font-bold text-gray-900">Dashboard Rapi</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Background Gradient Orbs - simplified */}
            <div className="absolute top-0 right-0 -z-10 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-orange-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 -z-10 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 hidden md:block" />
        </section>
    )
}
