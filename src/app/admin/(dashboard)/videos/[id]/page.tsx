import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VideoForm } from '@/components/admin/VideoForm'

async function getVideo(id: number) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('video_tutorials')
        .select('*')
        .eq('id', id)
        .single()
    return data
}

export default async function EditVideoPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params
    const videoId = parseInt(id)
    
    if (isNaN(videoId)) {
        notFound()
    }

    const video = await getVideo(videoId)

    if (!video) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Edit Video Tutorial</h1>
                <p className="text-gray-500 mt-1">Perbarui informasi video: {video.title}</p>
            </div>
            
            <VideoForm video={video} />
        </div>
    )
}
