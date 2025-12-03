'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TemplateCard } from '@/components/templates/TemplateCard'
import { Search, Grid3X3, LayoutGrid, Layers, Wallet, BarChart3, Zap, Palette } from 'lucide-react'

interface Template {
    _id: string
    title: string
    slug: string
    price: number
    discountPrice?: number
    image: string
    category: string
    isFeatured?: boolean
}

interface Category {
    name: string
    slug: string
}

interface TemplatesListProps {
    initialTemplates: Template[]
    categories?: Category[]
}

const defaultCategories = [
    { id: 'All', label: 'Semua', Icon: Layers },
    { id: 'Budgeting', label: 'Keuangan', Icon: Wallet },
    { id: 'Business', label: 'Bisnis', Icon: BarChart3 },
    { id: 'Productivity', label: 'Produktivitas', Icon: Zap },
    { id: 'Lifestyle', label: 'Lifestyle', Icon: Palette },
]

const categoryIcons: Record<string, typeof Layers> = {
    'Budgeting': Wallet,
    'Business': BarChart3,
    'Productivity': Zap,
    'Lifestyle': Palette,
}

export function TemplatesList({ initialTemplates, categories: propCategories }: TemplatesListProps) {
    const categories = propCategories && propCategories.length > 0
        ? [
            { id: 'All', label: 'Semua', Icon: Layers },
            ...propCategories.map(c => ({
                id: c.name,
                label: c.name,
                Icon: categoryIcons[c.name] || Layers,
            }))
        ]
        : defaultCategories
    const [activeCategory, setActiveCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid')

    const filteredTemplates = initialTemplates.filter(t => {
        const matchesCategory = activeCategory === 'All' || t.category === activeCategory
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             t.category.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="space-y-8">
            {/* Search and Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6"
            >
                {/* Search Input */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari template..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <motion.button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                activeCategory === category.id
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <category.Icon className="w-4 h-4" />
                            <span>{category.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Results count and view toggle */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Menampilkan <span className="font-semibold text-gray-900">{filteredTemplates.length}</span> template
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('compact')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'compact' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                            <Grid3X3 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Templates Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategory + searchQuery}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`grid gap-6 ${
                        viewMode === 'grid' 
                            ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                            : 'sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'
                    }`}
                >
                    {filteredTemplates.map((template, index) => (
                        <motion.div
                            key={template._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            <TemplateCard
                                title={template.title}
                                slug={template.slug}
                                price={template.price}
                                discountPrice={template.discountPrice}
                                image={template.image || '/placeholder.jpg'}
                                category={template.category}
                                isFeatured={template.isFeatured}
                                compact={viewMode === 'compact'}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada template ditemukan</h3>
                    <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian</p>
                </motion.div>
            )}
        </div>
    )
}
