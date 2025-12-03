'use client'

import { useState, useEffect } from 'react'
import { Plus, FolderOpen, Pencil, Trash2, Loader2, X, Save } from 'lucide-react'

interface Category {
    id: number
    name: string
    slug: string
    icon: string | null
    description: string | null
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState({ name: '', slug: '', description: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories')
            const data = await res.json()
            setCategories(data.categories || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const url = editingCategory 
                ? `/api/admin/categories/${editingCategory.id}` 
                : '/api/admin/categories'
            const method = editingCategory ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                fetchCategories()
                resetForm()
            }
        } catch (error) {
            console.error('Error saving category:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus kategori ini?')) return

        try {
            await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
            fetchCategories()
        } catch (error) {
            console.error('Error deleting category:', error)
        }
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
        })
        setShowForm(true)
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingCategory(null)
        setFormData({ name: '', slug: '', description: '' })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
                    <p className="text-gray-500 mt-1">Kelola kategori produk</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium shadow-lg shadow-orange-500/25"
                >
                    <Plus className="h-5 w-5" />
                    Tambah Kategori
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {categories.length === 0 ? (
                        <div className="p-12 text-center">
                            <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Belum ada kategori</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Tambah kategori pertama
                            </button>
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 rounded-xl">
                                        <FolderOpen className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{category.name}</p>
                                        <p className="text-sm text-gray-500">{category.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleEdit(category)}
                                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={resetForm}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b bg-orange-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FolderOpen className="h-5 w-5 text-orange-600" />
                                    <h3 className="font-semibold text-gray-900">
                                        {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                                    </h3>
                                </div>
                                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Kategori *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Contoh: Budgeting"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Slug (URL)
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="budgeting (otomatis jika kosong)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                                    placeholder="Deskripsi kategori..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Simpan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
