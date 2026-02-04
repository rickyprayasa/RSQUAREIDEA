'use client'

import { useEffect, useState, use } from 'react'
import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { Loader2 } from 'lucide-react'

// Correct usage of params in Next.js 15 (if params is a Promise)
// Or standard usage. The file list suggests they might be on Next.js 15 or 14.
// package.json says "next": "^16.0.7" wait... Next 16? That's likely a canary or mistaken version in my view unless it's very new.
// Actually package.json said "next": "^16.0.7". Next 16 isn't out yet (curr 15 RC/Stable). Maybe it's 15 or 14.
// Let's assume standard client component behavior where params is available via props or useParams.
// But this is a page.tsx.
// In Next 15, params is asynchronous.
// Let's safe-guard by using `useParams` from `next/navigation` since this is a client component.

import { useParams } from 'next/navigation'

export default function EditArticlePage() {
    const params = useParams()
    const id = params?.id as string
    const [article, setArticle] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return

        fetch(`/api/admin/articles/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.article) {
                    setArticle(data.article)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!article) return <div>Article not found</div>

    return <ArticleEditor article={article} />
}
