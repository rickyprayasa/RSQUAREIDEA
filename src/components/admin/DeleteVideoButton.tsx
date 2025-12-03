'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

interface DeleteVideoButtonProps {
    id: number
    title: string
}

export function DeleteVideoButton({ id, title }: DeleteVideoButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`Hapus video "${title}"?`)) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/videos/${id}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                throw new Error('Gagal menghapus video')
            }

            router.refresh()
        } catch (error) {
            alert('Gagal menghapus video')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </button>
    )
}
