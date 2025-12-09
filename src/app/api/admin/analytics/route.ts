import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '7d'
        
        const supabase = await createClient()

        // Calculate date range
        const startDate = new Date()
        if (period === '24h') {
            startDate.setHours(startDate.getHours() - 24)
        } else if (period === '7d') {
            startDate.setDate(startDate.getDate() - 7)
        } else if (period === '30d') {
            startDate.setDate(startDate.getDate() - 30)
        } else if (period === '90d') {
            startDate.setDate(startDate.getDate() - 90)
        }

        // Get page views
        const { data: pageViews } = await supabase
            .from('page_views')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false })

        // Get product clicks
        const { data: productClicks } = await supabase
            .from('product_clicks')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false })

        // Get button clicks
        const { data: buttonClicks } = await supabase
            .from('button_clicks')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false })

        // Calculate stats
        const views = pageViews || []
        const clicks = productClicks || []
        const buttons = buttonClicks || []

        // Unique visitors (by visitor_id)
        const uniqueVisitors = new Set(views.map(v => v.visitor_id)).size

        // Page stats
        const pageStats: Record<string, number> = {}
        views.forEach(v => {
            const path = v.page_path || '/'
            pageStats[path] = (pageStats[path] || 0) + 1
        })
        const topPages = Object.entries(pageStats)
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)

        // Product stats
        const productStats: Record<string, { title: string; views: number; clicks: number; addToCart: number }> = {}
        clicks.forEach(c => {
            const key = c.product_slug
            if (!productStats[key]) {
                productStats[key] = { title: c.product_title || key, views: 0, clicks: 0, addToCart: 0 }
            }
            if (c.click_type === 'view') productStats[key].views++
            else if (c.click_type === 'add_to_cart') productStats[key].addToCart++
            else productStats[key].clicks++
        })
        const topProducts = Object.entries(productStats)
            .map(([slug, data]) => ({ slug, ...data }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10)

        // Device breakdown
        const deviceStats: Record<string, number> = {}
        views.forEach(v => {
            const device = v.device_type || 'unknown'
            deviceStats[device] = (deviceStats[device] || 0) + 1
        })

        // Browser breakdown
        const browserStats: Record<string, number> = {}
        views.forEach(v => {
            const browser = v.browser || 'Unknown'
            browserStats[browser] = (browserStats[browser] || 0) + 1
        })

        // Traffic sources
        const sourceStats: Record<string, number> = {}
        views.forEach(v => {
            let source = 'Direct'
            if (v.referrer) {
                try {
                    const url = new URL(v.referrer)
                    if (url.hostname.includes('google')) source = 'Google'
                    else if (url.hostname.includes('facebook') || url.hostname.includes('fb.')) source = 'Facebook'
                    else if (url.hostname.includes('instagram')) source = 'Instagram'
                    else if (url.hostname.includes('tiktok')) source = 'TikTok'
                    else if (url.hostname.includes('twitter') || url.hostname.includes('x.com')) source = 'Twitter/X'
                    else if (url.hostname.includes('youtube')) source = 'YouTube'
                    else source = url.hostname
                } catch {
                    source = 'Other'
                }
            }
            sourceStats[source] = (sourceStats[source] || 0) + 1
        })
        const trafficSources = Object.entries(sourceStats)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)

        // Views by hour (for today)
        const hourlyViews: number[] = Array(24).fill(0)
        const today = new Date().toDateString()
        views.filter(v => new Date(v.created_at).toDateString() === today).forEach(v => {
            const hour = new Date(v.created_at).getHours()
            hourlyViews[hour]++
        })

        // Views by day - generate complete date range
        const dailyViews: { date: string; views: number; visitors: number }[] = []
        const dayMap: Record<string, { views: number; visitors: Set<string> }> = {}
        
        // First, collect actual data
        views.forEach(v => {
            const date = new Date(v.created_at).toISOString().split('T')[0]
            if (!dayMap[date]) {
                dayMap[date] = { views: 0, visitors: new Set() }
            }
            dayMap[date].views++
            if (v.visitor_id) dayMap[date].visitors.add(v.visitor_id)
        })
        
        // Generate complete date range based on period
        const endDate = new Date()
        const rangeStart = new Date(startDate)
        
        // Determine number of days to show
        let daysToShow = 7
        if (period === '24h') daysToShow = 1
        else if (period === '7d') daysToShow = 7
        else if (period === '30d') daysToShow = 30
        else if (period === '90d') daysToShow = 90
        
        // Generate all dates in range
        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(rangeStart)
            date.setDate(rangeStart.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]
            
            // Only include dates up to today
            if (date <= endDate) {
                const data = dayMap[dateStr]
                dailyViews.push({
                    date: dateStr,
                    views: data?.views || 0,
                    visitors: data?.visitors.size || 0
                })
            }
        }

        // Button click stats
        const buttonStats: Record<string, number> = {}
        buttons.forEach(b => {
            const name = b.button_name
            buttonStats[name] = (buttonStats[name] || 0) + 1
        })
        const topButtons = Object.entries(buttonStats)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)

        return NextResponse.json({
            summary: {
                totalViews: views.length,
                uniqueVisitors,
                totalProductClicks: clicks.length,
                addToCartClicks: clicks.filter(c => c.click_type === 'add_to_cart').length,
                buttonClicks: buttons.length,
            },
            topPages,
            topProducts,
            deviceStats,
            browserStats,
            trafficSources,
            hourlyViews,
            dailyViews,
            topButtons,
        })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
