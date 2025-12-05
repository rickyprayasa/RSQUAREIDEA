'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Plus, X, Image as ImageIcon, Link as LinkIcon, Tag, DollarSign, Settings, Sparkles } from 'lucide-react'
import { ImageUpload } from './ImageUpload'
import { MultiImageUpload } from './MultiImageUpload'

interface ExternalLink {
    name: string
    url: string
}

interface Product {
    id?: number
    title: string
    slug: string
    description: string | null
    price: number
    discount_price: number | null
    category: string
    image: string | null
    thumbnail: string | null
    images: string[] | null
    demo_url: string | null
    download_url: string | null
    is_featured: boolean
    is_free: boolean
    is_active: boolean
    features: string[] | null
    external_links?: ExternalLink[] | null
}

interface Category {
    id: number
    name: string
    slug: string
}

interface ProductFormProps {
    product?: Product
    categories: Category[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'pricing' | 'settings'>('basic')
    
    const [formData, setFormData] = useState({
        title: product?.title || '',
        slug: product?.slug || '',
        description: product?.description || '',
        price: product?.price || 0,
        discountPrice: product?.discount_price || '',
        category: product?.category || '',
        image: product?.image || '',
        thumbnail: product?.thumbnail || '',
        images: product?.images || [],
        demoUrl: product?.demo_url || '',
        downloadUrl: product?.download_url || '',
        isFeatured: product?.is_featured || false,
        isFree: product?.is_free || false,
        isActive: product?.is_active ?? true,
    })

    const [features, setFeatures] = useState<string[]>(
        product?.features || []
    )
    const [newFeature, setNewFeature] = useState('')
    
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>(
        product?.external_links || []
    )
    const [newLinkName, setNewLinkName] = useState('')
    const [newLinkUrl, setNewLinkUrl] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setFormData(prev => ({ ...prev, [name]: checked }))
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const addFeature = () => {
        if (newFeature.trim()) {
            setFeatures(prev => [...prev, newFeature.trim()])
            setNewFeature('')
        }
    }

    const removeFeature = (index: number) => {
        setFeatures(prev => prev.filter((_, i) => i !== index))
    }

    const addExternalLink = () => {
        if (newLinkName.trim() && newLinkUrl.trim()) {
            setExternalLinks(prev => [...prev, { name: newLinkName.trim(), url: newLinkUrl.trim() }])
            setNewLinkName('')
            setNewLinkUrl('')
        }
    }

    const removeExternalLink = (index: number) => {
        setExternalLinks(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const url = product 
                ? `/api/admin/products/${product.id}` 
                : '/api/admin/products'
            
            const method = product ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    discountPrice: formData.discountPrice || null,
                    features,
                    externalLinks,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Gagal menyimpan produk')
            }

            router.push('/admin/products')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'basic', label: 'Informasi Dasar', icon: Tag },
        { id: 'media', label: 'Gambar', icon: ImageIcon },
        { id: 'pricing', label: 'Harga & Link', icon: DollarSign },
        { id: 'settings', label: 'Pengaturan', icon: Settings },
    ] as const

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Tab: Basic Info */}
                    {activeTab === 'basic' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Produk *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                    placeholder="Contoh: Personal Budgeting Template"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Slug (URL)
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                        placeholder="personal-budgeting-template"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Kosongkan untuk generate otomatis</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kategori *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all resize-none"
                                    placeholder="Jelaskan produk Anda secara detail..."
                                />
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fitur Produk
                                </label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newFeature}
                                            onChange={(e) => setNewFeature(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                            className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="Tambah fitur baru..."
                                        />
                                        <button
                                            type="button"
                                            onClick={addFeature}
                                            className="px-4 py-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>
                                    {features.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {features.map((feature, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm group"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    {feature}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFeature(index)}
                                                        className="ml-1 hover:text-orange-900 opacity-60 hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Media */}
                    {activeTab === 'media' && (
                        <div className="space-y-6">
                            {/* Thumbnail */}
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Thumbnail (Card View)
                                </label>
                                <ImageUpload
                                    value={formData.thumbnail}
                                    onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                                    onRemove={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                                    bucket="products"
                                    aspectRatio="video"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Gambar kecil untuk tampilan card/list di halaman templates. Rekomendasi: 640x360px (16:9)
                                </p>
                            </div>

                            {/* Gallery */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Galeri Gambar
                                </label>
                                <MultiImageUpload
                                    value={formData.images}
                                    onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                                    bucket="products"
                                    maxImages={8}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Tambahkan screenshot atau preview tambahan. Drag untuk mengatur urutan.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tab: Pricing & Links */}
                    {activeTab === 'pricing' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Harga Normal (Rp)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">Rp</span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Harga Diskon (Rp)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">Rp</span>
                                        <input
                                            type="number"
                                            name="discountPrice"
                                            value={formData.discountPrice}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="Kosongkan jika tidak ada"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" />
                                    Link Produk
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            URL Demo (Google Sheets)
                                        </label>
                                        <input
                                            type="url"
                                            name="demoUrl"
                                            value={formData.demoUrl}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="https://docs.google.com/spreadsheets/d/..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Link preview untuk calon pembeli</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            URL Download (Google Drive)
                                        </label>
                                        <input
                                            type="url"
                                            name="downloadUrl"
                                            value={formData.downloadUrl}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="https://drive.google.com/file/d/..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Link download untuk pembeli (dikirim setelah pembayaran)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Settings */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="space-y-4">
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
                                        <p className="text-sm text-gray-500 mt-0.5">Produk akan ditampilkan di website</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleChange}
                                        className="w-5 h-5 mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">Produk Unggulan</span>
                                        <p className="text-sm text-gray-500 mt-0.5">Tampilkan di section Template Unggulan di beranda</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isFree"
                                        checked={formData.isFree}
                                        onChange={handleChange}
                                        className="w-5 h-5 mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">Gratis</span>
                                        <p className="text-sm text-gray-500 mt-0.5">Produk bisa diunduh tanpa pembayaran. Tampil di section Template Gratis</p>
                                    </div>
                                </label>
                            </div>

                            {/* External Links */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-medium text-gray-900 mb-4">Link Pembelian Eksternal</h3>
                                <p className="text-sm text-gray-500 mb-4">Tambahkan link pembelian di platform lain (Tokopedia, Shopee, dll)</p>
                                
                                {externalLinks.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {externalLinks.map((link, index) => (
                                            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm">{link.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{link.url}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExternalLink(index)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newLinkName}
                                        onChange={(e) => setNewLinkName(e.target.value)}
                                        placeholder="Nama (cth: Tokopedia)"
                                        className="flex-1 px-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                    <input
                                        type="url"
                                        value={newLinkUrl}
                                        onChange={(e) => setNewLinkUrl(e.target.value)}
                                        placeholder="URL"
                                        className="flex-[2] px-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addExternalLink}
                                        disabled={!newLinkName.trim() || !newLinkUrl.trim()}
                                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-medium text-gray-900 mb-4">Preview Status</h3>
                                <div className="flex flex-wrap gap-2">
                                    {formData.isActive ? (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Aktif</span>
                                    ) : (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">Nonaktif</span>
                                    )}
                                    {formData.isFeatured && (
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Unggulan</span>
                                    )}
                                    {formData.isFree ? (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Gratis</span>
                                    ) : (
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Berbayar</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <Link
                    href="/admin/products"
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
                            Simpan Produk
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
