'use client'

import { ClientLordIcon } from '@/components/ui/lordicon'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Testimonial {
    id: number
    name: string
    social_media: string | null
    social_media_url: string | null
    template_name: string | null
    rating: number
    likes: string
    productType?: string
    isCustomShowcase?: boolean
}

export function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)
    const [activeIndex, setActiveIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch('/api/testimonials')
            .then(res => res.json())
            .then(data => {
                if (data.testimonials) {
                    setTestimonials(data.testimonials)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return null
    }

    if (testimonials.length === 0) {
        return null
    }

    const getSocialUrl = (testimonial: Testimonial) => {
        // Use provided URL first
        if (testimonial.social_media_url) return testimonial.social_media_url

        // Fallback to generating URL from username
        const social = testimonial.social_media
        if (!social) return null
        const username = social.replace('@', '').trim()
        if (social.includes('twitter') || social.includes('x.com')) {
            return `https://twitter.com/${username}`
        }
        return `https://instagram.com/${username}`
    }

    const getCardStyle = (index: number) => {
        const diff = index - activeIndex
        const absDistance = Math.abs(diff)

        if (absDistance > 2) {
            return { opacity: 0, scale: 0.8, x: diff > 0 ? 300 : -300, zIndex: 0 }
        }

        return {
            opacity: absDistance === 0 ? 1 : absDistance === 1 ? 0.7 : 0.4,
            scale: 1 - absDistance * 0.08,
            x: diff * 280,
            zIndex: 10 - absDistance,
        }
    }

    const handlePrev = () => {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1))
    }

    const handleNext = () => {
        setActiveIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0))
    }

    return (
        <section className="py-16 md:py-20 relative">
            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
                    className="text-center mb-10"
                >
                    <motion.span 
                        className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-600 mb-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <ClientLordIcon
                            src="https://cdn.lordicon.com/mdgrhyca.json"
                            trigger="loop"
                            delay="2000"
                            colors="primary:#ea580c"
                            style={{ width: '18px', height: '18px' }}
                        />
                        Testimoni Pengguna
                    </motion.span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">
                        <motion.span
                            initial={{ opacity: 0, rotateY: 90 }}
                            whileInView={{ opacity: 1, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="inline-block"
                            style={{ transformOrigin: 'center' }}
                        >
                            Apa Kata{' '}
                        </motion.span>
                        <span className="relative inline-block">
                            <motion.span
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.5 }}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500"
                            >
                                Mereka?
                            </motion.span>
                        </span>
                    </h2>
                    <motion.p 
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        Dengarkan pengalaman dari pengguna template RSQUARE
                    </motion.p>
                </motion.div>

                {/* Testimonials Carousel */}
                <div className="relative h-[380px] md:h-[340px]" ref={containerRef}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {testimonials.map((testimonial, index) => {
                            const style = getCardStyle(index)
                            
                            // Theme configuration
                            const isCustom = testimonial.isCustomShowcase
                            const isWebApp = testimonial.productType === 'webapp'

                            const theme = {
                                cardBg: isCustom ? 'bg-slate-900 border-yellow-500/30' : isWebApp ? 'bg-blue-50/80 border-blue-200' : 'bg-white border-gray-200',
                                quoteBg: isCustom ? 'bg-slate-800' : isWebApp ? 'bg-blue-100' : 'bg-orange-100',
                                quoteIconColor: isCustom ? 'primary:#eab308' : isWebApp ? 'primary:#3b82f6' : 'primary:#f97316',
                                textQuote: isCustom ? 'text-slate-300' : 'text-gray-700',
                                textName: isCustom ? 'text-slate-100' : 'text-gray-900',
                                textRole: isCustom ? 'text-slate-400' : 'text-gray-500',
                                avatarBg: isCustom ? 'from-yellow-500 to-amber-600 shadow-yellow-900/50' : isWebApp ? 'from-blue-400 to-indigo-500 shadow-blue-200' : 'from-orange-400 to-amber-400 shadow-orange-200',
                                starActive: isCustom ? 'primary:#eab308' : 'primary:#facc15',
                                starInactive: isCustom ? 'primary:#334155' : 'primary:#e5e7eb',
                            }

                            return (
                                <motion.div
                                    key={testimonial.id}
                                    className="absolute w-[320px] md:w-[360px] cursor-pointer"
                                    initial={false}
                                    animate={style}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    onClick={() => setActiveIndex(index)}
                                >
                                    <div className={`rounded-2xl p-6 shadow-xl border hover:shadow-2xl transition-shadow relative overflow-hidden ${theme.cardBg}`}>
                                        {/* Quote Icon */}
                                        <div className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center ${theme.quoteBg}`}>
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/puvaffet.json"
                                                trigger="loop"
                                                delay="3000"
                                                colors={theme.quoteIconColor}
                                                style={{ width: '22px', height: '22px' }}
                                            />
                                        </div>

                                        {/* Rating */}
                                        <div className="flex gap-0.5 mb-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <ClientLordIcon
                                                    key={star}
                                                    src="https://cdn.lordicon.com/mdgrhyca.json"
                                                    trigger="hover"
                                                    colors={star <= testimonial.rating ? theme.starActive : theme.starInactive}
                                                    style={{ width: '22px', height: '22px' }}
                                                />
                                            ))}
                                        </div>

                                        {/* Content */}
                                        <p className={`mb-5 leading-relaxed line-clamp-4 min-h-[96px] ${theme.textQuote}`}>
                                            &ldquo;{testimonial.likes}&rdquo;
                                        </p>

                                        {/* Author */}
                                        <div className={`pt-4 border-t ${isCustom ? 'border-slate-800' : 'border-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-11 h-11 bg-gradient-to-br rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${theme.avatarBg}`}>
                                                    {testimonial.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-semibold ${theme.textName}`}>{testimonial.name || 'Pengguna'}</p>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {testimonial.template_name && (
                                                            <span className={`text-xs ${theme.textRole}`}>
                                                                {isCustom ? '★ Custom Showcase' : testimonial.template_name}
                                                            </span>
                                                        )}
                                                        {testimonial.social_media && (
                                                            <a
                                                                href={getSocialUrl(testimonial) || '#'}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white text-xs font-medium hover:shadow-md transition-shadow"
                                                            >
                                                                <ClientLordIcon
                                                                    src="https://cdn.lordicon.com/uvqnvwbl.json"
                                                                    trigger="hover"
                                                                    colors="primary:#ffffff"
                                                                    style={{ width: '12px', height: '12px' }}
                                                                />
                                                                {testimonial.social_media}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Navigation Arrows */}
                    {testimonials.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-orange-500 hover:shadow-xl transition-all"
                            >
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/vduvxizq.json"
                                    trigger="hover"
                                    colors="primary:#ea580c"
                                    style={{ width: '24px', height: '24px' }}
                                />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-orange-500 hover:shadow-xl transition-all"
                            >
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/vduvxizq.json"
                                    trigger="hover"
                                    colors="primary:#ea580c"
                                    style={{ width: '24px', height: '24px', transform: 'rotate(180deg)' }}
                                />
                            </button>
                        </>
                    )}

                    {/* Dots Indicator */}
                    {testimonials.length > 1 && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${index === activeIndex
                                            ? 'bg-orange-500 w-6'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-center mt-8"
                >
                    <Link
                        href="/feedback"
                        className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all overflow-hidden"
                    >
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <ClientLordIcon
                            src="https://cdn.lordicon.com/mdgrhyca.json"
                            trigger="loop"
                            colors="primary:#ffffff"
                            style={{ width: '22px', height: '22px' }}
                        />
                        <span className="relative z-10">Bagikan Pengalamanmu</span>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
