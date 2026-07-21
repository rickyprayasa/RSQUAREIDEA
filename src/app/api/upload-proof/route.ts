import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/cloudflare/r2'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
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
        const fileName = `qris/proofs/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`

        // Upload to Cloudflare R2
        const buffer = Buffer.from(await file.arrayBuffer())
        const { success, error, path: r2Path } = await uploadToR2(buffer, fileName, file.type, 'private')

        if (!success) {
            console.error('R2 Upload error:', error)
            return NextResponse.json({ error: error || 'Failed to upload proof' }, { status: 500 })
        }

        // We return the path for private bucket. 
        // The QRIS confirmation logic in /api/qris-confirmation/route.ts will save this path.
        // It shouldn't be publicly accessible. Admin view will need a way to get signed URL later,
        // or just rely on backend proxy. But for now, we just save the path.
        return NextResponse.json({ 
            url: r2Path, // Use path as URL so frontend logic works (frontend expects url or path)
            path: r2Path,
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
