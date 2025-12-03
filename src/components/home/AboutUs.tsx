'use client'

import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const highlights = [
    { text: '10,000+ Pengguna Aktif', iconSrc: 'https://cdn.lordicon.com/dxjqoygy.json' },
    { text: 'Support Bahasa Indonesia', iconSrc: 'https://cdn.lordicon.com/fdxqrdfe.json' },
    { text: 'Update Gratis Seumur Hidup', iconSrc: 'https://cdn.lordicon.com/qhkvfxpn.json' },
    { text: 'Komunitas Pengguna Solid', iconSrc: 'https://cdn.lordicon.com/bhfjfgqz.json' },
]

export function AboutUs() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

    return (
        <section ref={sectionRef} className="py-20 relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>
            <div className="container mx-auto px-6">
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
                            Tentang Kami
                        </motion.span>
                        
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
                            Kenapa Memilih{' '}
                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                                RSQUARE?
                            </span>
                        </h2>
                        
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            RSQUARE lahir dari keinginan untuk menyederhanakan pengelolaan data bagi UMKM dan profesional di Indonesia. Kami percaya bahwa produktivitas tidak harus mahal atau rumit.
                        </p>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Dengan menggabungkan kekuatan Google Sheets dan desain antarmuka yang intuitif, kami menciptakan alat bantu yang tidak hanya fungsional, tapi juga menyenangkan untuk digunakan.
                        </p>

                        <ul className="space-y-3">
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
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
