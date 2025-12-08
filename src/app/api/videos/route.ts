import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        // Check if video section is active
        const { data: activeSetting } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'video_tutorial_active')
            .single()
        
        const isActive = activeSetting?.value !== 'false'
        
        if (!isActive) {
            return NextResponse.json({ videos: [], settings: { isActive: 'false' } })
        }

        // Build query - fetch videos for specific product or general videos (product_id is null)
        let query = supabase
            .from('video_tutorials')
            .select('*')
            .eq('is_active', true)
        
        if (productId) {
            // Get videos specific to product OR general videos (no product_id)
            query = query.or(`product_id.eq.${productId},product_id.is.null`)
        }
        
        const { data: videos, error: videosError } = await query.order('order', { ascending: true })

        if (videosError) {
            console.error('Error fetching videos:', videosError)
            return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
        }

        // Fetch section settings
        const { data: settingsResult } = await supabase
            .from('site_settings')
            .select('key, value')
            .eq('group', 'video')
        
        const settings: Record<string, string> = { isActive: 'true' }
        settingsResult?.forEach(s => {
            settings[s.key] = s.value || ''
        })

        // Transform snake_case to camelCase for frontend
        const transformedVideos = videos?.map(v => ({
            id: v.id,
            title: v.title,
            description: v.description,
            youtubeUrl: v.youtube_url,
            thumbnailUrl: v.thumbnail_url,
            duration: v.duration,
            order: v.order,
            isActive: v.is_active,
        }))

        return NextResponse.json({ videos: transformedVideos, settings })
    } catch (error) {
        console.error('Error fetching videos:', error)
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }
}
