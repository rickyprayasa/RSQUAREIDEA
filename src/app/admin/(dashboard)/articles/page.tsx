'use client'

import { useState, useEffect } from 'react'
import { ArticlesTable } from '@/components/admin/ArticlesTable'
import { Loader2 } from 'lucide-react'

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string | null
    published: boolean
    created_at: string
    thumbnail_url: string | null
    updated_at: string
    author_id: string | null
    content: string | null
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/articles')
            .then(res => res.json())
            .then(data => {
                if (data.articles) {
                    setArticles(data.articles)
                }
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

    return <ArticlesTable articles={articles} />
}
