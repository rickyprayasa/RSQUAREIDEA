import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { data: videos, error } = await supabase
            .from('video_tutorials')
            .select('*')
            .order('order', { ascending: true })

        if (error) {
            console.error('Error fetching videos:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ videos })
    } catch (error) {
        console.error('Error fetching videos:', error)
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const supabase = await createClient()
        
        const { data: video, error } = await supabase
            .from('video_tutorials')
            .insert({
                title: data.title,
                description: data.description || null,
                youtube_url: data.youtubeUrl,
                thumbnail_url: data.thumbnailUrl || null,
                duration: data.duration || null,
                order: data.order || 0,
                is_active: data.isActive ?? true,
                product_id: data.productId || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating video:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ video })
    } catch (error) {
        console.error('Error creating video:', error)
        return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
    }
}
