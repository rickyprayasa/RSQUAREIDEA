'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Save, Shield, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function WorkspaceSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: ''
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/auth/session')
                const data = await res.json()
                if (data.authenticated && data.user) {
                    setProfile({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        role: data.user.role || ''
                    })
                } else {
                    router.push('/login')
                }
            } catch (error) {
                console.error('Error fetching profile', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [router])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ text: '', type: '' })

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: profile.name })
            })
            const data = await res.json()
            
            if (data.success) {
                setMessage({ text: 'Profil berhasil diperbarui.', type: 'success' })
            } else {
                setMessage({ text: data.error || 'Gagal memperbarui profil.', type: 'error' })
            }
        } catch (error) {
            setMessage({ text: 'Terjadi kesalahan server.', type: 'error' })
        } finally {
            setSaving(false)
            // Auto hide message
            setTimeout(() => setMessage({ text: '', type: '' }), 3000)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pengaturan Profil</h1>
                <p className="text-gray-500 mt-1">Konfigurasi akun dan informasi profil Anda.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <User className="h-5 w-5 text-orange-500" /> Informasi Pribadi
                    </h2>
                    
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                placeholder="Masukkan nama lengkap Anda"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Email tidak dapat diubah karena terhubung dengan akun utama.</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Peran (Role)</label>
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.role.toUpperCase()}
                                    disabled
                                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl cursor-not-allowed font-medium"
                                />
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {message.type === 'success' ? <Shield className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                {message.text}
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={saving || !profile.name.trim()}
                                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </motion.div>
                
                {/* Right Column: Info / Avatar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col items-center text-center h-fit"
                >
                    <div className="h-24 w-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mb-4 border border-orange-200 shadow-inner">
                        <span className="text-3xl font-black text-orange-500">
                            {profile.name ? profile.name.substring(0, 2).toUpperCase() : 'PM'}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{profile.name || 'Pengguna'}</h3>
                    <p className="text-sm text-gray-500 mb-6">{profile.email}</p>
                    
                    <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 leading-relaxed text-left">
                            <strong>Penting:</strong> Pembaruan kata sandi saat ini hanya dapat dilakukan melalui Administrator sistem. Silakan hubungi tim IT jika Anda kehilangan akses.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
