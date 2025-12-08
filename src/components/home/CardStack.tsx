'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { ShoppingCart, Check } from 'lucide-react'
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

    const handleCardClick = (slug: string) => {
        router.push(`/templates/${slug}`)
    }

    return (
        <div className="w-full">
            {/* Horizontal Scrollable Card Row */}
            <div 
                ref={containerRef} 
                className="flex justify-center items-end gap-4 px-4 py-8 overflow-x-auto scrollbar-hide"
                style={{ minHeight: '380px' }}
            >
                {templates.map((template, index) => {
                    // Subtle rotation for visual interest
                    const rotation = (index - (templates.length - 1) / 2) * 2

                    return (
                        <motion.div
                            key={template._id}
                            onClick={() => handleCardClick(template.slug)}
                            className="relative cursor-pointer select-none flex-shrink-0"
                            initial={{ 
                                opacity: 0, 
                                y: 60,
                                rotate: rotation + 10,
                                scale: 0.9
                            }}
                            animate={{
                                opacity: isInView ? 1 : 0,
                                y: isInView ? 0 : 60,
                                rotate: isInView ? rotation : rotation + 10,
                                scale: isInView ? 1 : 0.9,
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
                            style={{
                                width: '240px',
                                zIndex: index + 1,
                                touchAction: 'manipulation',
                            }}
                        >
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300">
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">
                                    {template.image ? (
                                        <Image
                                            src={template.image}
                                            alt={template.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-medium px-3 text-center">
                                            {template.title}
                                        </div>
                                    )}
                                    
                                    {template.isFeatured && (
                                        <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-[10px] px-1.5 py-0.5">
                                            Featured
                                        </Badge>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-3">
                                    <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider mb-1">
                                        {template.category}
                                    </p>
                                    <h3 className="font-bold text-sm text-gray-900 mb-1.5 line-clamp-2 leading-tight">
                                        {template.title}
                                    </h3>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-baseline gap-1">
                                            {template.discountPrice ? (
                                                <>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        Rp {template.discountPrice.toLocaleString('id-ID')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 line-through">
                                                        Rp {template.price.toLocaleString('id-ID')}
                                                    </span>
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
                                                isInCart(template._id)
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white'
                                            }`}
                                        >
                                            {isInCart(template._id) ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <ShoppingCart className="h-4 w-4" />
                                            )}
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
