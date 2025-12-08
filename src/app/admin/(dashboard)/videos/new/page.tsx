import { VideoForm } from '@/components/admin/VideoForm'

export default function NewVideoPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tambah Video Tutorial</h1>
                <p className="text-gray-500 mt-1">Tambahkan video tutorial YouTube baru</p>
            </div>
            
            <VideoForm />
        </div>
    )
}
