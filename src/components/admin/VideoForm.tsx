'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Youtube, Package } from 'lucide-react'
import { ImageUpload } from './ImageUpload'

interface Video {
    id?: number
    title: string
    description: string | null
    youtube_url: string
    thumbnail_url: string | null
    duration: string | null
    order: number
    is_active: boolean
    product_id?: number | null
}

interface Product {
    id: number
    title: string
}

interface VideoFormProps {
    video?: Video
}

export function VideoForm({ video }: VideoFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    
    const [formData, setFormData] = useState({
        title: video?.title || '',
        description: video?.description || '',
        youtubeUrl: video?.youtube_url || '',
        thumbnailUrl: video?.thumbnail_url || '',
        duration: video?.duration || '',
        order: video?.order || 0,
        isActive: video?.is_active ?? true,
        productId: video?.product_id || '',
    })

    const [previewId, setPreviewId] = useState<string | null>(null)

    useEffect(() => {
        // Fetch products for dropdown
        fetch('/api/admin/products')
            .then(res => res.json())
            .then(data => {
                if (data.products) {
                    setProducts(data.products.map((p: { id: number; title: string }) => ({ id: p.id, title: p.title })))
                }
            })
            .catch(console.error)
    }, [])

    useEffect(() => {
        const match = formData.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)
        setPreviewId(match ? match[1] : null)
    }, [formData.youtubeUrl])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setFormData(prev => ({ ...prev, [name]: checked }))
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const url = video 
                ? `/api/admin/videos/${video.id}` 
                : '/api/admin/videos'
            
            const method = video ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    productId: formData.productId || null,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Gagal menyimpan video')
            }

            router.push('/admin/videos')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                {/* YouTube URL with Preview */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Video YouTube *
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                            <input
                                type="url"
                                name="youtubeUrl"
                                value={formData.youtubeUrl}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>
                    </div>
                    {previewId && (
                        <div className="mt-4 aspect-video rounded-xl overflow-hidden bg-black">
                            <iframe
                                src={`https://www.youtube.com/embed/${previewId}`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Video *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                        placeholder="Contoh: Cara Menggunakan Budget Tracker"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all resize-none"
                        placeholder="Deskripsi singkat tentang isi video..."
                    />
                </div>

                {/* Product Relation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Package className="inline w-4 h-4 mr-1" />
                        Tampilkan di Produk
                    </label>
                    <select
                        name="productId"
                        value={formData.productId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                    >
                        <option value="">Semua Produk (Video Umum)</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.title}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Pilih produk spesifik atau biarkan kosong untuk menampilkan di semua halaman produk
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Durasi
                        </label>
                        <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                            placeholder="Contoh: 5:30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Urutan
                        </label>
                        <input
                            type="number"
                            name="order"
                            value={formData.order}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                            placeholder="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Angka lebih kecil tampil lebih dulu</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Thumbnail (Opsional)
                    </label>
                    <ImageUpload
                        value={formData.thumbnailUrl}
                        onChange={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                        onRemove={() => setFormData(prev => ({ ...prev, thumbnailUrl: '' }))}
                        bucket="thumbnails"
                        aspectRatio="video"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Jika tidak diisi, akan menggunakan thumbnail dari YouTube
                    </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <label className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Aktif</span>
                            <p className="text-sm text-gray-500 mt-0.5">Video akan ditampilkan di website</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <Link
                    href="/admin/videos"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Kembali
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            Simpan Video
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
