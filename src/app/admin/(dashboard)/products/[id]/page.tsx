import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/ProductForm'

async function getProduct(id: number) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
    return data
}

async function getCategories() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
    return data || []
}

export default async function EditProductPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params
    const productId = parseInt(id)
    
    if (isNaN(productId)) {
        notFound()
    }

    const [product, categories] = await Promise.all([
        getProduct(productId),
        getCategories(),
    ])

    if (!product) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
                <p className="text-gray-500 mt-1">Perbarui informasi produk: {product.title}</p>
            </div>
            
            <ProductForm product={product} categories={categories} />
        </div>
    )
}
