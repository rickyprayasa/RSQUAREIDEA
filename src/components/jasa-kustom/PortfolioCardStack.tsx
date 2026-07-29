'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Sparkles, Eye, ArrowRight, UserCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface PortfolioItem {
    id: number
    title: string
    slug: string
    description: string
    image: string
    category: string
    features?: string[]
    serviceType?: string
    clientName?: string | null
}

interface PortfolioCardStackProps {
    projects: PortfolioItem[]
}

export function PortfolioCardStack({ projects }: PortfolioCardStackProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(containerRef, { once: true, margin: "-80px" })
    const router = useRouter()

    const [cardOrder, setCardOrder] = useState<number[]>(projects.map((_, i) => i))
    const [isAnimating, setIsAnimating] = useState(false)
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setCardOrder(projects.map((_, i) => i))
    }, [projects])

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleCardClick = (slug: string) => {
        router.push(`/templates/${slug}`)
    }

    const handleMobileCardClick = (stackIndex: number) => {
        if (isAnimating || projects.length <= 1) return

        if (stackIndex === 0) {
            // Front card tap: cycle to next card
            setHoveredCard(null)
            setIsAnimating(true)
            setTimeout(() => {
                setCardOrder(prev => {
                    const newOrder = [...prev]
                    const first = newOrder.shift()!
                    newOrder.push(first)
                    return newOrder
                })
                setIsAnimating(false)
            }, 180)
            return
        }

        // Back card clicked: bring it to front
        setHoveredCard(null)
        setIsAnimating(true)
        setTimeout(() => {
            setCardOrder(prev => {
                const newOrder = [...prev]
                const clickedProjectIndex = visibleCards[stackIndex]
                const pos = newOrder.indexOf(clickedProjectIndex)
                if (pos > 0) {
                    newOrder.splice(pos, 1)
                    newOrder.unshift(clickedProjectIndex)
                }
                return newOrder
            })
            setIsAnimating(false)
        }, 180)
    }

    if (!projects || projects.length === 0) return null

    const visibleCards = cardOrder.slice(0, Math.min(4, projects.length))
    const CARD_HEIGHT = 390
    const STACK_OFFSET = 55

    // Desktop Layout: Elegant horizontal stacked fan
    if (!isMobile) {
        return (
            <div className="w-full" ref={containerRef}>
                <div className="flex justify-center items-stretch gap-6 px-4 py-6 overflow-x-auto scrollbar-hide">
                    {projects.slice(0, 6).map((project, index) => {
                        const rotation = (index - (Math.min(6, projects.length) - 1) / 2) * 2
                        return (
                            <motion.div
                                key={project.id}
                                onClick={() => handleCardClick(project.slug)}
                                className="relative cursor-pointer select-none flex-shrink-0 group transform-gpu"
                                initial={{ opacity: 0, y: 30, rotate: rotation }}
                                animate={{
                                    opacity: isInView ? 1 : 0,
                                    y: isInView ? 0 : 30,
                                    rotate: isInView ? rotation : rotation,
                                }}
                                whileHover={{
                                    y: -12,
                                    scale: 1.03,
                                    rotate: 0,
                                    zIndex: 50,
                                }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                    delay: isInView ? index * 0.05 : 0,
                                }}
                                style={{ width: '280px', zIndex: index + 1 }}
                            >
                                <div className="h-full bg-white rounded-2xl shadow-md overflow-hidden border-2 border-gray-200 group-hover:border-orange-400 group-hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
                                    <div>
                                        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100">
                                            {project.image ? (
                                                <Image
                                                    src={project.image}
                                                    alt={project.title}
                                                    fill
                                                    className="object-cover group-hover:scale-108 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-semibold px-4 text-center">
                                                    {project.title}
                                                </div>
                                            )}
                                            <Badge className="absolute top-2.5 right-2.5 bg-purple-600 hover:bg-purple-700 text-[10px] px-2 py-0.5 font-bold shadow-xs flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5" />
                                                Custom
                                            </Badge>
                                        </div>

                                        <div className="p-4">
                                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                                                {project.category || 'Portfolio'}
                                            </p>
                                            <h3 className="font-bold text-base text-gray-900 mb-1.5 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                                {project.title}
                                            </h3>
                                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                {project.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-4 pb-4 pt-1">
                                        {project.clientName && (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-[11px] font-semibold rounded-lg border border-purple-100 w-full truncate">
                                                <UserCheck className="w-3 h-3 text-purple-600 flex-shrink-0" />
                                                <span className="truncate">Requested by {project.clientName}</span>
                                            </div>
                                        )}
                                        <div className="mt-3 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                                            <span>Lihat Detail Project</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Mobile Layout: High performance vertical card stack with tap-to-cycle & hit areas
    return (
        <div className="w-full" ref={containerRef}>
            <div className="flex flex-col items-center justify-center py-4">
                <div
                    className="relative transform-gpu will-change-transform"
                    style={{
                        width: '310px',
                        height: `${CARD_HEIGHT + (STACK_OFFSET * (visibleCards.length - 1))}px`,
                    }}
                >
                    {/* Clickable hit areas for back cards positioned at top */}
                    {visibleCards.slice(1).map((projectIndex, idx) => {
                        const stackIndex = idx + 1
                        const topPosition = (visibleCards.length - 1 - stackIndex) * STACK_OFFSET
                        return (
                            <div
                                key={`hit-${projectIndex}`}
                                className="absolute left-0 right-0 cursor-pointer active:bg-orange-500/10 transition-colors rounded-t-2xl z-[100]"
                                style={{
                                    top: topPosition,
                                    height: STACK_OFFSET,
                                }}
                                onClick={() => handleMobileCardClick(stackIndex)}
                            />
                        )
                    })}

                    <AnimatePresence>
                        {visibleCards.map((projectIndex, stackIndex) => {
                            const project = projects[projectIndex]
                            const isFront = stackIndex === 0
                            const bottomOffset = stackIndex * STACK_OFFSET

                            return (
                                <motion.div
                                    key={project.id}
                                    className={`absolute left-0 right-0 transform-gpu will-change-transform ${isFront ? 'cursor-pointer' : ''}`}
                                    style={{ bottom: 0, zIndex: visibleCards.length - stackIndex }}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{
                                        y: -bottomOffset,
                                        opacity: 1,
                                        scale: isFront ? 1 : 0.96 - (stackIndex * 0.02)
                                    }}
                                    exit={{ y: 150, opacity: 0 }}
                                    transition={{ duration: 0.22, ease: "easeOut" }}
                                    onClick={isFront ? () => handleMobileCardClick(stackIndex) : undefined}
                                >
                                    <div
                                        className={`bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 flex flex-col justify-between ${
                                            isFront
                                                ? 'border-orange-400 shadow-[0_10px_30px_rgba(249,115,22,0.25)]'
                                                : 'border-gray-300 shadow-md'
                                        }`}
                                        style={{ height: CARD_HEIGHT }}
                                    >
                                        <div>
                                            <div className="relative h-[145px] overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100">
                                                {project.image ? (
                                                    <Image
                                                        src={project.image}
                                                        alt={project.title}
                                                        fill
                                                        className="object-cover"
                                                        priority={isFront}
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-medium px-4 text-center">
                                                        {project.title}
                                                    </div>
                                                )}

                                                <Badge className="absolute top-2.5 right-2.5 bg-purple-600 text-white text-[11px] px-2 py-0.5 shadow-xs flex items-center gap-1 font-bold">
                                                    <Sparkles className="w-2.5 h-2.5" />
                                                    Custom Project
                                                </Badge>
                                            </div>

                                            <div className="p-3.5">
                                                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">
                                                    {project.category || 'Portfolio'}
                                                </p>
                                                <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1">
                                                    {project.title}
                                                </h3>
                                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                    {project.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="px-3.5 pb-3.5">
                                            {project.clientName && (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-[11px] font-semibold rounded-lg border border-purple-100 w-full truncate mb-2">
                                                    <UserCheck className="w-3 h-3 text-purple-600 flex-shrink-0" />
                                                    <span className="truncate">Requested by {project.clientName}</span>
                                                </div>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleCardClick(project.slug)
                                                }}
                                                className="w-full py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-orange-200 shadow-xs"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Lihat Portfolio Project
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {/* Navigation Dots */}
                <div className="flex items-center gap-2 mt-5">
                    {projects.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (cardOrder[0] !== index && !isAnimating) {
                                    setIsAnimating(true)
                                    setTimeout(() => {
                                        setCardOrder(prev => {
                                            const newOrder = [...prev]
                                            const pos = newOrder.indexOf(index)
                                            if (pos > 0) {
                                                newOrder.splice(pos, 1)
                                                newOrder.unshift(index)
                                            }
                                            return newOrder
                                        })
                                        setIsAnimating(false)
                                    }, 250)
                                }
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                cardOrder[0] === index ? 'bg-orange-500 w-6' : 'bg-gray-300 w-2 hover:bg-orange-300'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
                <p className="text-xs font-medium text-gray-400 mt-2">Ketuk kartu untuk beralih ke project berikutnya</p>
            </div>
        </div>
    )
}
