'use client'

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
        <section className="py-16 md:py-20 relative overflow-hidden">
            {/* Background with More Floating Shapes */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 via-white to-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Floating Blur Circles */}
                <motion.div
                    className="absolute top-10 right-[10%] w-40 h-40 bg-orange-100/40 rounded-full blur-3xl"
                    animate={{ x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-10 left-[5%] w-32 h-32 bg-amber-100/50 rounded-full blur-3xl"
                    animate={{ x: [0, -15, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />

                {/* Floating Star */}
                <motion.div
                    className="absolute top-[25%] left-[8%] w-12 h-12 opacity-12"
                    animate={{ y: [0, -18, 0], rotate: [0, 20, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <svg viewBox="0 0 50 50" className="w-full h-full fill-yellow-400">
                        <polygon points="25,2 32,18 50,18 36,29 41,47 25,37 9,47 14,29 0,18 18,18" />
                    </svg>
                </motion.div>

                {/* Floating Quote Symbol */}
                <motion.div
                    className="absolute bottom-[30%] right-[8%] w-16 h-12 opacity-10"
                    animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <svg viewBox="0 0 60 40" className="w-full h-full fill-orange-400">
                        <path d="M10,30 Q10,10 25,10 L25,15 Q15,15 15,25 L25,25 L25,35 L10,35 Z M35,30 Q35,10 50,10 L50,15 Q40,15 40,25 L50,25 L50,35 L35,35 Z" />
                    </svg>
                </motion.div>

                {/* Floating Heart */}
                <motion.div
                    className="absolute top-[60%] right-[15%] w-10 h-10 opacity-12"
                    animate={{ y: [0, -12, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                    <svg viewBox="0 0 50 50" className="w-full h-full fill-pink-400">
                        <path d="M25,45 L21,41 C10,31 3,25 3,17 C3,10 9,5 16,5 C20,5 24,7 25,10 C26,7 30,5 34,5 C41,5 47,10 47,17 C47,25 40,31 29,41 L25,45 Z" />
                    </svg>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-600 mb-4">
                        <lord-icon
                            src="https://cdn.lordicon.com/mdgrhyca.json"
                            trigger="loop"
                            delay="2000"
                            colors="primary:#ea580c"
                            style={{ width: '18px', height: '18px' }}
                        />
                        Testimoni Pengguna
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Apa Kata Mereka?
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Dengarkan pengalaman dari pengguna template RSQUARE
                    </p>
                </motion.div>

                {/* Testimonials Carousel */}
                <div className="relative h-[380px] md:h-[340px]" ref={containerRef}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {testimonials.map((testimonial, index) => {
                            const style = getCardStyle(index)

                            return (
                                <motion.div
                                    key={testimonial.id}
                                    className="absolute w-[320px] md:w-[360px] cursor-pointer"
                                    initial={false}
                                    animate={style}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    onClick={() => setActiveIndex(index)}
                                >
                                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow relative overflow-hidden">
                                        {/* Quote Icon */}
                                        <div className="absolute top-4 right-4 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                            <lord-icon
                                                src="https://cdn.lordicon.com/puvaffet.json"
                                                trigger="loop"
                                                delay="3000"
                                                colors="primary:#f97316"
                                                style={{ width: '22px', height: '22px' }}
                                            />
                                        </div>

                                        {/* Rating */}
                                        <div className="flex gap-0.5 mb-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <lord-icon
                                                    key={star}
                                                    src="https://cdn.lordicon.com/mdgrhyca.json"
                                                    trigger="hover"
                                                    colors={star <= testimonial.rating ? "primary:#facc15" : "primary:#e5e7eb"}
                                                    style={{ width: '22px', height: '22px' }}
                                                />
                                            ))}
                                        </div>

                                        {/* Content */}
                                        <p className="text-gray-700 mb-5 leading-relaxed line-clamp-4 min-h-[96px]">
                                            &ldquo;{testimonial.likes}&rdquo;
                                        </p>

                                        {/* Author */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-200">
                                                    {testimonial.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{testimonial.name || 'Pengguna'}</p>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {testimonial.template_name && (
                                                            <span className="text-xs text-gray-500">{testimonial.template_name}</span>
                                                        )}
                                                        {testimonial.social_media && (
                                                            <a
                                                                href={getSocialUrl(testimonial) || '#'}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white text-xs font-medium hover:shadow-md transition-shadow"
                                                            >
                                                                <lord-icon
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
                                <lord-icon
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
                                <lord-icon
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
                        <lord-icon
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
