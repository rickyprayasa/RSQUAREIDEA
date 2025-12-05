'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, Star, ArrowRight } from 'lucide-react'
import { trackProductClick } from '@/hooks/useAnalytics'

interface TemplateCardProps {
    id?: string
    title: string
    slug: string
    price: number
    discountPrice?: number
    image: string
    category: string
    isFeatured?: boolean
    compact?: boolean
}

export function TemplateCard({
    id,
    title,
    slug,
    price,
    discountPrice,
    image,
    category,
    isFeatured,
    compact = false,
}: TemplateCardProps) {
    const discountPercent = discountPrice ? Math.round((1 - discountPrice / price) * 100) : 0

    const handleClick = () => {
        trackProductClick({
            productId: id || slug,
            productSlug: slug,
            productTitle: title,
            clickType: 'click',
            value: discountPrice || price,
        })
    }

    if (compact) {
        return (
            <Link href={`/templates/${slug}`} onClick={handleClick}>
                <motion.div
                    whileHover={{ y: -4 }}
                    className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300"
                >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100">
                        {image ? (
                            <Image
                                src={image}
                                alt={title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">
                                {title}
                            </div>
                        )}
                        {isFeatured && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                            </div>
                        )}
                    </div>
                    <div className="p-3">
                        <p className="text-[10px] text-orange-500 font-semibold uppercase mb-1">{category}</p>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{title}</h3>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                            {discountPrice ? `Rp ${discountPrice.toLocaleString('id-ID')}` : `Rp ${price.toLocaleString('id-ID')}`}
                        </p>
                    </div>
                </motion.div>
            </Link>
        )
    }

    return (
        <Link href={`/templates/${slug}`} onClick={handleClick}>
            <motion.div
                whileHover={{ y: -6 }}
                className="group h-full bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-300"
            >
                {/* Image Section */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
                    {image ? (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium">
                            {title}
                        </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Quick view button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <Eye className="w-4 h-4" />
                            Lihat Detail
                        </span>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {isFeatured && (
                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <Star className="w-3 h-3 fill-current" />
                                Featured
                            </span>
                        )}
                        {discountPercent > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                -{discountPercent}%
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">
                            {category}
                        </span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-3 group-hover:text-orange-600 transition-colors leading-tight">
                        {title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                            {discountPrice ? (
                                <>
                                    <span className="text-xl font-bold text-gray-900">
                                        Rp {discountPrice.toLocaleString('id-ID')}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">
                                        Rp {price.toLocaleString('id-ID')}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xl font-bold text-gray-900">
                                    Rp {price.toLocaleString('id-ID')}
                                </span>
                            )}
                        </div>
                        
                        <span className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                            <ArrowRight className="w-5 h-5" />
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}
