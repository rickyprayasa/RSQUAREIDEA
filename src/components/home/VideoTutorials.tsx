'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

interface VideoTutorial {
    id: number
    title: string
    description: string | null
    youtubeUrl: string
    thumbnailUrl: string | null
    duration: string | null
    order: number
    isActive: boolean
}

interface VideoSettings {
    video_tutorial_title?: string
    isActive?: string
    youtube_channel_url?: string
}

export function VideoTutorials() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
    const [videos, setVideos] = useState<VideoTutorial[]>([])
    const [settings, setSettings] = useState<VideoSettings>({})
    const [loading, setLoading] = useState(true)
    const [activeVideo, setActiveVideo] = useState<VideoTutorial | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        Promise.all([
            fetch('/api/videos').then(res => res.json()),
            fetch('/api/settings').then(res => res.json())
        ])
            .then(([videosData, settingsData]) => {
                if (videosData.videos) setVideos(videosData.videos)
                if (videosData.settings) setSettings(prev => ({ ...prev, ...videosData.settings }))
                if (settingsData.settings) setSettings(prev => ({ ...prev, ...settingsData.settings }))
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const getYouTubeId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)
        return match ? match[1] : null
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % videos.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length)
    }

    if (settings.isActive === 'false' || (!loading && videos.length === 0)) {
        return null
    }

    const currentVideo = videos[currentIndex]
    const youtubeChannelUrl = settings.youtube_channel_url || 'https://youtube.com/@rsquareidea'

    return (
        <>
            <section ref={sectionRef} className="py-16 md:py-20 overflow-hidden relative">
                {/* Grid Background with Floating Shapes */}
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />

                    {/* Floating Play Button Shape */}
                    <motion.div
                        className="absolute top-20 right-[8%] w-14 h-14 opacity-12"
                        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <svg viewBox="0 0 50 50" className="w-full h-full fill-red-400">
                            <polygon points="15,10 40,25 15,40" />
                        </svg>
                    </motion.div>

                    {/* Floating Blur Circle */}
                    <motion.div
                        className="absolute top-[30%] left-[5%] w-28 h-28 rounded-full bg-gradient-to-br from-red-400/15 to-orange-500/15 blur-2xl"
                        animate={{ y: [0, 25, 0], scale: [1, 1.15, 1] }}
                        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />

                    {/* Floating Rounded Rectangle */}
                    <motion.div
                        className="absolute bottom-[25%] right-[10%] w-16 h-10 opacity-10"
                        animate={{ y: [0, 18, 0], rotate: [0, -8, 0] }}
                        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    >
                        <div className="w-full h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-xl" />
                    </motion.div>

                    {/* Floating Circle */}
                    <motion.div
                        className="absolute bottom-[40%] left-[12%] w-8 h-8 opacity-15"
                        animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    >
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
                    </motion.div>
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-4">
                            <lord-icon
                                src="https://cdn.lordicon.com/aklfruoc.json"
                                trigger="loop"
                                delay="2000"
                                colors="primary:#dc2626"
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span className="text-sm font-medium text-red-600">Video Tutorial</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                            Pelajari Cara Penggunaan Template
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto flex items-center justify-center gap-2">
                            <lord-icon
                                src="https://cdn.lordicon.com/hvueufdo.json"
                                trigger="loop"
                                delay="3000"
                                colors="primary:#f59e0b"
                                style={{ width: '20px', height: '20px' }}
                            />
                            Tonton video panduan lengkap untuk memaksimalkan penggunaan template
                        </p>
                    </motion.div>

                    {/* Video Carousel */}
                    {loading ? (
                        <div className="max-w-3xl mx-auto">
                            <div className="aspect-video bg-gray-200 rounded-2xl animate-pulse" />
                        </div>
                    ) : (
                        <motion.div
                            className="max-w-4xl mx-auto"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="relative">
                                {/* Navigation Arrows - Left */}
                                {videos.length > 1 && (
                                    <button
                                        onClick={prevSlide}
                                        className="group absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-14 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-110"
                                    >
                                        <lord-icon
                                            src="https://cdn.lordicon.com/zmkotitn.json"
                                            trigger="hover"
                                            colors="primary:#f97316"
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                    </button>
                                )}

                                {/* Video Card */}
                                <div className="relative">
                                    <AnimatePresence mode="wait">
                                        {currentVideo && (
                                            <motion.div
                                                key={currentVideo.id}
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -50 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <button
                                                    onClick={() => setActiveVideo(currentVideo)}
                                                    className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden group focus:outline-none focus:ring-4 focus:ring-orange-500/50 shadow-2xl"
                                                >
                                                    {/* Thumbnail */}
                                                    {(() => {
                                                        const videoId = getYouTubeId(currentVideo.youtubeUrl)
                                                        const thumbnailUrl = currentVideo.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null)
                                                        return thumbnailUrl && (
                                                            <img
                                                                src={thumbnailUrl}
                                                                alt={currentVideo.title}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement
                                                                    if (videoId && target.src.includes('maxresdefault')) {
                                                                        target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                                                    }
                                                                }}
                                                            />
                                                        )
                                                    })()}

                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                                    {/* Play Button */}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                                                            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                                                <lord-icon
                                                                    src="https://cdn.lordicon.com/becebamh.json"
                                                                    trigger="loop-on-hover"
                                                                    colors="primary:#dc2626"
                                                                    style={{ width: '40px', height: '40px' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Duration Badge */}
                                                    {currentVideo.duration && (
                                                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-sm font-medium text-white">
                                                            {currentVideo.duration}
                                                        </div>
                                                    )}

                                                    {/* Video Title */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                                        <h3 className="text-white text-lg md:text-xl font-semibold line-clamp-2 text-left">
                                                            {currentVideo.title}
                                                        </h3>
                                                        {currentVideo.description && (
                                                            <p className="text-white/70 text-sm mt-2 line-clamp-1 text-left">
                                                                {currentVideo.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Navigation Arrows - Right */}
                                {videos.length > 1 && (
                                    <button
                                        onClick={nextSlide}
                                        className="group absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-14 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-110"
                                    >
                                        <lord-icon
                                            src="https://cdn.lordicon.com/whtfgdfm.json"
                                            trigger="hover"
                                            colors="primary:#f97316"
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                    </button>
                                )}
                            </div>

                            {/* Dots Indicator */}
                            {videos.length > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    {videos.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentIndex(index)}
                                            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${index === currentIndex
                                                ? 'bg-orange-500 w-8'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Video Counter */}
                            {videos.length > 1 && (
                                <p className="text-center text-sm text-gray-500 mt-3">
                                    Video {currentIndex + 1} dari {videos.length}
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* YouTube Channel Button */}
                    <motion.div
                        className="text-center mt-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <p className="text-gray-600 mb-4">
                            Ingin tips dan trik seputar Google Sheets lainnya?
                        </p>
                        <a
                            href={youtubeChannelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-3 px-6 py-3 bg-red-600 text-white font-medium rounded-xl overflow-hidden transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:shadow-red-300/50 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <lord-icon
                                src="https://cdn.lordicon.com/aklfruoc.json"
                                trigger="loop-on-hover"
                                colors="primary:#ffffff"
                                style={{ width: '24px', height: '24px' }}
                            />
                            <span className="relative z-10">Kunjungi Channel YouTube</span>
                            <lord-icon
                                src="https://cdn.lordicon.com/ercyvufy.json"
                                trigger="loop-on-hover"
                                colors="primary:#ffffff"
                                style={{ width: '20px', height: '20px' }}
                            />
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Video Modal */}
            <AnimatePresence>
                {activeVideo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90"
                            onClick={() => setActiveVideo(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-5xl"
                        >
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
                            >
                                <lord-icon
                                    src="https://cdn.lordicon.com/nqtddedc.json"
                                    trigger="hover"
                                    colors="primary:#ffffff"
                                    style={{ width: '28px', height: '28px' }}
                                />
                            </button>

                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.youtubeUrl)}?autoplay=1&rel=0`}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>

                            <div className="mt-4 text-center">
                                <h3 className="text-white text-lg font-semibold">
                                    {activeVideo.title}
                                </h3>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
