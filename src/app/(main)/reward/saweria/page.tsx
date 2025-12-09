'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Coffee, Download, Gift, Heart, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

interface RewardData {
    enabled: boolean
    minDonation?: number
    message?: string
    product?: {
        id: number
        title: string
        description: string
        image: string
        downloadUrl: string
    }
    error?: string
}

export default function SaweriaRewardPage() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<RewardData | null>(null)
    const [downloaded, setDownloaded] = useState(false)

    useEffect(() => {
        fetch('/api/saweria-reward')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleDownload = () => {
        if (data?.product?.downloadUrl) {
            window.open(data.product.downloadUrl, '_blank')
            setDownloaded(true)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-yellow-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Memuat...</p>
                </div>
            </div>
        )
    }

    if (!data?.enabled) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Reward Tidak Tersedia</h1>
                    <p className="text-gray-600 mb-6">{data?.error || 'Maaf, reward Saweria saat ini tidak tersedia.'}</p>
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Beranda
                    </Link>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-6">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center gap-3">
                        <Coffee className="h-8 w-8" />
                        <h1 className="text-2xl font-bold">Saweria Reward</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8 md:py-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    {/* Thank You Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                            >
                                <Heart className="h-10 w-10 text-red-500" fill="currentColor" />
                            </motion.div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Terima Kasih!</h2>
                            <p className="text-yellow-100">Atas dukungan Kamu melalui Saweria</p>
                        </div>

                        <div className="p-6 md:p-8">
                            <p className="text-gray-700 text-center text-lg mb-8">
                                {data.message}
                            </p>

                            {/* Product Card */}
                            {data.product && (
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 md:p-6 border border-yellow-200">
                                    <div className="flex flex-col md:flex-row gap-4 items-center">
                                        {data.product.image && (
                                            <div className="w-full md:w-32 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={data.product.image}
                                                    alt={data.product.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                <Gift className="h-5 w-5 text-yellow-600" />
                                                <span className="text-sm font-medium text-yellow-600 uppercase tracking-wide">Hadiah Gratis</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{data.product.title}</h3>
                                            {data.product.description && (
                                                <p className="text-gray-600 text-sm line-clamp-2">{data.product.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <motion.button
                                            onClick={handleDownload}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                                                downloaded
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-orange-200'
                                            }`}
                                        >
                                            <Download className="h-6 w-6" />
                                            {downloaded ? 'Download Dimulai!' : 'Download Sekarang'}
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="text-center text-gray-500 text-sm">
                        <p>Hadiah untuk donasi minimal Rp {data.minDonation?.toLocaleString('id-ID')}</p>
                        <p className="mt-2">
                            Lihat template lainnya di{' '}
                            <Link href="/templates" className="text-orange-500 hover:underline font-medium">
                                RSQUARE Templates
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
