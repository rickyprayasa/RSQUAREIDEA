'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CardStack } from '@/components/home/CardStack'

interface Template {
    _id: string
    title: string
    slug: string
    price: number
    discountPrice?: number
    image: string
    category: string
    isFeatured?: boolean
    downloadUrl?: string
    demoUrl?: string
}

interface TemplateSectionProps {
    title: string
    subtitle: string
    templates: Template[]
    viewAllLink: string
    emptyTitle?: string
    emptyDescription?: string
}

export function TemplateSection({ 
    title, 
    subtitle, 
    templates, 
    viewAllLink,
    emptyTitle = "Segera Hadir",
    emptyDescription = "Template sedang dalam proses persiapan. Nantikan koleksi template premium kami!"
}: TemplateSectionProps) {
    return (
        <section className="py-16 relative overflow-hidden">
            {/* Background with floating shapes */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
                
                {/* Floating Shapes */}
                <motion.div
                    className="absolute top-10 right-[10%] w-40 h-40 bg-orange-100/40 rounded-full blur-3xl"
                    animate={{
                        x: [0, 20, 0],
                        y: [0, -15, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-10 left-[5%] w-32 h-32 bg-amber-100/50 rounded-full blur-3xl"
                    animate={{
                        x: [0, -15, 0],
                        y: [0, 20, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                
                {/* Small floating squares */}
                <motion.div
                    className="absolute top-[20%] left-[15%] w-4 h-4 bg-orange-300/30 rounded"
                    animate={{
                        y: [0, -10, 0],
                        rotate: [0, 45, 0],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[30%] right-[20%] w-3 h-3 bg-amber-400/25 rounded-full"
                    animate={{
                        y: [0, 15, 0],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
            </div>

            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
                </div>

                {/* Content */}
                {templates.length === 0 ? (
                    <motion.div 
                        className="text-center py-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div 
                            className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                            animate={{ 
                                y: [0, -8, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <lord-icon
                                src="https://cdn.lordicon.com/ghhwiltn.json"
                                trigger="loop"
                                delay="1000"
                                colors="primary:#f97316,secondary:#fbbf24"
                                style={{ width: '48px', height: '48px' }}
                            />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{emptyTitle}</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            {emptyDescription}
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full text-orange-600 text-sm font-medium">
                            <lord-icon
                                src="https://cdn.lordicon.com/hvueufdo.json"
                                trigger="loop"
                                colors="primary:#ea580c"
                                style={{ width: '18px', height: '18px' }}
                            />
                            Coming Soon
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* Card Stack Layout */}
                        <CardStack templates={templates} />

                        {/* View All Button */}
                        <div className="text-center mt-6">
                            <Link 
                                href={viewAllLink}
                                className="group relative inline-flex items-center gap-2 h-11 px-8 border-2 border-gray-200 rounded-xl text-gray-700 font-medium overflow-hidden transition-all duration-300 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-orange-100/50 to-transparent" />
                                <span className="relative z-10">Lihat Semua Template</span>
                                <lord-icon
                                    src="https://cdn.lordicon.com/whtfgdfm.json"
                                    trigger="loop-on-hover"
                                    colors="primary:#ea580c"
                                    style={{ width: '20px', height: '20px' }}
                                    className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
