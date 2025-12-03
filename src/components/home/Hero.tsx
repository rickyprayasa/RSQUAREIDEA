'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Background3D } from '@/components/ui/background-3d'

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
            {/* 3D Background */}
            <Background3D />

            <div className="container mx-auto px-6 text-center relative z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-8"
                >
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600 ring-1 ring-inset ring-orange-200 shadow-sm">
                        <lord-icon
                            src="https://cdn.lordicon.com/hvueufdo.json"
                            trigger="loop"
                            delay="2000"
                            colors="primary:#f97316"
                            style={{ width: '20px', height: '20px' }}
                        />
                        Template Google Sheets Premium #1 di Indonesia
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl mb-8 leading-tight"
                >
                    Ubah Data Rumit Menjadi <br className="hidden sm:block" />
                    <span className="relative whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                        Keputusan Cerdas
                        <svg aria-hidden="true" viewBox="0 0 418 42" className="absolute left-0 top-2/3 h-[0.58em] w-full fill-orange-200/50 -z-10" preserveAspectRatio="none">
                            <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C61.847 13.691 45.584 16.89 42.477 17.641c-3.475.836-7.14 1.994-10.975 3.235C22.83 23.681 14.39 26.92 9.085 29.36c-5.305 2.44-8.31 4.57-9.01 6.39-.7 1.82.725 3.995 2.85 5.155 2.125 1.16 5.925 1.16 11.4.58 5.475-.58 12.875-2.32 22.2-5.22 9.325-2.9 20.625-7.54 33.9-13.34 13.275-5.8 28.5-12.18 45.675-18.56C133.275 8.58 152.075 3.94 172.85 1.16c20.775-2.78 43.55-4.06 68.325-3.48 24.775.58 51.55 2.9 80.325 7.54 28.775 4.64 59.55 11.6 92.325 20.88 32.775 9.28 67.55 20.88 104.325 34.8 36.775 13.92 73.55 29.52 110.325 46.4 36.775 16.88 73.55 34.8 110.325 53.36 36.775 18.56 73.55 37.12 110.325 55.68 36.775 18.56 73.55 37.12 110.325 55.68 36.775 18.56 73.55 37.12 110.325 55.68 36.775 18.56 73.55 37.12 110.325 55.68 36.775 18.56 73.55 37.12 110.325 55.68" />
                        </svg>
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto max-w-2xl text-xl text-gray-600 mb-10 leading-relaxed"
                >
                    Tingkatkan produktivitas bisnis dan personal Kamu dengan template Google Sheets siap pakai. Desain estetik, fitur otomatis, dan <span className="font-semibold text-gray-900">tanpa biaya langganan bulanan</span>.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
                >
                    <Link 
                        href="/templates"
                        className="group relative h-14 px-8 text-lg rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-medium shadow-xl shadow-orange-500/25 transition-all duration-300 hover:shadow-orange-500/40 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg overflow-hidden inline-flex items-center gap-3"
                    >
                        {/* Shimmer effect */}
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                        <span className="relative z-10">Jelajahi Template</span>
                        <lord-icon
                            src="https://cdn.lordicon.com/whtfgdfm.json"
                            trigger="loop-on-hover"
                            colors="primary:#ffffff"
                            style={{ width: '24px', height: '24px' }}
                            className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </Link>
                    <Link 
                        href="#features"
                        className="group h-14 px-8 text-lg rounded-full border-2 border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 hover:-translate-y-1 active:translate-y-0 inline-flex items-center gap-2"
                    >
                        <span>Pelajari Lebih Lanjut</span>
                        <lord-icon
                            src="https://cdn.lordicon.com/kkvxgpti.json"
                            trigger="loop-on-hover"
                            colors="primary:#f97316"
                            style={{ width: '20px', height: '20px' }}
                        />
                    </Link>
                </motion.div>

                {/* Floating Hero Image */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.2 }}
                    className="relative mx-auto max-w-5xl mt-10"
                >
                    <div className="relative z-10 hover:scale-[1.02] transition-transform duration-500">
                        <img
                            src="/images/hero-image.png"
                            alt="Kumpulan Template RSQUARE"
                            className="w-full h-auto drop-shadow-2xl"
                        />
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 -z-10 bg-orange-500/20 blur-[100px] rounded-full transform scale-75"></div>

                    {/* Floating Elements */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-4 top-10 md:-right-12 md:top-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden sm:block z-20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <lord-icon
                                    src="https://cdn.lordicon.com/akqsdstj.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#16a34a"
                                    style={{ width: '28px', height: '28px' }}
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Fitur Pintar</p>
                                <p className="text-lg font-bold text-gray-900">Rumus Otomatis</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -left-4 bottom-10 md:-left-12 md:bottom-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden sm:block z-20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <lord-icon
                                    src="https://cdn.lordicon.com/yxyampao.json"
                                    trigger="loop"
                                    delay="2500"
                                    colors="primary:#2563eb"
                                    style={{ width: '28px', height: '28px' }}
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Visualisasi</p>
                                <p className="text-lg font-bold text-gray-900">Dashboard Rapi</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Background Gradient Orbs */}
            <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </section>
    )
}
