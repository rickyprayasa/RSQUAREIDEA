'use client'

import { useState, useRef } from 'react'
import { X, Plus, Loader2, GripVertical } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useImageUpload } from '@/hooks/useImageUpload'
import { cn } from '@/lib/utils'

interface MultiImageUploadProps {
    value: string[]
    onChange: (urls: string[]) => void
    bucket?: 'products' | 'payments' | 'thumbnails'
    folder?: string
    maxImages?: number
    className?: string
}

export function MultiImageUpload({
    value = [],
    onChange,
    bucket = 'products',
    folder,
    maxImages = 10,
    className,
}: MultiImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

    const { upload, uploading } = useImageUpload({
        bucket,
        folder,
        onSuccess: (result) => {
            onChange([...value, result.url])
            setError(null)
        },
        onError: (err) => {
            setError(err)
        },
    })

    const handleFiles = async (files: FileList) => {
        const remaining = maxImages - value.length
        const filesToUpload = Array.from(files).slice(0, remaining)

        for (const file of filesToUpload) {
            if (file.type.startsWith('image/')) {
                await upload(file)
            }
        }
    }

    const handleRemove = (index: number) => {
        const newImages = value.filter((_, i) => i !== index)
        onChange(newImages)
    }

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        const newImages = [...value]
        const [draggedImage] = newImages.splice(draggedIndex, 1)
        newImages.splice(index, 0, draggedImage)
        onChange(newImages)
        setDraggedIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
    }

    return (
        <div className={cn('space-y-3', className)}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {value.map((url, index) => (
                    <div
                        key={url}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                            'relative aspect-video rounded-lg overflow-hidden border-2 group cursor-move',
                            draggedIndex === index ? 'border-orange-500 opacity-50' : 'border-gray-200'
                        )}
                    >
                        <Image
                            src={url}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRemove(index)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-5 h-5 text-white drop-shadow" />
                        </div>
                        {index === 0 && (
                            <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">
                                Cover
                            </div>
                        )}
                    </div>
                ))}

                {value.length < maxImages && (
                    <button
                        type="button"
                        className={cn(
                            'aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors',
                            uploading && 'pointer-events-none opacity-50'
                        )}
                        onClick={() => inputRef.current?.click()}
                    >
                        {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Plus className="w-6 h-6" />
                                <span className="text-xs">Add Image</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <p className="text-xs text-gray-500">
                {value.length}/{maxImages} images. Drag to reorder. First image is cover.
            </p>
        </div>
    )
}
