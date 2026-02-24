'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    Eye,
    EyeOff,
    Laptop,
    Calendar,
    MapPin,
    Trash2,
    Loader2,
    RefreshCw,
    CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { getUserSessions, revokeAllOtherSessions, formatSessionDuration } from '@/lib/session'

interface Session {
    userId: string
    email: string
    role: string
    createdAt: string
    lastActive: string
    ipAddress?: string
    userAgent?: string
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [revoking, setRevoking] = useState(false)

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        setLoading(true)
        try {
            // For now, we'll get current session info
            const response = await fetch('/api/admin/sessions')
            if (response.ok) {
                const data = await response.json()
                setSessions(data.sessions || [])
            }
        } catch (error) {
            toast.error('Failed to fetch sessions')
        } finally {
            setLoading(false)
        }
    }

    const handleRevokeAll = async () => {
        if (!confirm('Apakah Anda yakin ingin mencabut semua session lain?')) {
            return
        }

        setRevoking(true)
        try {
            const response = await fetch('/api/admin/sessions/revoke', {
                method: 'POST',
            })

            if (response.ok) {
                toast.success('Semua session lain berhasil dicabut')
                fetchSessions()
            } else {
                const data = await response.json()
                toast.error(data.message || 'Gagal mencabut session')
            }
        } catch (error) {
            toast.error('Terjadi kesalahan')
        } finally {
            setRevoking(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
    }

    const getDeviceIcon = (userAgent?: string) => {
        if (!userAgent) return <Laptop className="w-4 h-4" />

        const ua = userAgent.toLowerCase()
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return <div className="w-4 h-4 text-blue-500" title="Mobile">📱</div>
        }
        return <Laptop className="w-4 h-4" />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
                    <p className="text-gray-600 mt-1">Kelola session login Anda</p>
                </div>
                <button
                    onClick={fetchSessions}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Session Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Session Information</h3>
                        <p className="text-sm text-gray-700 mt-1">
                            Saat ini Anda memiliki <strong>{sessions.length}</strong> session aktif.
                            Sesi akan otomatis logout setelah 24 jam tidak aktif.
                        </p>
                    </div>
                </div>
            </div>

            {/* Revoke All Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleRevokeAll}
                    disabled={revoking || sessions.length <= 1}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {revoking ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            <Trash2 className="w-4 h-4" />
                            Cabut Semua Session Lain
                        </>
                    )}
                </button>
            </div>

            {/* Sessions List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                    <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada session aktif</h3>
                    <p className="text-gray-600">Anda belum login di device manapun</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">Active Sessions</h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {sessions.map((session, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        {getDeviceIcon(session.userAgent)}
                                    </div>

                                    <div>
                                        <p className="font-semibold text-gray-900">{session.email}</p>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Last active: {formatDate(session.lastActive)}
                                            </span>
                                            {session.ipAddress && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {session.ipAddress}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {idx === 0 ? (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                            Current
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Security Tips */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Security Best Practices</h3>
                        <ul className="mt-2 space-y-1 text-sm text-gray-700">
                            <li>✅ Session otomatis logout setelah 24 jam tidak aktif</li>
                            <li>✅ Maksimal 3 concurrent session per user</li>
                            <li>✅ Cabut session dari device yang tidak dikenali</li>
                            <li>✅ Ganti password secara berkala</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
