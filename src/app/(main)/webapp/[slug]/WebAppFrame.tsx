'use client'

import { useState } from 'react'
import Link from 'next/link'
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
                                rsquareidea.my.id/webapp/{webapp.slug}
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
                            href={webapp.webappUrl}
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-white">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200"
                        >
                            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <p className="text-base font-semibold text-gray-800">{webapp.title}</p>
                            <p className="text-sm text-gray-500 mt-1">Memuat aplikasi web...</p>
                        </motion.div>
                    </div>
                )}

                <iframe
                    src={webapp.webappUrl}
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
