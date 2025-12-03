import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const bucket = (formData.get('bucket') as string) || 'products'
        const folder = formData.get('folder') as string | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate bucket
        const validBuckets = ['products', 'payments', 'thumbnails']
        if (!validBuckets.includes(bucket)) {
            return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, { status: 400 })
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
        }

        const supabase = await createClient()

        // Generate unique filename
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = folder ? `${folder}/${fileName}` : fileName

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

        return NextResponse.json({ 
            url: publicUrl, 
            path: filePath,
            bucket 
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { path, bucket } = await request.json()

        if (!path || !bucket) {
            return NextResponse.json({ error: 'Path and bucket are required' }, { status: 400 })
        }

        const validBuckets = ['products', 'payments', 'thumbnails']
        if (!validBuckets.includes(bucket)) {
            return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
        }

        const supabase = await createClient()

        const { error } = await supabase.storage
            .from(bucket)
            .remove([path])

        if (error) {
            console.error('Delete error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
}
