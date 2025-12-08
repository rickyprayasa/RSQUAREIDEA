import { createClient } from './server'

export type StorageBucket = 'products' | 'payments' | 'thumbnails'

export async function uploadImage(
    file: File,
    bucket: StorageBucket,
    folder?: string
): Promise<{ url: string; path: string } | { error: string }> {
    const supabase = await createClient()

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        })

    if (error) {
        console.error('Upload error:', error)
        return { error: error.message }
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

    return { url: publicUrl, path: filePath }
}

export async function deleteImage(
    path: string,
    bucket: StorageBucket
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

    if (error) {
        console.error('Delete error:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

export function getPublicUrl(path: string, bucket: StorageBucket): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

export function getPathFromUrl(url: string, bucket: StorageBucket): string | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const prefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/`
    
    if (url.startsWith(prefix)) {
        return url.replace(prefix, '')
    }
    return null
}
