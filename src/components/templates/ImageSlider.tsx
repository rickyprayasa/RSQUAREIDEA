'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, ImageIcon } from 'lucide-react'

interface ImageSliderProps {
    images: string[]
    title: string
}

export function ImageSlider({ images, title }: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isZoomed, setIsZoomed] = useState(false)

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
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 aspect-[4/3] group shadow-sm border border-gray-200">
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
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {images[currentIndex] ? (
                            <Image
                                src={images[currentIndex]}
                                alt={`${title} - Preview ${currentIndex + 1}`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
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

            {/* Zoom Modal */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsZoomed(false)}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative w-auto h-auto max-w-[95vw] max-h-[90vh] flex items-center justify-center"
                        >
                            {images[currentIndex] ? (
                                <Image
                                    src={images[currentIndex]}
                                    alt={`${title} - Full Preview`}
                                    width={1920}
                                    height={1080}
                                    className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-2xl">
                                    Preview {currentIndex + 1}
                                </div>
                            )}
                        </motion.div>
                        
                        {/* Close hint */}
                        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                            Klik di mana saja untuk menutup
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
