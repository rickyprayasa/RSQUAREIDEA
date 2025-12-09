'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Play, ExternalLink, Youtube, Store } from 'lucide-react'
import { ImageSlider } from './ImageSlider'
import { useCart } from '@/contexts/CartContext'
import { LordIcon } from '@/components/ui/lordicon'
import { trackProductClick, trackButtonClick } from '@/hooks/useAnalytics'

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
        videoTutorialUrl?: string
        rating?: number
        reviewCount?: number
        isCustomShowcase?: boolean
        serviceType?: string
    }
}

// Platform icons mapping with actual brand logos/icons
const platformConfig: Record<string, { bg: string, hoverBg: string, textColor: string, iconUrl: string }> = {
    'tokopedia': {
        bg: 'bg-[#42b549]',
        hoverBg: 'hover:bg-[#3aa142]',
        textColor: 'text-white',
        iconUrl: 'https://images.tokopedia.net/img/about/tokopedia-icon-green.png'
    },
    'shopee': {
        bg: 'bg-[#ee4d2d]',
        hoverBg: 'hover:bg-[#d9441f]',
        textColor: 'text-white',
        iconUrl: 'https://cf.shopee.co.id/file/9df78eab0d5b3a5a0a6e4f3f6a6a0c0c'
    },
    'bukalapak': {
        bg: 'bg-[#e31e52]',
        hoverBg: 'hover:bg-[#cc1a48]',
        textColor: 'text-white',
        iconUrl: ''
    },
    'lazada': {
        bg: 'bg-[#0f146d]',
        hoverBg: 'hover:bg-[#0d1259]',
        textColor: 'text-white',
        iconUrl: ''
    },
    'blibli': {
        bg: 'bg-[#0095da]',
        hoverBg: 'hover:bg-[#0085c4]',
        textColor: 'text-white',
        iconUrl: ''
    },
    'gumroad': {
        bg: 'bg-[#ff90e8]',
        hoverBg: 'hover:bg-[#ff7ae0]',
        textColor: 'text-gray-900',
        iconUrl: ''
    },
    'lynk': {
        bg: 'bg-[#6366f1]',
        hoverBg: 'hover:bg-[#4f46e5]',
        textColor: 'text-white',
        iconUrl: ''
    },
    'karyakarsa': {
        bg: 'bg-[#f97316]',
        hoverBg: 'hover:bg-[#ea580c]',
        textColor: 'text-white',
        iconUrl: ''
    },
    'default': {
        bg: 'bg-gray-800',
        hoverBg: 'hover:bg-gray-700',
        textColor: 'text-white',
        iconUrl: ''
    }
}

// SVG Icons for each platform
const _PlatformIcon = ({ name }: { name: string }) => {
    const key = name.toLowerCase()

    if (key.includes('tokopedia')) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
        )
    }

    if (key.includes('shopee')) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
        )
    }

    if (key.includes('bukalapak')) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" />
            </svg>
        )
    }

    if (key.includes('lazada')) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M4 4h16v2H4zm0 4h16v12H4zm2 2v8h12V10z" />
            </svg>
        )
    }

    if (key.includes('gumroad')) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
        )
    }

    if (key.includes('lynk')) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        )
    }

    if (key.includes('karyakarsa')) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        )
    }

    // Default store icon
    return <Store className="w-4 h-4" />
}

const getPlatformStyle = (name: string) => {
    const key = name.toLowerCase()
    for (const platform of Object.keys(platformConfig)) {
        if (key.includes(platform)) {
            return platformConfig[platform]
        }
    }
    return platformConfig.default
}

