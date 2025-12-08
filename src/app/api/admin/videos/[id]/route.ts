import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function PUT(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await request.json()
        const supabase = await createClient()
        
        const { data: video, error } = await supabase
            .from('video_tutorials')
            .update({
                title: data.title,
                description: data.description || null,
                youtube_url: data.youtubeUrl,
                thumbnail_url: data.thumbnailUrl || null,
                duration: data.duration || null,
                order: data.order || 0,
                is_active: data.isActive ?? true,
                product_id: data.productId || null,
            })
            .eq('id', parseInt(id))
            .select()
            .single()

        if (error) {
            console.error('Error updating video:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ video })
    } catch (error) {
        console.error('Error updating video:', error)
        return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const supabase = await createClient()
        
        const { error } = await supabase
            .from('video_tutorials')
            .delete()
            .eq('id', parseInt(id))

        if (error) {
            console.error('Error deleting video:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting video:', error)
        return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
    }
}
