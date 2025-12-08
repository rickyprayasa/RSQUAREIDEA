'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Youtube, Package, CheckCircle, AlertCircle } from 'lucide-react'

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

interface YouTubeInfo {
    title: string
    thumbnail: string
    author: string
}

export function VideoForm({ video }: VideoFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [error, setError] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    const [videoInfo, setVideoInfo] = useState<YouTubeInfo | null>(null)
    
    const [formData, setFormData] = useState({
        youtubeUrl: video?.youtube_url || '',
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

    // Extract video ID and fetch info when URL changes
    useEffect(() => {
        const match = formData.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)
        const videoId = match ? match[1] : null
        setPreviewId(videoId)

        if (videoId && !video) {
            // Fetch video info from YouTube oEmbed API
            setFetching(true)
            fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
                .then(res => res.json())
                .then(data => {
                    setVideoInfo({
                        title: data.title,
                        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                        author: data.author_name,
                    })
                })
                .catch(() => {
                    setVideoInfo(null)
                })
                .finally(() => setFetching(false))
        } else if (video) {
            setVideoInfo({
                title: video.title,
                thumbnail: video.thumbnail_url || '',
                author: '',
            })
        }
    }, [formData.youtubeUrl, video])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!videoInfo) {
            setError('URL YouTube tidak valid atau tidak dapat diambil informasinya')
            return
        }

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
                    title: videoInfo.title,
                    description: '',
                    youtubeUrl: formData.youtubeUrl,
                    thumbnailUrl: videoInfo.thumbnail,
                    duration: '',
                    order: 0,
                    isActive: true,
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
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                {/* YouTube URL Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paste URL Video YouTube
                    </label>
                    <div className="relative">
                        <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                        <input
                            type="url"
                            name="youtubeUrl"
                            value={formData.youtubeUrl}
                            onChange={handleChange}
                            required
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all text-lg"
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Cukup paste URL dari YouTube, judul dan thumbnail akan diambil otomatis
                    </p>
                </div>

                {/* Video Preview */}
                {fetching && (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Mengambil informasi video...
                    </div>
                )}

                {videoInfo && previewId && !fetching && (
                    <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-700 mb-3">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Video ditemukan</span>
                        </div>
                        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                            <div className="aspect-video">
                                <iframe
                                    src={`https://www.youtube.com/embed/${previewId}`}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900">{videoInfo.title}</h3>
                                {videoInfo.author && (
                                    <p className="text-sm text-gray-500 mt-1">Channel: {videoInfo.author}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Relation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Package className="inline w-4 h-4 mr-1" />
                        Tampilkan di Produk (Opsional)
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
                    disabled={loading || !videoInfo}
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
