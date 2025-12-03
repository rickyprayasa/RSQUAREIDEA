'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
    id: string | number
    title: string
    slug: string
    price: number
    discountPrice?: number
    category: string
    image?: string
    downloadUrl?: string
    demoUrl?: string
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string | number) => void
    clearCart: () => void
    isInCart: (id: string | number) => boolean
    totalItems: number
    totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    // Load cart from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('rsquare-cart')
        if (saved) {
            try {
                setItems(JSON.parse(saved))
            } catch (e) {
                console.error('Error loading cart:', e)
            }
        }
    }, [])

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('rsquare-cart', JSON.stringify(items))
    }, [items])

    const addItem = (item: CartItem) => {
        setItems(prev => {
            if (prev.some(i => i.id === item.id)) return prev
            return [...prev, item]
        })
    }

    const removeItem = (id: string | number) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }

    const clearCart = () => setItems([])

    const isInCart = (id: string | number) => items.some(item => item.id === id)

    const totalItems = items.length

    const totalPrice = items.reduce((sum, item) => {
        return sum + (item.discountPrice || item.price)
    }, 0)

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
