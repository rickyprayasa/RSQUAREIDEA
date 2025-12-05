import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

        const supabase = await createClient()

        // Generate unique filename
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const fileName = `proofs/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('qris')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('qris')
            .getPublicUrl(fileName)

        return NextResponse.json({ 
            url: publicUrl, 
            path: fileName,
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
