'use client'

import { useState } from 'react'

type Bucket = 'products' | 'payments' | 'thumbnails'

interface UploadResult {
    url: string
    path: string
    bucket: string
}

interface UseImageUploadOptions {
    bucket?: Bucket
    folder?: string
    onSuccess?: (result: UploadResult) => void
    onError?: (error: string) => void
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
    const { bucket = 'products', folder, onSuccess, onError } = options
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const upload = async (file: File): Promise<UploadResult | null> => {
        setUploading(true)
        setProgress(0)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('bucket', bucket)
            if (folder) {
                formData.append('folder', folder)
            }

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            setProgress(100)
            onSuccess?.(data)
            return data
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Upload failed'
            onError?.(message)
            return null
        } finally {
            setUploading(false)
        }
    }

    const deleteImage = async (path: string, bucketName: Bucket = bucket): Promise<boolean> => {
        try {
            const response = await fetch('/api/admin/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, bucket: bucketName }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Delete failed')
            }

            return true
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Delete failed'
            onError?.(message)
            return false
        }
    }

    return {
        upload,
        deleteImage,
        uploading,
        progress,
    }
}
