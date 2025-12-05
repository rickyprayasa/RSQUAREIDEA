'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
    const containerRef = useRef<HTMLDivElement>(null)

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

            {/* Zoom Modal - Portal to body */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    >
                        {/* Top controls */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                            <button
                                onClick={zoomOut}
                                className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-5 h-5 text-white" />
                            </button>
                            <span className="text-white text-sm min-w-[60px] text-center font-medium">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={zoomIn}
                                className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn className="w-5 h-5 text-white" />
                            </button>
                            <div className="w-px h-6 bg-white/30 mx-1" />
                            <button
                                onClick={resetZoom}
                                className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                                title="Reset Zoom"
                            >
                                <RotateCcw className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setIsZoomed(false)}
                            className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Navigation buttons for zoom modal */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                                    disabled={currentIndex === 0}
                                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ${
                                        currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); paginate(1); }}
                                    disabled={currentIndex === images.length - 1}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ${
                                        currentIndex === images.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </button>
                            </>
                        )}

                        {/* Zoomable image container */}
                        <div
                            ref={containerRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            className={`w-full h-full flex items-center justify-center overflow-hidden ${
                                scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
                            }`}
                            onClick={(e) => {
                                if (!isDragging && scale === 1) {
                                    setIsZoomed(false)
                                }
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="flex items-center justify-center"
                                style={{
                                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                                }}
                            >
                                {images[currentIndex] ? (
                                    <Image
                                        src={images[currentIndex]}
                                        alt={`${title} - Full Preview`}
                                        width={1920}
                                        height={1440}
                                        className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain select-none"
                                        draggable={false}
                                        unoptimized
                                        priority
                                    />
                                ) : (
                                    <div className="flex items-center justify-center text-white text-2xl">
                                        Preview {currentIndex + 1}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                        
                        {/* Bottom info */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
                            <div className="bg-black/50 backdrop-blur-sm text-white/70 text-xs px-3 py-1 rounded-full">
                                Scroll untuk zoom • Drag untuk geser
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">
                                {currentIndex + 1} / {images.length}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
