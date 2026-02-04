'use client'

import { useEffect, useRef } from 'react'
import { incrementArticleViews } from '@/app/actions/article-actions'

export function ViewCounter({ slug }: { slug: string }) {
    const hasIncremented = useRef(false)

    useEffect(() => {
        if (!hasIncremented.current) {
            incrementArticleViews(slug)
            hasIncremented.current = true
        }
    }, [slug])

    return null
}
