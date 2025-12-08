'use client'

import { useState, useRef } from 'react'
import { X, Image as ImageIcon, Loader2, Upload } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useImageUpload } from '@/hooks/useImageUpload'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    onRemove?: () => void
    bucket?: 'products' | 'payments' | 'thumbnails'
    folder?: string
    className?: string
    aspectRatio?: 'square' | 'video' | 'wide'
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    bucket = 'products',
    folder,
    className,
    aspectRatio = 'video',
}: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { upload, uploading } = useImageUpload({
        bucket,
        folder,
        onSuccess: (result) => {
            onChange(result.url)
            setError(null)
        },
        onError: (err) => {
            setError(err)
        },
    })

    const handleFile = async (file: File) => {
        setError(null)
        await upload(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)

        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            handleFile(file)
        } else {
            setError('Please upload an image file')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFile(file)
        }
    }

    const aspectClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        wide: 'aspect-[21/9]',
    }

    return (
        <div className={cn('space-y-2', className)}>
            <div
                className={cn(
                    'relative border-2 border-dashed rounded-lg overflow-hidden transition-colors',
                    aspectClasses[aspectRatio],
                    dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300',
                    uploading && 'pointer-events-none opacity-70'
                )}
                onDragOver={(e) => {
                    e.preventDefault()
                    setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
            >
                {value ? (
                    <>
                        <Image
                            src={value}
                            alt="Uploaded"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => inputRef.current?.click()}
                            >
                                Ganti
                            </Button>
                            {onRemove && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={onRemove}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <button
                        type="button"
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => inputRef.current?.click()}
                    >
                        {uploading ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    {dragActive ? (
                                        <Upload className="w-6 h-6" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6" />
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="font-medium">
                                        {dragActive ? 'Drop image here' : 'Click or drag to upload'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        PNG, JPG, WebP up to 5MB
                                    </p>
                                </div>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleChange}
            />

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    )
}
