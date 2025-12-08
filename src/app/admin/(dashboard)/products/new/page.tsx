import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'

async function getCategories() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
    return data || []
}

export default async function NewProductPage() {
    const categories = await getCategories()

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tambah Produk Baru</h1>
                <p className="text-gray-500 mt-1">Buat produk template baru untuk dijual</p>
            </div>
            
            <ProductForm categories={categories} />
        </div>
    )
}
