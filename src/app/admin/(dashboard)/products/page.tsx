'use client'

import { useState, useEffect } from 'react'
import { ProductsTable } from '@/components/admin/ProductsTable'
import { Loader2 } from 'lucide-react'

interface Product {
    id: number
    title: string
    slug: string
    description: string | null
    price: number
    discountPrice: number | null
    category: string
    image: string | null
    images: string[] | null
    demoUrl: string | null
    downloadUrl: string | null
    isFeatured: boolean
    isFree: boolean
    isActive: boolean
    features: string[] | null
    createdAt: string
    updatedAt: string
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/products')
            .then(res => res.json())
            .then(data => {
                interface RawProduct {
                    id: number
                    title: string
                    slug: string
                    description: string | null
                    price: number
                    discount_price: number | null
                    category: string
                    image: string | null
                    images: string[] | null
                    demo_url: string | null
                    download_url: string | null
                    is_featured: boolean
                    is_free: boolean
                    is_active: boolean
                    features: string[] | null
                    created_at: string
                    updated_at: string
                }
                const transformed = (data.products || []).map((p: RawProduct) => ({
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    description: p.description,
                    price: p.price,
                    discountPrice: p.discount_price,
                    category: p.category,
                    image: p.image,
                    images: p.images,
                    demoUrl: p.demo_url,
                    downloadUrl: p.download_url,
                    isFeatured: p.is_featured,
                    isFree: p.is_free,
                    isActive: p.is_active,
                    features: p.features,
                    createdAt: p.created_at,
                    updatedAt: p.updated_at,
                }))
                setProducts(transformed)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return <ProductsTable products={products} />
}