export function ProductDetail({ template }: ProductDetailProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })
    const router = useRouter()
    const { addItem } = useCart()
    const [videos, setVideos] = useState<VideoTutorial[]>([])
    const [activeVideo, setActiveVideo] = useState<VideoTutorial | null>(null)
    const [cartEnabled, setCartEnabled] = useState(true)

    useEffect(() => {
        // Track product view
        trackProductClick({
            productId: template._id,
            productSlug: template.slug,
            productTitle: template.title,
            clickType: 'view',
            value: template.discountPrice || template.price,
        })

        // If product has its own video tutorial URL, use it first
        if (template.videoTutorialUrl) {
            const productVideo: VideoTutorial = {
                id: -1,
                title: `Tutorial ${template.title}`,
                description: 'Video tutorial untuk produk ini',
                youtubeUrl: template.videoTutorialUrl,
            }
            setVideos([productVideo])
            setActiveVideo(productVideo)
        } else {
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
        }

        // Fetch cart settings
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) {
                    setCartEnabled(data.settings.cart_enabled !== 'false')
                }
            })
            .catch(console.error)
    }, [template._id, template.slug, template.title, template.discountPrice, template.price, template.videoTutorialUrl])

    const discountPercent = template.discountPrice
        ? Math.round((1 - template.discountPrice / template.price) * 100)
        : 0

    const previewImages = template.images && template.images.length > 0
        ? template.images
        : template.image
            ? [template.image]
            : []

    const handleBuyNow = () => {
        if (!cartEnabled) return

        // Track add to cart
        trackProductClick({
            productId: template._id,
            productSlug: template.slug,
            productTitle: template.title,
            clickType: 'add_to_cart',
            value: template.discountPrice || template.price,
        })

        // Track button click
        trackButtonClick('Beli Sekarang', 'Product Detail')

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
            {/* Background Layer with Grid and Floating Shapes */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                {/* Base white background */}
                <div className="absolute inset-0 bg-white" />
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Floating Shapes - Above Grid */}
                {/* Floating Hexagon */}
                <motion.div
                    className="absolute top-32 right-[12%] w-14 h-14 opacity-[0.12]"
                    animate={{ y: [0, -15, 0], rotate: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-orange-400">
                        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" />
                    </svg>
                </motion.div>

                {/* Floating Blur Circle */}
                <motion.div
                    className="absolute top-48 left-[8%] w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-2xl"
                    animate={{ y: [0, 25, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />

                {/* Floating Diamond */}
                <motion.div
                    className="absolute bottom-40 right-[8%] w-10 h-10 opacity-[0.12]"
                    animate={{ y: [0, 18, 0], rotate: [45, 45, 45], scale: [1, 1.1, 1] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 rounded-sm transform rotate-45" />
                </motion.div>

                {/* Floating Triangle */}
                <motion.div
                    className="absolute top-[55%] left-[5%] w-12 h-12 opacity-[0.10]"
                    animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-400">
                        <polygon points="50,10 90,80 10,80" />
                    </svg>
                </motion.div>

                {/* Floating Dots Pattern */}
                <motion.div
                    className="absolute bottom-[30%] left-[15%] w-16 h-16 opacity-[0.10]"
                    animate={{ y: [0, -12, 0], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                >
                    <svg viewBox="0 0 50 50" className="w-full h-full fill-orange-400">
                        <circle cx="10" cy="10" r="4" />
                        <circle cx="25" cy="10" r="4" />
                        <circle cx="40" cy="10" r="4" />
                        <circle cx="10" cy="25" r="4" />
                        <circle cx="25" cy="25" r="4" />
                        <circle cx="40" cy="25" r="4" />
                    </svg>
                </motion.div>

                {/* Floating Circle Shape */}
                <motion.div
                    className="absolute top-[40%] right-[5%] w-10 h-10 opacity-[0.12]"
                    animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-amber-500" />
                </motion.div>
            </div>

            {/* Hero Section */}
            <section className="relative py-8 md:py-12 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
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
                                {/* Only show rating if there are reviews */}
                                {(template.reviewCount ?? 0) > 0 && (
                                    <div className="flex items-center gap-0.5 text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                            <LordIcon
                                                key={i}
                                                src="https://cdn.lordicon.com/surjmvno.json"
                                                trigger="loop"
                                                size={18}
                                                colors={{ primary: i < Math.round(template.rating || 0) ? '#f59e0b' : '#e5e7eb' }}
                                            />
                                        ))}
                                        <span className="text-sm text-gray-600 ml-1">
                                            ({template.reviewCount} reviews)
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <motion.h1 
                                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight"
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ 
                                    duration: 0.8, 
                                    delay: 0.2, 
                                    type: "spring", 
                                    stiffness: 120,
                                    damping: 20
                                }}
                                whileHover={{ 
                                    scale: 1.01,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                {template.title}
                            </motion.h1>

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
                            <motion.p 
                                className="text-gray-600 text-lg leading-relaxed mb-6"
                                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{ duration: 0.7, delay: 0.4 }}
                            >
                                {template.description}
                            </motion.p>

                            {/* Action Buttons */}
                            {/* Custom Showcase Badge */}
                            {template.isCustomShowcase && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    Custom Project Showcase
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                {template.isCustomShowcase ? (
                                    <Link href={`/jasa-kustom?ref=${template.slug}`} className="flex-1">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="relative w-full h-14 rounded-xl font-semibold text-lg shadow-lg overflow-hidden group bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200/50"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg>
                                                Request Template Serupa
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </motion.button>
                                    </Link>
                                ) : template.isFree && template.downloadUrl ? (
                                    /* Free product - Direct download link, always active */
                                    <a href={template.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="relative w-full h-14 rounded-xl font-semibold text-lg shadow-lg overflow-hidden group bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-200/50 cursor-pointer"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                <LordIcon src="https://cdn.lordicon.com/ternnbni.json" trigger="loop" size={22} colors={{ primary: '#ffffff' }} />
                                                Download Gratis
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </motion.button>
                                    </a>
                                ) : (
                                    <motion.button
                                        onClick={handleBuyNow}
                                        disabled={!cartEnabled}
                                        whileHover={cartEnabled ? { scale: 1.02, y: -2 } : {}}
                                        whileTap={cartEnabled ? { scale: 0.98 } : {}}
                                        className={`relative flex-1 h-14 rounded-xl font-semibold text-lg shadow-lg overflow-hidden group ${cartEnabled
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200/50 cursor-pointer'
                                            : 'bg-gray-300 text-gray-500 shadow-none cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <LordIcon src="https://cdn.lordicon.com/medpcfcy.json" trigger="loop" size={22} colors={{ primary: cartEnabled ? '#ffffff' : '#9ca3af' }} />
                                            {cartEnabled
                                                ? (template.isFree ? 'Dapatkan Gratis' : 'Beli Sekarang')
                                                : 'Pembelian via Marketplace'
                                            }
                                        </span>
                                        {cartEnabled && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        )}
                                    </motion.button>
                                )}

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

                            {/* External Purchase Links - Redesigned with Platform Icons */}
                            {template.externalLinks && template.externalLinks.length > 0 && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <LordIcon src="https://cdn.lordicon.com/slkvcfos.json" trigger="hover" size={18} colors={{ primary: '#4b5563' }} />
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
                                                    <LordIcon src="https://cdn.lordicon.com/mfmkufkr.json" trigger="hover" size={18} colors={{ primary: '#ffffff' }} />
                                                    {link.name}
                                                    <LordIcon src="https://cdn.lordicon.com/whtfgdfm.json" trigger="hover" size={14} colors={{ primary: '#ffffff' }} />
                                                </a>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Trust Badges */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <LordIcon src="https://cdn.lordicon.com/zrkkrrpl.json" trigger="loop" size={20} colors={{ primary: '#22c55e' }} />
                                    <span>Garansi 7 Hari</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <LordIcon src="https://cdn.lordicon.com/vfczflna.json" trigger="loop" size={20} colors={{ primary: '#3b82f6' }} />
                                    <span>Akses Selamanya</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <LordIcon src="https://cdn.lordicon.com/yqzmiobz.json" trigger="loop" size={20} colors={{ primary: '#f97316' }} />
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
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
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
                                                    <LordIcon src="https://cdn.lordicon.com/egiwmiit.json" trigger="loop" size={16} colors={{ primary: '#16a34a' }} />
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
                                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md text-center hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <LordIcon src="https://cdn.lordicon.com/ternnbni.json" trigger="loop" size={28} colors={{ primary: '#2563eb' }} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Instant Download</h3>
                                    <p className="text-sm text-gray-500">Akses langsung setelah pembayaran</p>
                                </div>
                                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md text-center hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <LordIcon src="https://cdn.lordicon.com/qzwudxpy.json" trigger="loop" size={28} colors={{ primary: '#16a34a' }} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Garansi Uang Kembali</h3>
                                    <p className="text-sm text-gray-500">7 hari jika tidak puas</p>
                                </div>
                                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md text-center hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <LordIcon src="https://cdn.lordicon.com/yqzmiobz.json" trigger="loop" size={28} colors={{ primary: '#ea580c' }} />
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
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
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
                                                            className={`group text-left rounded-xl overflow-hidden transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${isActive
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
                                                                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${isActive ? 'bg-red-500/30' : 'bg-black/30 opacity-0 group-hover:opacity-100'
                                                                    }`}>
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-red-500' : 'bg-white/90'
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
                                                                <h4 className={`font-medium text-sm line-clamp-2 ${isActive ? 'text-red-600' : 'text-gray-700 group-hover:text-red-600'
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
                                                <LordIcon src="https://cdn.lordicon.com/aklfruoc.json" trigger="loop" size={18} colors={{ primary: '#ffffff' }} />
                                                Tonton di YouTube
                                                <LordIcon src="https://cdn.lordicon.com/whtfgdfm.json" trigger="loop" size={16} colors={{ primary: '#ffffff' }} />
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
                <div className="container mx-auto px-6 relative z-10">
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
                            {template.isFree && template.downloadUrl ? (
                                /* Free product - Direct download link, always active */
                                <a href={template.downloadUrl} target="_blank" rel="noopener noreferrer">
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative h-14 px-8 rounded-xl font-semibold text-lg shadow-lg overflow-hidden group bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-200/50 cursor-pointer"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <LordIcon src="https://cdn.lordicon.com/ternnbni.json" trigger="loop" size={22} colors={{ primary: '#ffffff' }} />
                                            Download Gratis
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </motion.button>
                                </a>
                            ) : (
                                <motion.button
                                    onClick={handleBuyNow}
                                    disabled={!cartEnabled}
                                    whileHover={cartEnabled ? { scale: 1.02, y: -2 } : {}}
                                    whileTap={cartEnabled ? { scale: 0.98 } : {}}
                                    className={`relative h-14 px-8 rounded-xl font-semibold text-lg shadow-lg overflow-hidden group ${cartEnabled
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200/50'
                                        : 'bg-gray-300 text-gray-500 shadow-none cursor-not-allowed'
                                        }`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <LordIcon src="https://cdn.lordicon.com/medpcfcy.json" trigger="loop" size={22} colors={{ primary: cartEnabled ? '#ffffff' : '#9ca3af' }} />
                                        {cartEnabled
                                            ? `Beli Sekarang - Rp ${(template.discountPrice || template.price).toLocaleString('id-ID')}`
                                            : 'Beli via Marketplace'
                                        }
                                    </span>
                                    {cartEnabled && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    )}
                                </motion.button>
                            )}
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
