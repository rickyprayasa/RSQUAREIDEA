import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { uploadToR2, deleteFromR2, getR2PublicUrl } from '@/lib/cloudflare/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
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
        const validBuckets = ['products', 'payments', 'thumbnails', 'qris']
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

        // Generate unique filename
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const basePath = folder ? `${bucket}/${folder}` : bucket
        const filePath = `${basePath}/${fileName}`

        // Upload to Cloudflare R2
        // Determine bucket type: qris is private, others are public
        const bucketType = bucket === 'qris' ? 'private' : 'public'
        
        const buffer = Buffer.from(await file.arrayBuffer())
        const { success, error, path: r2Path } = await uploadToR2(buffer, filePath, file.type, bucketType)

        if (!success) {
            console.error('R2 Upload error:', error)
            return NextResponse.json({ error: error || 'Failed to upload to R2' }, { status: 500 })
        }

        // Get public URL (only works correctly if it's a public bucket)
        // If it's private (qris), it returns the path or a non-working public URL.
        const r2Url = getR2PublicUrl(r2Path as string)

        return NextResponse.json({ 
            url: r2Url, 
            path: r2Path,
            bucket 
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { path, bucket } = await request.json()

        if (!path || !bucket) {
            return NextResponse.json({ error: 'Path and bucket are required' }, { status: 400 })
        }

        const validBuckets = ['products', 'payments', 'thumbnails', 'qris']
        if (!validBuckets.includes(bucket)) {
            return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
        }

        const bucketType = bucket === 'qris' ? 'private' : 'public'
        
        const { success, error: deleteError } = await deleteFromR2(path, bucketType)

        if (!success) {
            console.error('R2 Delete error:', deleteError)
            return NextResponse.json({ error: deleteError || 'Failed to delete from R2' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
}
