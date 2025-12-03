'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, useInView } from 'framer-motion'
import { Check, ArrowRight, ShoppingCart, Star, Shield, Clock, Download, Play, ExternalLink, Youtube, Store, ShoppingBag } from 'lucide-react'
import { ImageSlider } from './ImageSlider'
import { useCart } from '@/contexts/CartContext'

interface ExternalLink {
    name: string
    url: string
    icon?: string
}

interface VideoTutorial {
    id: number
    title: string
    description?: string
    youtubeUrl: string
    thumbnailUrl?: string
    duration?: string
}

interface ProductDetailProps {
    template: {
        _id: string
        title: string
        slug: string
        description: string
        price: number
        discountPrice?: number
        image: string
        images?: string[]
        category: string
        features?: string[]
        demoUrl?: string
        purchaseUrl?: string
        externalLinks?: ExternalLink[]
        isFree?: boolean
        isFeatured?: boolean
        downloadUrl?: string
    }
}

// Platform icons/colors mapping
const platformStyles: Record<string, { bg: string, hoverBg: string, icon: string, textColor: string }> = {
    'tokopedia': { bg: 'bg-green-500', hoverBg: 'hover:bg-green-600', icon: '🟢', textColor: 'text-white' },
    'shopee': { bg: 'bg-orange-500', hoverBg: 'hover:bg-orange-600', icon: '🛒', textColor: 'text-white' },
    'bukalapak': { bg: 'bg-pink-500', hoverBg: 'hover:bg-pink-600', icon: '🛍️', textColor: 'text-white' },
    'lazada': { bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-700', icon: '🔵', textColor: 'text-white' },
    'blibli': { bg: 'bg-blue-500', hoverBg: 'hover:bg-blue-600', icon: '💙', textColor: 'text-white' },
    'gumroad': { bg: 'bg-pink-600', hoverBg: 'hover:bg-pink-700', icon: '💗', textColor: 'text-white' },
    'default': { bg: 'bg-gray-700', hoverBg: 'hover:bg-gray-800', icon: '🔗', textColor: 'text-white' },
}

const getPlatformStyle = (name: string) => {
    const key = name.toLowerCase()
    for (const platform of Object.keys(platformStyles)) {
        if (key.includes(platform)) {
            return platformStyles[platform]
        }
    }
    return platformStyles.default
}

export function ProductDetail({ template }: ProductDetailProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })
    const router = useRouter()
    const { addItem } = useCart()
    const [videos, setVideos] = useState<VideoTutorial[]>([])
    const [activeVideo, setActiveVideo] = useState<VideoTutorial | null>(null)

    useEffect(() => {
        // Fetch videos related to this product or general videos
        fetch(`/api/videos?productId=${template._id}`)
            .then(res => res.json())
            .then(data => {
                if (data.videos && data.videos.length > 0) {
                    setVideos(data.videos)
                    setActiveVideo(data.videos[0])
                }
            })
            .catch(console.error)
    }, [template._id])

    const discountPercent = template.discountPrice 
        ? Math.round((1 - template.discountPrice / template.price) * 100) 
        : 0

    const previewImages = template.images && template.images.length > 0 
        ? template.images 
        : template.image 
            ? [template.image] 
            : []

    const handleBuyNow = () => {
        addItem({
            id: template._id,
            title: template.title,
            slug: template.slug,
            price: template.price,
            discountPrice: template.discountPrice,
            category: template.category,
            image: template.image,
            downloadUrl: template.downloadUrl,
            demoUrl: template.demoUrl,
        })
        router.push('/checkout')
    }

    const getYoutubeId = (url: string | undefined | null) => {
        if (!url) return null
        const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&?\s]{11})/)
        return match ? match[1] : null
    }

    return (
        <div ref={ref} className="min-h-screen relative">
            {/* Global Grid Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>

            {/* Hero Section */}
            <section className="relative py-8 md:py-12 overflow-hidden">
                <div className="container mx-auto px-6">
                    {/* Breadcrumb */}
                    <motion.nav
                        initial={{ opacity: 0, y: -10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-2 text-sm text-gray-500 mb-8"
                    >
                        <Link href="/" className="hover:text-gray-900 transition-colors">Beranda</Link>
                        <span>/</span>
                        <Link href="/templates" className="hover:text-gray-900 transition-colors">Templates</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{template.title}</span>
                    </motion.nav>

                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                        {/* Image Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6 }}
                        >
                            <ImageSlider images={previewImages} title={template.title} />
                        </motion.div>

                        {/* Content Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="lg:sticky lg:top-24"
                        >
                            {/* Category & Rating */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
                                    {template.category}
                                </span>
                                <div className="flex items-center gap-1 text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-1">(48 reviews)</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                {template.title}
                            </h1>

                            {/* Price */}
                            <div className="flex items-center gap-4 mb-6">
                                {template.isFree ? (
                                    <span className="text-4xl font-bold text-green-600">Gratis</span>
                                ) : template.discountPrice ? (
                                    <>
                                        <span className="text-4xl font-bold text-gray-900">
                                            Rp {template.discountPrice.toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-xl text-gray-400 line-through">
                                            Rp {template.price.toLocaleString('id-ID')}
                                        </span>
                                        <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-lg">
                                            -{discountPercent}%
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-4xl font-bold text-gray-900">
                                        Rp {template.price.toLocaleString('id-ID')}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                {template.description}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <motion.button
                                    onClick={handleBuyNow}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative flex-1 h-14 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg shadow-lg shadow-orange-200/50 overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <ShoppingCart className="w-5 h-5" />
                                        {template.isFree ? 'Dapatkan Gratis' : 'Beli Sekarang'}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </motion.button>
                                
                                {template.demoUrl && template.demoUrl !== '#' && template.demoUrl !== '' ? (
                                    <a href={template.demoUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="relative w-full h-14 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-lg overflow-hidden group hover:border-orange-300 transition-colors duration-300"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-orange-600 transition-colors duration-300">
                                                <Play className="w-5 h-5" />
                                                Lihat Demo
                                            </span>
                                            <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </motion.button>
                                    </a>
                                ) : (
                                    <motion.button
                                        disabled
                                        className="relative flex-1 h-14 rounded-xl border-2 border-gray-200 text-gray-400 font-semibold text-lg overflow-hidden cursor-not-allowed"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <Play className="w-5 h-5" />
                                            Demo Belum Tersedia
                                        </span>
                                    </motion.button>
                                )}
                            </div>

                            {/* External Purchase Links - Redesigned */}
                            {template.externalLinks && template.externalLinks.length > 0 && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Store className="w-4 h-4 text-gray-600" />
                                        <p className="text-sm font-medium text-gray-700">Tersedia juga di:</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {template.externalLinks.map((link, index) => {
                                            const style = getPlatformStyle(link.name)
                                            return (
                                                <a
                                                    key={index}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-2 px-4 py-2.5 ${style.bg} ${style.hoverBg} ${style.textColor} rounded-lg text-sm font-semibold transition-all duration-150 shadow-md hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 active:scale-95`}
                                                >
                                                    <span className="text-base">{style.icon}</span>
                                                    {link.name}
                                                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                                                </a>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Trust Badges */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    <span>Garansi 7 Hari</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Download className="w-4 h-4 text-blue-500" />
                                    <span>Akses Selamanya</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <span>Update Gratis</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            {template.features && template.features.length > 0 && (
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                                    <h2 className="text-xl font-bold text-white">Fitur Unggulan</h2>
                                </div>
                                <div className="p-6 md:p-8">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {template.features.map((feature: string, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                                transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                                </div>
                                                <span className="text-gray-700">{feature}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Additional Info Cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="grid sm:grid-cols-3 gap-4 mt-6"
                            >
                                <div className="bg-white rounded-xl p-5 border border-gray-100 text-center hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <Download className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Instant Download</h3>
                                    <p className="text-sm text-gray-500">Akses langsung setelah pembayaran</p>
                                </div>
                                <div className="bg-white rounded-xl p-5 border border-gray-100 text-center hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <Shield className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Garansi Uang Kembali</h3>
                                    <p className="text-sm text-gray-500">7 hari jika tidak puas</p>
                                </div>
                                <div className="bg-white rounded-xl p-5 border border-gray-100 text-center hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <Clock className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Update Selamanya</h3>
                                    <p className="text-sm text-gray-500">Termasuk semua update mendatang</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            {/* Video Tutorials Section - Light Theme */}
            {videos.length > 0 && (
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                {/* Section Header */}
                                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Youtube className="w-5 h-5 text-white" />
                                        <h2 className="text-xl font-bold text-white">Video Tutorial</h2>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8">
                                    {/* Main Video Player */}
                                    {activeVideo && (
                                        <div className="mb-6">
                                            <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo.youtubeUrl)}?rel=0`}
                                                    className="w-full h-full"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{activeVideo.title}</h3>
                                                {activeVideo.description && (
                                                    <p className="text-gray-600 text-sm whitespace-pre-line text-left">{activeVideo.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Video Playlist */}
                                    {videos.length > 1 && (
                                        <div className="border-t border-gray-100 pt-6">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                                Video Lainnya ({videos.length} video)
                                            </h4>
                                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {videos.map((video) => {
                                                    const youtubeId = getYoutubeId(video.youtubeUrl)
                                                    const thumbnailUrl = video.thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : '')
                                                    const isActive = activeVideo?.id === video.id
                                                    
                                                    return (
                                                        <button
                                                            key={video.id}
                                                            onClick={() => setActiveVideo(video)}
                                                            className={`group text-left rounded-xl overflow-hidden transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${
                                                                isActive 
                                                                    ? 'ring-2 ring-red-500 bg-red-50' 
                                                                    : 'bg-gray-50 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            <div className="relative aspect-video">
                                                                {thumbnailUrl ? (
                                                                    <Image
                                                                        src={thumbnailUrl}
                                                                        alt={video.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                                                        <Youtube className="w-10 h-10 text-gray-400" />
                                                                    </div>
                                                                )}
                                                                {/* Play Overlay */}
                                                                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${
                                                                    isActive ? 'bg-red-500/30' : 'bg-black/30 opacity-0 group-hover:opacity-100'
                                                                }`}>
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                        isActive ? 'bg-red-500' : 'bg-white/90'
                                                                    }`}>
                                                                        <Play className={`w-4 h-4 ml-0.5 ${isActive ? 'text-white' : 'text-gray-900'}`} />
                                                                    </div>
                                                                </div>
                                                                {/* Duration Badge */}
                                                                {video.duration && (
                                                                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
                                                                        {video.duration}
                                                                    </div>
                                                                )}
                                                                {/* Now Playing Badge */}
                                                                {isActive && (
                                                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 rounded text-xs text-white font-medium flex items-center gap-1">
                                                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                                        Diputar
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="p-3">
                                                                <h4 className={`font-medium text-sm line-clamp-2 ${
                                                                    isActive ? 'text-red-600' : 'text-gray-700 group-hover:text-red-600'
                                                                } transition-colors duration-150`}>
                                                                    {video.title}
                                                                </h4>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Single Video CTA */}
                                    {videos.length === 1 && (
                                        <div className="text-center mt-4 pt-4 border-t border-gray-100">
                                            <a
                                                href={videos[0].youtubeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-150"
                                            >
                                                <Youtube className="w-4 h-4" />
                                                Tonton di YouTube
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-12">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="max-w-2xl mx-auto text-center"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            Siap Meningkatkan Produktivitas?
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Dapatkan template ini sekarang dan mulai kelola data dengan lebih efisien.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                onClick={handleBuyNow}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative h-14 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg shadow-lg shadow-orange-200/50 overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    {template.isFree 
                                        ? 'Dapatkan Gratis' 
                                        : `Beli Sekarang - Rp ${(template.discountPrice || template.price).toLocaleString('id-ID')}`
                                    }
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </motion.button>
                            <Link href="/templates">
                                <motion.span
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative h-14 px-8 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-lg flex items-center justify-center gap-2 overflow-hidden group hover:border-orange-300 transition-colors duration-300"
                                >
                                    <span className="relative z-10 flex items-center gap-2 group-hover:text-orange-600 transition-colors duration-300">
                                        Lihat Template Lainnya
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                    </span>
                                    <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </motion.span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
