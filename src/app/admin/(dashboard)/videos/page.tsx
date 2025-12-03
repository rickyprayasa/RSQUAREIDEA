import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Play, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { DeleteVideoButton } from '@/components/admin/DeleteVideoButton'

async function getVideos() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('video_tutorials')
        .select('*')
        .order('order', { ascending: true })
    return data || []
}

function getYouTubeId(url: string) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)
    return match ? match[1] : null
}

export default async function VideosPage() {
    const videos = await getVideos()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Video Tutorial</h1>
                    <p className="text-gray-500 mt-1">Kelola video tutorial YouTube untuk halaman beranda</p>
                </div>
                <Link
                    href="/admin/videos/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium transition-colors shadow-lg shadow-orange-500/25"
                >
                    <Plus className="h-5 w-5" />
                    Tambah Video
                </Link>
            </div>

            {videos.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Play className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada video</h3>
                    <p className="text-gray-500 mb-6">Tambahkan video tutorial pertama Anda</p>
                    <Link
                        href="/admin/videos/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Video
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => {
                        const videoId = getYouTubeId(video.youtube_url)
                        const thumbnail = video.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null)

                        return (
                            <div
                                key={video.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
                            >
                                <div className="relative aspect-video bg-gray-100">
                                    {thumbnail && (
                                        <img
                                            src={thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <a
                                            href={video.youtube_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                        >
                                            <ExternalLink className="w-5 h-5 text-gray-700" />
                                        </a>
                                    </div>
                                    {video.duration && (
                                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                                            {video.duration}
                                        </div>
                                    )}
                                    {!video.is_active && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-gray-800 rounded text-xs text-white">
                                            Nonaktif
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                                        {video.title}
                                    </h3>
                                    {video.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                            {video.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <span className="text-xs text-gray-400">
                                            Urutan: {video.order}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Link
                                                href={`/admin/videos/${video.id}`}
                                                className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <DeleteVideoButton id={video.id} title={video.title} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
