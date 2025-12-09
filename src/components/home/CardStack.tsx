'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ShoppingCart, Check, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'

interface Template {
    _id: string
    title: string
    slug: string
    price: number
    discountPrice?: number
    image: string
    category: string
    isFeatured?: boolean
    downloadUrl?: string
    demoUrl?: string
}

interface CardStackProps {
    templates: Template[]
}

export function CardStack({ templates }: CardStackProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(containerRef, { once: true, margin: "-100px" })
    const { addItem, isInCart } = useCart()
    const router = useRouter()
    const [cardOrder, setCardOrder] = useState<number[]>(templates.map((_, i) => i))
    const [isAnimating, setIsAnimating] = useState(false)
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleAddToCart = (template: Template, e: React.MouseEvent) => {
        e.stopPropagation()
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
    }

    const handleViewDetail = (templateIndex: number, e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/templates/${templates[templateIndex].slug}`)
    }

    const handleCardClick = (slug: string) => {
        router.push(`/templates/${slug}`)
    }

    const handleMobileCardClick = (stackIndex: number) => {
        if (isAnimating || templates.length <= 1) return
        
        if (stackIndex === 0) {
            // Front card: first tap shows hover, second tap cycles
            if (hoveredCard === 0) {
                // Already showing hover, cycle to next card
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
                }, 300)
            } else {
                // First tap: show hover overlay
                setHoveredCard(0)
            }
            return
        }
        
        // Back card clicked: bring it to front
        setHoveredCard(null)
        setIsAnimating(true)
        setTimeout(() => {
            setCardOrder(prev => {
                const newOrder = [...prev]
                const clickedTemplateIndex = visibleCards[stackIndex]
                const pos = newOrder.indexOf(clickedTemplateIndex)
                if (pos > 0) {
                    newOrder.splice(pos, 1)
                    newOrder.unshift(clickedTemplateIndex)
                }
                return newOrder
            })
            setIsAnimating(false)
        }, 300)
    }

    const visibleCards = cardOrder.slice(0, Math.min(4, templates.length))
    const CARD_HEIGHT = 320
    const STACK_OFFSET = 70

    // Desktop: Horizontal layout
    if (!isMobile) {
        return (
            <div className="w-full" ref={containerRef}>
                <div className="flex justify-center items-end gap-4 px-4 py-8 overflow-x-auto scrollbar-hide">
                    {templates.map((template, index) => {
                        const rotation = (index - (templates.length - 1) / 2) * 2
                        return (
                            <motion.div
                                key={template._id}
                                onClick={() => handleCardClick(template.slug)}
                                className="relative cursor-pointer select-none flex-shrink-0"
                                initial={{ opacity: 0, y: 60, rotate: rotation + 10 }}
                                animate={{
                                    opacity: isInView ? 1 : 0,
                                    y: isInView ? 0 : 60,
                                    rotate: isInView ? rotation : rotation + 10,
                                }}
                                whileHover={{
                                    y: -20,
                                    scale: 1.05,
                                    rotate: 0,
                                    zIndex: 50,
                                    transition: { type: "spring", stiffness: 400, damping: 25 }
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 25,
                                    delay: isInView ? index * 0.1 : 0,
                                }}
                                style={{ width: '240px', zIndex: index + 1 }}
                            >
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300">
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">
                                        {template.image ? (
                                            <Image src={template.image} alt={template.title} fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">{template.title}</div>
                                        )}
                                        {template.isFeatured && (
                                            <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-[10px] px-1.5 py-0.5">Featured</Badge>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider mb-1">{template.category}</p>
                                        <h3 className="font-bold text-sm text-gray-900 mb-1.5 line-clamp-2 leading-tight">{template.title}</h3>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-baseline gap-1">
                                                {template.discountPrice ? (
                                                    <>
                                                        <span className="text-sm font-bold text-gray-900">Rp {template.discountPrice.toLocaleString('id-ID')}</span>
                                                        <span className="text-[10px] text-gray-500 line-through">Rp {template.price.toLocaleString('id-ID')}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {template.price === 0 ? 'Gratis' : `Rp ${template.price.toLocaleString('id-ID')}`}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => handleAddToCart(template, e)}
                                                className={`p-1.5 rounded-lg transition-colors ${
                                                    isInCart(template._id) ? 'bg-green-500 text-white' : 'bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white'
                                                }`}
                                            >
                                                {isInCart(template._id) ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                                            </button>
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

    // Mobile: Vertical stack layout - back cards show their TOP (image) above the front card
    return (
        <div className="w-full" ref={containerRef}>
            <div className="flex flex-col items-center justify-center py-6">
                <div 
                    className="relative"
                    style={{ 
                        width: '300px', 
                        height: `${CARD_HEIGHT + (STACK_OFFSET * (visibleCards.length - 1))}px`,
                    }}
                >
                    {/* Clickable areas for back cards - positioned at top */}
                    {visibleCards.slice(1).map((templateIndex, idx) => {
                        const stackIndex = idx + 1
                        const topPosition = (visibleCards.length - 1 - stackIndex) * STACK_OFFSET
                        return (
                            <div
                                key={`hit-${templateIndex}`}
                                className="absolute left-0 right-0 cursor-pointer active:bg-orange-500/10 transition-colors rounded-t-2xl"
                                style={{ 
                                    top: topPosition,
                                    height: STACK_OFFSET,
                                    zIndex: 100 + stackIndex
                                }}
                                onClick={() => handleMobileCardClick(stackIndex)}
                            />
                        )
                    })}

                    <AnimatePresence mode="popLayout">
                        {visibleCards.map((templateIndex, stackIndex) => {
                            const template = templates[templateIndex]
                            const isFront = stackIndex === 0
                            const bottomOffset = stackIndex * STACK_OFFSET

                            return (
                                <motion.div
                                    key={template._id}
                                    className={`absolute left-0 right-0 ${isFront ? 'cursor-pointer' : ''}`}
                                    style={{ bottom: 0, zIndex: visibleCards.length - stackIndex }}
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: -bottomOffset, opacity: 1, scale: isFront ? 1 : 0.97 - (stackIndex * 0.01) }}
                                    exit={{ y: 300, opacity: 0, transition: { duration: 0.3, ease: "easeOut" } }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30, delay: isInView ? stackIndex * 0.08 : 0 }}
                                    onClick={isFront ? () => handleMobileCardClick(stackIndex) : undefined}
                                >
                                    <div 
                                        className={`bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                                            isFront ? 'border-orange-400 shadow-[0_8px_30px_rgb(251,146,60,0.3)]' : 'border-gray-300 shadow-lg hover:border-orange-300 hover:shadow-xl'
                                        }`}
                                        style={{ height: CARD_HEIGHT }}
                                    >
                                        <div className="relative h-[170px] overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">
                                            {template.image ? (
                                                <Image src={template.image} alt={template.title} fill className="object-cover" priority={isFront} />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium px-4 text-center">{template.title}</div>
                                            )}
                                            {template.isFeatured && (
                                                <Badge className="absolute top-3 right-3 bg-orange-500 hover:bg-orange-600 text-xs px-2 py-1">Featured</Badge>
                                            )}
                                            <AnimatePresence>
                                                {hoveredCard === stackIndex && isFront && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute inset-0 bg-black/40 flex items-center justify-center"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setHoveredCard(null)
                                                        }}
                                                    >
                                                        <motion.button
                                                            initial={{ scale: 0.8, y: 20 }}
                                                            animate={{ scale: 1, y: 0 }}
                                                            exit={{ scale: 0.8, y: 20 }}
                                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                            onClick={(e) => handleViewDetail(templateIndex, e)}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-xl shadow-lg active:bg-orange-500 active:text-white transition-colors"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Lihat Template
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">{template.category}</p>
                                            <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 leading-tight">{template.title}</h3>
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-baseline gap-1.5">
                                                    {template.discountPrice ? (
                                                        <>
                                                            <span className="text-base font-bold text-gray-900">Rp {template.discountPrice.toLocaleString('id-ID')}</span>
                                                            <span className="text-[10px] text-gray-500 line-through">Rp {template.price.toLocaleString('id-ID')}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-base font-bold text-gray-900">
                                                            {template.price === 0 ? 'Gratis' : `Rp ${template.price.toLocaleString('id-ID')}`}
                                                        </span>
                                                    )}
                                                </div>
                                                {isFront && (
                                                    <button
                                                        onClick={(e) => handleAddToCart(template, e)}
                                                        className={`p-2 rounded-xl transition-colors ${
                                                            isInCart(template._id) ? 'bg-green-500 text-white' : 'bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white'
                                                        }`}
                                                    >
                                                        {isInCart(template._id) ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 mt-6">
                    {templates.map((_, index) => (
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
                                    }, 300)
                                }
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                cardOrder[0] === index ? 'bg-orange-500 w-6' : 'bg-gray-300 w-2 hover:bg-orange-300'
                            }`}
                        />
                    ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">Pilih kartu untuk melihat template</p>
            </div>
        </div>
    )
}
