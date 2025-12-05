'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/hooks/useAnalytics'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const lastTrackedPath = useRef<string>('')

    useEffect(() => {
        // Only track if path changed and NOT in admin area
        if (pathname && pathname !== lastTrackedPath.current) {
            lastTrackedPath.current = pathname

            // Skip tracking for admin pages
            if (pathname.startsWith('/admin')) {
                return
            }

            // Small delay to ensure document.title is updated
            setTimeout(() => {
                const title = document.title || pathname
                trackPageView(pathname, title)
            }, 100)
        }
    }, [pathname])

    return <>{children}</>
}
