'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, ImageIcon, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface ImageSliderProps {
    images: string[]
    title: string
}

export function ImageSlider({ images, title }: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isZoomed, setIsZoomed] = useState(false)
    
    // Zoom and pan state
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [mounted, setMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // For portal
    useEffect(() => {
        setMounted(true)
    }, [])

    const MIN_SCALE = 0.5
    const MAX_SCALE = 5
    const ZOOM_STEP = 0.3

    // Reset zoom when changing image or closing modal
    const resetZoom = useCallback(() => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
    }, [])

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isZoomed) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
            resetZoom()
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isZoomed, resetZoom])

    // Reset zoom when changing slides
    useEffect(() => {
        resetZoom()
    }, [currentIndex, resetZoom])

    // Handle mouse wheel zoom with native event listener (to allow preventDefault)
    useEffect(() => {
        const container = containerRef.current
        if (!container || !isZoomed) return

        const handleWheelNative = (e: WheelEvent) => {
            e.preventDefault()
            e.stopPropagation()
            
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
            setScale(prev => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)))
        }

        container.addEventListener('wheel', handleWheelNative, { passive: false })
        return () => {
            container.removeEventListener('wheel', handleWheelNative)
        }
    }, [isZoomed])

    // Handle mouse down for drag
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale > 1) {
            e.preventDefault()
            setIsDragging(true)
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
        }
    }, [scale, position])

    // Handle mouse move for drag
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            })
        }
    }, [isDragging, dragStart, scale])

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    // Zoom controls
    const zoomIn = useCallback(() => {
        setScale(prev => Math.min(MAX_SCALE, prev + ZOOM_STEP))
    }, [])

    const zoomOut = useCallback(() => {
        setScale(prev => Math.max(MIN_SCALE, prev - ZOOM_STEP))
    }, [])

    // Handle click on backdrop to close
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget && scale === 1) {
            setIsZoomed(false)
        }
    }, [scale])

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    }

    const [[page, direction], setPage] = useState([0, 0])

    const paginate = (newDirection: number) => {
        const newIndex = currentIndex + newDirection
        if (newIndex >= 0 && newIndex < images.length) {
            setPage([page + newDirection, newDirection])
            setCurrentIndex(newIndex)
        }
    }

    const goToSlide = (index: number) => {
        const newDirection = index > currentIndex ? 1 : -1
        setPage([index, newDirection])
        setCurrentIndex(index)
    }

    // Handle keyboard ESC to close modal and arrow keys for navigation
    useEffect(() => {
        if (!isZoomed) return
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsZoomed(false)
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                const newIndex = currentIndex - 1
                setPage([newIndex, -1])
                setCurrentIndex(newIndex)
            } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
                const newIndex = currentIndex + 1
                setPage([newIndex, 1])
                setCurrentIndex(newIndex)
            } else if (e.key === '+' || e.key === '=') {
                setScale(prev => Math.min(MAX_SCALE, prev + ZOOM_STEP))
            } else if (e.key === '-') {
                setScale(prev => Math.max(MIN_SCALE, prev - ZOOM_STEP))
            } else if (e.key === '0') {
                setScale(1)
                setPosition({ x: 0, y: 0 })
            }
        }
        
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isZoomed, currentIndex, images.length])

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 group shadow-sm border border-gray-200" style={{ minHeight: '300px', maxHeight: '70vh' }}>
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="flex items-center justify-center w-full"
                        style={{ minHeight: '300px', maxHeight: '70vh' }}
                    >
                        {images[currentIndex] ? (
                            <Image
                                src={images[currentIndex]}
                                alt={`${title} - Preview ${currentIndex + 1}`}
                                width={1200}
                                height={900}
                                className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                                unoptimized
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 py-20">
                                <ImageIcon className="w-12 h-12 mb-2 stroke-[1.5]" />
                                <span className="text-sm font-medium">Preview {currentIndex + 1}</span>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => paginate(-1)}
                            disabled={currentIndex === 0}
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200 ${
                                currentIndex === 0 
                                    ? 'opacity-30 cursor-not-allowed' 
                                    : 'opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110'
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            onClick={() => paginate(1)}
                            disabled={currentIndex === images.length - 1}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200 ${
                                currentIndex === images.length - 1 
                                    ? 'opacity-30 cursor-not-allowed' 
                                    : 'opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110'
                            }`}
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    </>
                )}

                {/* Zoom Button */}
                <button
                    onClick={() => setIsZoomed(true)}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110"
                >
                    <Maximize2 className="w-4 h-4 text-gray-700" />
                </button>

                {/* Slide Counter */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                    {images.map((image, index) => (
                        <motion.button
                            key={index}
                            onClick={() => goToSlide(index)}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative aspect-[4/3] rounded-xl overflow-hidden transition-all duration-200 ${
                                index === currentIndex 
                                    ? 'ring-2 ring-orange-500 ring-offset-2 shadow-md' 
                                    : 'ring-1 ring-gray-200 hover:ring-orange-300 hover:shadow-sm'
                            }`}
                        >
                            {image ? (
                                <Image
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center text-gray-400">
                                    <ImageIcon className="w-6 h-6 mb-1 stroke-[1.5]" />
                                    <span className="text-xs font-medium">{index + 1}</span>
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Zoom Modal - Using Portal */}
            {mounted && isZoomed && createPortal(
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999]"
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(15, 23, 42, 0.95) 100%)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    {/* Decorative gradient orbs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
                    </div>

                    {/* Top controls */}
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none"
                        style={{ zIndex: 100 }}
                    >
                        <div 
                            className="flex items-center gap-1 rounded-2xl px-2 py-2 shadow-2xl pointer-events-auto"
                            style={{ 
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95"
                                title="Zoom Out (-)"
                            >
                                <ZoomOut className="w-5 h-5 text-white/90" />
                            </button>
                            
                            {/* Zoom slider visual */}
                            <div className="flex items-center gap-2 px-3">
                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                                        style={{ width: `${((scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100}%` }}
                                        transition={{ duration: 0.15 }}
                                    />
                                </div>
                                <span className="text-white/90 text-sm min-w-[50px] text-center font-medium tabular-nums">
                                    {Math.round(scale * 100)}%
                                </span>
                            </div>
                            
                            <button
                                onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95"
                                title="Zoom In (+)"
                            >
                                <ZoomIn className="w-5 h-5 text-white/90" />
                            </button>
                            
                            <div className="w-px h-7 bg-white/10 mx-1" />
                        
                            <button
                                onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95"
                                title="Reset"
                            >
                                <RotateCcw className="w-5 h-5 text-white/90" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Close button */}
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                        onClick={() => setIsZoomed(false)}
                        className="absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-95 shadow-2xl group"
                        style={{ 
                            zIndex: 100, 
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <X className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" />
                    </motion.button>

                    {/* Navigation buttons */}
                    {images.length > 1 && (
                        <>
                            <motion.button
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                                disabled={currentIndex === 0}
                                className="absolute left-6 top-1/2 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-2xl group"
                                style={{ 
                                    transform: 'translateY(-50%)', 
                                    zIndex: 100, 
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <ChevronLeft className="w-6 h-6 text-white/90 group-hover:text-white transition-colors" />
                            </motion.button>
                            <motion.button
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                onClick={(e) => { e.stopPropagation(); paginate(1); }}
                                disabled={currentIndex === images.length - 1}
                                className="absolute right-6 top-1/2 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-2xl group"
                                style={{ 
                                    transform: 'translateY(-50%)', 
                                    zIndex: 100, 
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <ChevronRight className="w-6 h-6 text-white/90 group-hover:text-white transition-colors" />
                            </motion.button>
                        </>
                    )}

                    {/* Zoomable image container */}
                    <div
                        ref={containerRef}
                        onClick={handleBackdropClick}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="w-full h-full flex items-center justify-center overflow-hidden"
                        style={{ 
                            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
                        }}
                    >
                        <div
                            className="flex items-center justify-center select-none"
                            style={{
                                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                            }}
                        >
                            {images[currentIndex] ? (
                                <div 
                                    className="relative rounded-2xl overflow-hidden shadow-2xl"
                                    style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Image
                                        src={images[currentIndex]}
                                        alt={`${title} - Full Preview`}
                                        width={1920}
                                        height={1440}
                                        className="object-contain select-none"
                                        style={{ maxWidth: '90vw', maxHeight: '80vh', width: 'auto', height: 'auto' }}
                                        draggable={false}
                                        unoptimized
                                        priority
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center text-white/60 text-2xl">
                                    Preview {currentIndex + 1}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Bottom info */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none"
                        style={{ zIndex: 100 }}
                    >
                        {/* Thumbnail strip for multiple images */}
                        {images.length > 1 && (
                            <div 
                                className="flex items-center gap-2 p-2 rounded-2xl pointer-events-auto"
                                style={{ 
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                                        className={`relative w-12 h-9 rounded-lg overflow-hidden transition-all duration-200 ${
                                            idx === currentIndex 
                                                ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-slate-900 scale-110' 
                                                : 'opacity-50 hover:opacity-100 hover:scale-105'
                                        }`}
                                    >
                                        {img ? (
                                            <Image
                                                src={img}
                                                alt={`Thumb ${idx + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-white/20 flex items-center justify-center text-white/60 text-xs">
                                                {idx + 1}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        <div 
                            className="text-white/50 text-xs px-4 py-2 rounded-full"
                            style={{ 
                                background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 100%)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            Klik di luar gambar atau tekan ESC untuk tutup • Scroll/+- untuk zoom • Arrow keys untuk navigasi
                        </div>
                    </motion.div>
                </motion.div>,
                document.body
            )}
        </div>
    )
}
