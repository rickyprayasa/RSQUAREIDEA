'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TemplatesList } from '@/components/templates/TemplatesList'

interface Template {
    _id: string
    title: string
    slug: string
    price: number
    discountPrice?: number
    image: string
    category: string
    isFeatured?: boolean
    isFree?: boolean
}

interface Category {
    name: string
    slug: string
    icon?: string
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/categories').then(res => res.json())
        ])
            .then(([productsData, categoriesData]) => {
                if (productsData.products) {
                    setTemplates(productsData.products.map((t: { id: number; title: string; slug: string; price: number; discountPrice?: number; image?: string; category: string; isFeatured?: boolean; isFree?: boolean }) => ({
                        _id: t.id.toString(),
                        title: t.title,
                        slug: t.slug,
                        price: t.price,
                        discountPrice: t.discountPrice,
                        image: t.image || '',
                        category: t.category,
                        isFeatured: t.isFeatured,
                        isFree: t.isFree,
                    })))
                }
                if (categoriesData.categories) {
                    setCategories(categoriesData.categories)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Floating Octagon */}
                <motion.div
                    className="absolute top-24 right-[8%] w-18 h-18 opacity-12"
                    animate={{ y: [0, -18, 0], rotate: [0, 45, 0] }}
                    transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                >
                    <svg viewBox="0 0 100 100" className="w-16 h-16 fill-orange-400">
                        <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" />
                    </svg>
                </motion.div>

                {/* Floating Blur Sphere */}
                <motion.div
                    className="absolute top-[35%] left-[6%] w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/25 to-orange-500/25 blur-xl"
                    animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />

                {/* Floating Rounded Square */}
                <motion.div
                    className="absolute bottom-[30%] right-[12%] w-14 h-14 opacity-15"
                    animate={{ y: [0, -22, 0], rotate: [0, 90, 180] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-400 rounded-lg" />
                </motion.div>

                {/* Floating Semi-circle */}
                <motion.div
                    className="absolute top-[60%] right-[5%] w-20 h-10 opacity-10"
                    animate={{ y: [0, 15, 0], rotate: [0, -30, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <div className="w-full h-full bg-amber-500 rounded-t-full" />
                </motion.div>

                {/* Floating Dots Pattern */}
                <motion.div
                    className="absolute bottom-[15%] left-[10%] w-16 h-16 opacity-10"
                    animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                >
                    <div className="grid grid-cols-3 gap-2">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-orange-400 rounded-full" />
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Hero Header */}
            <section className="relative py-16 md:py-20 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-600 mb-6">
                                <lord-icon
                                    src="https://cdn.lordicon.com/ghhwiltn.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#ea580c"
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Koleksi Lengkap
                            </span>
                        </motion.div>
                        <motion.h1
                            className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            Template Premium untuk{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                                Segala Kebutuhan
                            </span>
                        </motion.h1>
                        <motion.p
                            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Temukan template yang tepat untuk bisnis dan kehidupan personal Kamu. Semua template dilengkapi panduan lengkap.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Templates Section */}
            <section className="py-12">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <lord-icon
                                src="https://cdn.lordicon.com/xjovhxra.json"
                                trigger="loop"
                                colors="primary:#f97316"
                                style={{ width: '48px', height: '48px' }}
                            />
                            <p className="text-gray-500 mt-4">Memuat template...</p>
                        </div>
                    ) : templates.length === 0 ? (
                        <motion.div
                            className="text-center py-20"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <lord-icon
                                    src="https://cdn.lordicon.com/kkvxgpti.json"
                                    trigger="loop"
                                    colors="primary:#f97316"
                                    style={{ width: '48px', height: '48px' }}
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Template</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                Template sedang dalam proses persiapan. Segera hadir koleksi template premium untuk kebutuhan Kamu!
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
                        <TemplatesList
                            initialTemplates={templates}
                            categories={categories}
                        />
                    )}
                </div>
            </section>
        </main>
    )
}
