'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { X, ShoppingCart, Check, Zap } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(containerRef, { once: true, margin: "-100px" })
    const { addItem, isInCart } = useCart()
    const router = useRouter()
    
    const selectedTemplate = templates.find(t => t._id === selectedId)

    const handleAddToCart = (template: Template, e?: React.MouseEvent) => {
        e?.stopPropagation()
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

    const handleBuyNow = (template: Template) => {
        // Add to cart first if not already
        if (!isInCart(template._id)) {
            handleAddToCart(template)
        }
        // Close modal and redirect to checkout
        setSelectedId(null)
        router.push('/checkout')
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
                    const isModalOpen = selectedId === template._id
                    
                    // Subtle rotation for visual interest
                    const rotation = (index - (templates.length - 1) / 2) * 2

                    return (
                        <motion.div
                            key={template._id}
                            layoutId={`card-${template._id}`}
                            onClick={(e) => {
                                if (!isModalOpen) {
                                    setSelectedId(template._id)
                                }
                            }}
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

            {/* Enlarged Card Modal */}
            <AnimatePresence>
                {selectedId && selectedTemplate && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Enlarged Card */}
                        <div 
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" 
                            onClick={() => setSelectedId(null)}
                        >
                            <motion.div
                                layoutId={`card-${selectedId}`}
                                className="relative w-full max-w-md my-8"
                                initial={false}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                    {/* Close Button */}
                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="h-4 w-4 text-gray-700" />
                                    </button>

                                    {/* Image */}
                                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200">
                                        {selectedTemplate.image ? (
                                            <Image
                                                src={selectedTemplate.image}
                                                alt={selectedTemplate.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg font-medium">
                                                {selectedTemplate.title}
                                            </div>
                                        )}
                                        {selectedTemplate.isFeatured && (
                                            <Badge className="absolute top-3 left-3 bg-orange-500 hover:bg-orange-600">
                                                Featured
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
                                            {selectedTemplate.category}
                                        </p>
                                        <h2 className="font-bold text-xl text-gray-900 mb-3">
                                            {selectedTemplate.title}
                                        </h2>
                                        
                                        <div className="flex items-baseline gap-2 mb-4">
                                            {selectedTemplate.discountPrice ? (
                                                <>
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        Rp {selectedTemplate.discountPrice.toLocaleString('id-ID')}
                                                    </span>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        Rp {selectedTemplate.price.toLocaleString('id-ID')}
                                                    </span>
                                                    <Badge variant="destructive" className="text-xs">
                                                        -{Math.round((1 - selectedTemplate.discountPrice / selectedTemplate.price) * 100)}%
                                                    </Badge>
                                                </>
                                            ) : (
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {selectedTemplate.price === 0 ? 'Gratis' : `Rp ${selectedTemplate.price.toLocaleString('id-ID')}`}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 mb-5">
                                            Template ini dirancang khusus untuk membantu Anda meningkatkan produktivitas dan efisiensi dalam pekerjaan sehari-hari.
                                        </p>

                                        <div className="flex flex-col gap-2">
                                            {/* Buy Now Button */}
                                            <Button 
                                                onClick={() => handleBuyNow(selectedTemplate)}
                                                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                            >
                                                <Zap className="h-4 w-4 mr-2" />
                                                Beli Sekarang
                                            </Button>
                                            
                                            {/* Add to Cart Button */}
                                            <Button 
                                                variant="outline"
                                                onClick={() => handleAddToCart(selectedTemplate)}
                                                disabled={isInCart(selectedTemplate._id)}
                                                className={isInCart(selectedTemplate._id) ? 'bg-green-50 border-green-500 text-green-600' : ''}
                                            >
                                                {isInCart(selectedTemplate._id) ? (
                                                    <>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Sudah di Keranjang
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                                        Masukkan ke Keranjang
                                                    </>
                                                )}
                                            </Button>

                                            {/* View Details Link */}
                                            <Button asChild variant="ghost" size="sm" className="text-gray-600">
                                                <Link href={`/templates/${selectedTemplate.slug}`}>
                                                    Lihat Detail Lengkap
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
