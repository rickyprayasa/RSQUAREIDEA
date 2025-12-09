'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CardStack } from '@/components/home/CardStack'
import { ClientLordIcon } from '@/components/ui/lordicon'

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
        <section className="py-16 relative">
            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                            duration: 0.8, 
                            type: "spring", 
                            stiffness: 120,
                            damping: 20 
                        }}
                        whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.2 }
                        }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
                    >
                        {title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                    >
                        {subtitle}
                    </motion.p>
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
                            <ClientLordIcon
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
                            <ClientLordIcon
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
                                <ClientLordIcon
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
