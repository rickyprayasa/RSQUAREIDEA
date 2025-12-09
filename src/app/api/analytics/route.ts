import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const supabase = await createClient()

        const { type, ...eventData } = data

        // Get visitor info from headers
        const userAgent = request.headers.get('user-agent') || ''
        const referer = request.headers.get('referer') || ''
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') || ''

        // Detect device type
        const isMobile = /Mobile|Android|iPhone/i.test(userAgent)
        const isTablet = /Tablet|iPad/i.test(userAgent)
        const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

        // Detect browser
        let browser = 'Unknown'
        if (/Chrome/i.test(userAgent)) browser = 'Chrome'
        else if (/Firefox/i.test(userAgent)) browser = 'Firefox'
        else if (/Safari/i.test(userAgent)) browser = 'Safari'
        else if (/Edge/i.test(userAgent)) browser = 'Edge'

        // Detect OS
        let os = 'Unknown'
        if (/Windows/i.test(userAgent)) os = 'Windows'
        else if (/Mac/i.test(userAgent)) os = 'macOS'
        else if (/Linux/i.test(userAgent)) os = 'Linux'
        else if (/Android/i.test(userAgent)) os = 'Android'
        else if (/iOS|iPhone|iPad/i.test(userAgent)) os = 'iOS'

        if (type === 'pageview') {
            // Skip tracking for admin pages
            if (eventData.path?.startsWith('/admin')) {
                return NextResponse.json({ success: true, skipped: true })
            }

            await supabase.from('page_views').insert({
                page_path: eventData.path,
                page_title: eventData.title,
                referrer: referer,
                user_agent: userAgent,
                ip_address: ip,
                device_type: deviceType,
                browser,
                os,
                session_id: eventData.sessionId,
                visitor_id: eventData.visitorId,
            })
        } else if (type === 'product_click') {
            await supabase.from('product_clicks').insert({
                product_id: eventData.productId,
                product_slug: eventData.productSlug,
                product_title: eventData.productTitle,
                click_type: eventData.clickType || 'view',
                referrer: referer,
                user_agent: userAgent,
                session_id: eventData.sessionId,
                visitor_id: eventData.visitorId,
            })
        } else if (type === 'button_click') {
            await supabase.from('button_clicks').insert({
                button_name: eventData.buttonName,
                button_location: eventData.buttonLocation,
                page_path: eventData.pagePath,
                session_id: eventData.sessionId,
                visitor_id: eventData.visitorId,
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
