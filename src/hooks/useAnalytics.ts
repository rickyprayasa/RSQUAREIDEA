'use client'

import { useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent } from '@/components/TrackingScripts'

// Generate or get visitor ID
const getVisitorId = (): string => {
    if (typeof window === 'undefined') return ''

    let visitorId = localStorage.getItem('rsquare_visitor_id')
    if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
        localStorage.setItem('rsquare_visitor_id', visitorId)
    }
    return visitorId
}

// Generate session ID (expires after 30 min of inactivity)
const getSessionId = (): string => {
    if (typeof window === 'undefined') return ''

    const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
    const now = Date.now()

    const stored = sessionStorage.getItem('rsquare_session')
    if (stored) {
        const { id, lastActive } = JSON.parse(stored)
        if (now - lastActive < SESSION_TIMEOUT) {
            sessionStorage.setItem('rsquare_session', JSON.stringify({ id, lastActive: now }))
            return id
        }
    }

    const sessionId = 's_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    sessionStorage.setItem('rsquare_session', JSON.stringify({ id: sessionId, lastActive: now }))
    return sessionId
}

// Track page view
export const trackPageView = async (path: string, title: string) => {
    try {
        await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'pageview',
                path,
                title,
                visitorId: getVisitorId(),
                sessionId: getSessionId(),
            }),
        })

        // Also track on Meta Pixel
        trackEvent.metaPageView()
    } catch (error) {
        console.error('PageView tracking error:', error)
    }
}

// Track product interaction
export const trackProductClick = async (data: {
    productId: string
    productSlug: string
    productTitle: string
    clickType: 'view' | 'click' | 'add_to_cart' | 'buy_now'
    value?: number
}) => {
    try {
        await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'product_click',
                ...data,
                visitorId: getVisitorId(),
                sessionId: getSessionId(),
            }),
        })

        // Track on pixels based on click type
        if (data.clickType === 'view') {
            trackEvent.metaViewContent({
                content_name: data.productTitle,
                content_category: 'product',
                value: data.value,
            })
            trackEvent.tiktokViewContent({
                content_name: data.productTitle,
                value: data.value,
            })
            trackEvent.gaEvent('view_item', {
                item_name: data.productTitle,
                value: data.value,
            })
        } else if (data.clickType === 'add_to_cart') {
            trackEvent.metaAddToCart({
                content_name: data.productTitle,
                value: data.value,
            })
            trackEvent.tiktokAddToCart({
                content_name: data.productTitle,
                value: data.value,
            })
            trackEvent.gaAddToCart({
                item_name: data.productTitle,
                value: data.value || 0,
            })
        }
    } catch (error) {
        console.error('Product tracking error:', error)
    }
}

// Track button click
export const trackButtonClick = async (buttonName: string, buttonLocation: string) => {
    try {
        const path = typeof window !== 'undefined' ? window.location.pathname : ''

        await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'button_click',
                buttonName,
                buttonLocation,
                pagePath: path,
                visitorId: getVisitorId(),
                sessionId: getSessionId(),
            }),
        })

        // Track on GA
        trackEvent.gaEvent('button_click', {
            button_name: buttonName,
            button_location: buttonLocation,
        })
    } catch (error) {
        console.error('Button tracking error:', error)
    }
}

// Track checkout initiation
export const trackInitiateCheckout = async (value: number) => {
    try {
        trackEvent.metaInitiateCheckout({ value })
        trackEvent.tiktokInitiateCheckout({ value })
        trackEvent.gaEvent('begin_checkout', { value, currency: 'IDR' })
    } catch (error) {
        console.error('Checkout tracking error:', error)
    }
}

// Track purchase
export const trackPurchase = async (data: {
    orderId: string
    value: number
    items: { name: string; price: number }[]
}) => {
    try {
        trackEvent.metaPurchase({ value: data.value })
        trackEvent.tiktokCompletePayment({ value: data.value })
        trackEvent.gaPurchase({
            transaction_id: data.orderId,
            value: data.value,
            items: data.items.map(item => ({
                item_name: item.name,
                price: item.price,
            })),
        })
    } catch (error) {
        console.error('Purchase tracking error:', error)
    }
}

// Custom hook for automatic page tracking
export function useAnalytics() {
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

            const title = document.title || pathname
            trackPageView(pathname, title)
        }
    }, [pathname])

    const trackProduct = useCallback((data: {
        productId: string
        productSlug: string
        productTitle: string
        clickType: 'view' | 'click' | 'add_to_cart' | 'buy_now'
        value?: number
    }) => {
        trackProductClick(data)
    }, [])

    const trackButton = useCallback((buttonName: string, buttonLocation: string) => {
        trackButtonClick(buttonName, buttonLocation)
    }, [])

    return {
        trackProduct,
        trackButton,
        trackPageView,
        trackInitiateCheckout,
        trackPurchase,
    }
}

export default useAnalytics
