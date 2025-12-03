'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

export function CartButton() {
    const [isOpen, setIsOpen] = useState(false)
    const { items, removeItem, clearCart, totalItems, totalPrice } = useCart()
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Cart Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
            >
                <ShoppingCart className="h-5 w-5 text-orange-600" />
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {totalItems}
                    </span>
                )}
            </button>

            {/* Cart Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 text-orange-500" />
                                Keranjang ({totalItems})
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="max-h-80 overflow-y-auto">
                            {items.length === 0 ? (
                                <div className="text-center py-8 px-4">
                                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-200 mb-3" />
                                    <p className="text-gray-500 text-sm">Keranjang masih kosong</p>
                                    <p className="text-xs text-gray-400 mt-1">Tambahkan template yang ingin dibeli</p>
                                </div>
                            ) : (
                                <div className="p-3 space-y-2">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                                        >
                                            {/* Clickable Product Link */}
                                            <Link
                                                href={`/templates/${item.slug}`}
                                                onClick={() => setIsOpen(false)}
                                                className="flex gap-3 flex-1 min-w-0"
                                            >
                                                {/* Product Image */}
                                                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.title}
                                                            width={56}
                                                            height={56}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                                            <ShoppingCart className="w-5 h-5 text-orange-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 text-sm leading-tight line-clamp-1 hover:text-orange-600 transition-colors">{item.title}</h4>
                                                    <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded">
                                                        {item.category}
                                                    </span>
                                                    <div className="mt-0.5">
                                                        {item.discountPrice ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-orange-600 text-sm">Rp {item.discountPrice.toLocaleString('id-ID')}</span>
                                                                <span className="text-xs text-gray-400 line-through">Rp {item.price.toLocaleString('id-ID')}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="font-bold text-orange-600 text-sm">
                                                                {item.price === 0 ? 'Gratis' : `Rp ${item.price.toLocaleString('id-ID')}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                            
                                            {/* Remove Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeItem(item.id)
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors self-start flex-shrink-0"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-3 border-t bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-600">Total</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {totalPrice === 0 ? 'Gratis' : `Rp ${totalPrice.toLocaleString('id-ID')}`}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        href="/checkout"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm"
                                    >
                                        Checkout <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={() => {
                                            clearCart()
                                            setIsOpen(false)
                                        }}
                                        className="w-full py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors text-xs"
                                    >
                                        Kosongkan Keranjang
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
