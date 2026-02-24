'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    AlertTriangle,
    CheckCircle2,
    Eye,
    Loader2,
    RefreshCw,
    Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

interface LoginStats {
    total: number
    successful: number
    failed: number
    successRate: number
}

interface LoginAttempt {
    id: number
    email: string
    ip_address: string
    user_agent: string | null
    success: boolean
    error_message: string | null
    created_at: string
}

export default function SecurityPage() {
    const [stats, setStats] = useState<LoginStats | null>(null)
    const [attempts, setAttempts] = useState<LoginAttempt[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSecurityData()
    }, [])

    const fetchSecurityData = async () => {
        setLoading(true)
        try {
            // Fetch stats
            const statsRes = await fetch('/api/admin/login-attempts?type=stats&days=7')
            if (statsRes.ok) {
                const statsData = await statsRes.json()
                setStats(statsData)
            }

            // Fetch recent attempts
            const attemptsRes = await fetch('/api/admin/login-attempts?type=attempts&limit=20')
            if (attemptsRes.ok) {
                const attemptsData = await attemptsRes.json()
                setAttempts(attemptsData.attempts || [])
            }

            toast.success('Security data updated')
        } catch (error) {
            toast.error('Failed to fetch security data')
        } finally {
            setLoading(false)
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
                    <p className="text-gray-600 mt-1">Monitor login activity & security</p>
                </div>
                <button
                    onClick={fetchSecurityData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading && !stats ? (
                <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Total Logins */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Login</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                        <p className="text-xs text-gray-500 mt-1">7 hari terakhir</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                        <Eye className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Successful */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Berhasil</p>
                                        <p className="text-3xl font-bold text-green-600 mt-1">{stats.successful}</p>
                                        <p className="text-xs text-gray-500 mt-1">{stats.successRate.toFixed(1)}% rate</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Failed */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Gagal</p>
                                        <p className="text-3xl font-bold text-red-600 mt-1">{stats.failed}</p>
                                        <p className="text-xs text-gray-500 mt-1">7 hari terakhir</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Security Score */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Security</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-1">
                                            {stats.successRate > 80 ? 'Good' : stats.successRate > 50 ? 'Fair' : 'Poor'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Status</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        stats.successRate > 80
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                            : stats.successRate > 50
                                                ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                                                : 'bg-gradient-to-br from-red-500 to-rose-500'
                                    }`}>
                                        <Shield className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Failed Attempts */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Recent Failed Login Attempts</h2>
                            <p className="text-sm text-gray-600 mt-1">Monitor suspicious activity</p>
                        </div>

                        {attempts.length === 0 ? (
                            <div className="p-12 text-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
                                <p className="text-gray-600">No failed login attempts recorded</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {attempts.map((attempt, idx) => (
                                            <motion.tr
                                                key={attempt.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-900">{attempt.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{attempt.ip_address}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(attempt.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-red-600">
                                                    {attempt.error_message || 'Failed login'}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Security Tips */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Security Best Practices</h3>
                                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                    <li>✅ Rate limiting enabled (5 attempts per 15 minutes)</li>
                                    <li>✅ Account lockout after multiple failed attempts</li>
                                    <li>✅ All login attempts logged for monitoring</li>
                                    <li>✅ Generic error messages to prevent user enumeration</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
