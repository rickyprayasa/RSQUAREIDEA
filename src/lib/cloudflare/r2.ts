import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const publicBucket = process.env.R2_PUBLIC_BUCKET_NAME || 'rsquare-public'
const privateBucket = process.env.R2_PRIVATE_BUCKET_NAME || 'rsquare-private'
const publicUrl = process.env.R2_PUBLIC_URL

// Check credentials before initializing
const hasCredentials = Boolean(accountId && accessKeyId && secretAccessKey)

export const r2Client = hasCredentials ? new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
    },
    forcePathStyle: true,
}) : null

export type R2BucketType = 'public' | 'private'

export async function uploadToR2(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    bucketType: R2BucketType = 'public'
): Promise<{ success: boolean; path?: string; error?: string }> {
    if (!r2Client) {
        return { success: false, error: 'R2 Client is not configured. Missing credentials in env.' }
    }

    const bucketName = bucketType === 'public' ? publicBucket : privateBucket

    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: contentType,
            // Cache immutable for public assets
            ...(bucketType === 'public' && { CacheControl: 'public, max-age=31536000, immutable' })
        })

        await r2Client.send(command)
        return { success: true, path: fileName }
    } catch (error: any) {
        console.error('R2 Upload error:', error)
        return { success: false, error: error.message || 'Failed to upload to R2' }
    }
}

export async function deleteFromR2(
    fileName: string,
    bucketType: R2BucketType = 'public'
): Promise<{ success: boolean; error?: string }> {
    if (!r2Client) {
        return { success: false, error: 'R2 Client is not configured.' }
    }

    const bucketName = bucketType === 'public' ? publicBucket : privateBucket

    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileName,
        })

        await r2Client.send(command)
        return { success: true }
    } catch (error: any) {
        console.error('R2 Delete error:', error)
        return { success: false, error: error.message || 'Failed to delete from R2' }
    }
}

export function getR2PublicUrl(path: string): string {
    if (!publicUrl) {
        console.warn('R2_PUBLIC_URL is not set. Returning path only.')
        return path
    }
    
    // Ensure no double slashes between domain and path
    const normalizedUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path

    return `${normalizedUrl}/${normalizedPath}`
}
