'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Maximize2, Minimize2, Monitor, ShoppingCart } from 'lucide-react'

interface WebApp {
    id: number
    title: string
    slug: string
    description: string
    webappUrl: string
    demoUrl: string
    image: string
    category: string
}

interface WebAppFrameProps {
    webapp: WebApp
}

export function WebAppFrame({ webapp }: WebAppFrameProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const searchParams = useSearchParams()

    // Build iframe URL: append browser query params to the GAS URL
    const iframeUrl = useMemo(() => {
        const queryString = searchParams.toString()
        if (!queryString) return webapp.webappUrl
        // If the webapp URL already has query params, append with &, otherwise with ?
        const separator = webapp.webappUrl.includes('?') ? '&' : '?'
        return `${webapp.webappUrl}${separator}${queryString}`
    }, [webapp.webappUrl, searchParams])

    return (
        <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
            {/* Top Navigation Bar */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 flex-shrink-0"
            >
                <div className="flex items-center justify-between px-4 py-2.5">
                    {/* Left: Back + Title */}
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            href={`/templates/${webapp.slug}`}
                            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors flex-shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Kembali</span>
                        </Link>

                        <div className="h-5 w-px bg-gray-600 flex-shrink-0" />

                        {/* Browser-like URL bar */}
                        <div className="flex items-center gap-2 bg-gray-700/60 rounded-lg px-3 py-1.5 min-w-0 flex-1 max-w-xl">
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            </div>
                            <Monitor className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-300 truncate font-mono">
                                rsquareidea.my.id/webapp/{webapp.slug}{searchParams.toString() ? `?${searchParams.toString()}` : ''}
                            </span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                        <Link
                            href={`/templates/${webapp.slug}`}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Beli Produk
                        </Link>
                        <a
                            href={iframeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="Buka di Tab Baru"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* iframe Container */}
            <div className="flex-1 relative bg-gray-100">
                {/* Loading Overlay */}
                {!isLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 overflow-hidden">
                        {/* Background animated blobs */}
                        <div className="absolute inset-0 pointer-events-none">
                            <motion.div
                                animate={{ 
                                    x: [0, 30, -20, 0], 
                                    y: [0, -30, 20, 0],
                                    scale: [1, 1.2, 0.9, 1]
                                }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl"
                            />
                            <motion.div
                                animate={{ 
                                    x: [0, -20, 30, 0], 
                                    y: [0, 20, -30, 0],
                                    scale: [1, 0.9, 1.2, 1]
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-200/15 rounded-full blur-3xl"
                            />
                        </div>

                        {/* Logo with loading animation */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="relative mb-8 w-24 h-24 flex items-center justify-center"
                        >
                            {/* Spinning ring around logo */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0"
                            >
                                <svg viewBox="0 0 96 96" className="w-full h-full">
                                    <defs>
                                        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#f97316" stopOpacity="1" />
                                            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="48" cy="48" r="44" fill="none" stroke="url(#ringGrad)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="200" strokeDashoffset="60" />
                                </svg>
                            </motion.div>

                            {/* Logo */}
                            <motion.img
                                src="/images/rsquare-logo.png"
                                alt="RSQUARE"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="w-14 h-14 object-contain drop-shadow-md"
                            />
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-center mb-6"
                        >
                            <p className="text-lg font-bold text-gray-800">{webapp.title}</p>
                            <p className="text-sm text-gray-400 mt-1">Memuat aplikasi web</p>
                        </motion.div>

                        {/* Animated progress bar */}
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0.8 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.4 }}
                            className="w-48 h-1.5 bg-gray-200/80 rounded-full overflow-hidden"
                        >
                            <motion.div
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="w-1/2 h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full"
                            />
                        </motion.div>

                        {/* Animated dots */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center gap-1.5 mt-6"
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ 
                                        y: [0, -6, 0],
                                        opacity: [0.3, 1, 0.3]
                                    }}
                                    transition={{ 
                                        duration: 0.8, 
                                        repeat: Infinity, 
                                        delay: i * 0.15,
                                        ease: "easeInOut"
                                    }}
                                    className="w-1.5 h-1.5 rounded-full bg-orange-400"
                                />
                            ))}
                        </motion.div>
                    </div>
                )}

                <iframe
                    src={iframeUrl}
                    className={`w-full h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    style={{ border: 'none', minHeight: isFullscreen ? 'calc(100vh - 52px)' : 'calc(100vh - 116px)' }}
                    title={`${webapp.title} - Live Demo`}
                    onLoad={() => setIsLoaded(true)}
                    allow="clipboard-write"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
            </div>

            {/* Bottom Status Bar - Only when not fullscreen */}
            {!isFullscreen && (
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className={`w-2 h-2 rounded-full ${isLoaded ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
                        {isLoaded ? 'Live Demo Aktif' : 'Memuat...'}
                        <span className="text-gray-300">•</span>
                        <span>{webapp.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/templates/${webapp.slug}`}
                            className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors"
                        >
                            Lihat Detail Produk →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
