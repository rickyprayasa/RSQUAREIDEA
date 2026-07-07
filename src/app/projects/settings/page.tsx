'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Save, Shield, Loader2, AlertCircle, Key, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { calculatePasswordStrength, validatePasswordRequirements } from '@/lib/password-strength'

export default function WorkspaceSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: '',
        avatar_url: ''
    })
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    // Password State
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [pwdLoading, setPwdLoading] = useState(false)
    const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' })

    const passwordStrength = calculatePasswordStrength(newPassword)
    const passwordValidation = validatePasswordRequirements(newPassword)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/auth/session')
                const data = await res.json()
                if (data.authenticated && data.user) {
                    setProfile({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        role: data.user.role || '',
                        avatar_url: data.user.avatar_url || ''
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
                body: JSON.stringify({ name: profile.name, avatar_url: profile.avatar_url })
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

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingAvatar(true)
        setMessage({ text: '', type: '' })

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('bucket', 'thumbnails')
            formData.append('folder', 'avatars')

            const uploadRes = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            })
            const uploadData = await uploadRes.json()

            if (!uploadRes.ok) throw new Error(uploadData.error || 'Gagal upload foto')

            const newAvatarUrl = uploadData.url

            // Update profile
            const res = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: profile.name, avatar_url: newAvatarUrl })
            })
            const data = await res.json()
            
            if (data.success) {
                setProfile({ ...profile, avatar_url: newAvatarUrl })
                setMessage({ text: 'Foto profil berhasil diperbarui.', type: 'success' })
            } else {
                throw new Error(data.error || 'Gagal menyimpan foto profil')
            }
        } catch (error: any) {
            setMessage({ text: error.message || 'Terjadi kesalahan.', type: 'error' })
        } finally {
            setUploadingAvatar(false)
            setTimeout(() => setMessage({ text: '', type: '' }), 3000)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setPwdMessage({ text: '', type: '' })
        setPwdLoading(true)

        if (newPassword !== confirmPassword) {
            setPwdMessage({ text: 'Password baru dan konfirmasi password tidak cocok', type: 'error' })
            setPwdLoading(false)
            return
        }

        try {
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.errors) {
                    setPwdMessage({ text: data.errors.join('. '), type: 'error' })
                } else {
                    setPwdMessage({ text: data.error || 'Gagal mengubah password', type: 'error' })
                }
                return
            }

            setPwdMessage({ text: data.message || 'Password berhasil diubah!', type: 'success' })
            
            // Redirect to login after a short delay since session is cleared
            setTimeout(() => {
                router.push('/api/auth/logout') // or whatever route logs them out
            }, 2000)
        } catch (err) {
            setPwdMessage({ text: 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' })
        } finally {
            setPwdLoading(false)
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Avatar & Profile Form */}
                <div className="space-y-8">
                    {/* Horizontal Avatar Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6"
                    >
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200 shadow-inner overflow-hidden relative">
                                {uploadingAvatar ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                                ) : profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <img src="/images/rsquare-logo.png" alt="Logo" className="w-full h-full object-contain p-2" />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold">Ubah</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                id="avatar-upload" 
                                accept="image/png, image/jpeg, image/webp" 
                                className="hidden" 
                                onChange={handleAvatarUpload}
                                disabled={uploadingAvatar}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{profile.name || 'Pengguna'}</h3>
                            <p className="text-sm text-gray-500 mb-2">{profile.email}</p>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
                                <Shield className="h-3 w-3" />
                                {profile.role.toUpperCase()}
                            </span>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
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
                </div>
                
                {/* Right Column: Change Password & Tips */}
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
                    >
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Key className="h-5 w-5 text-orange-500" /> Ganti Password
                    </h2>
                    
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="block w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                                    placeholder="Masukkan password saat ini"
                                />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    {showCurrent ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                                    placeholder="Masukkan password baru"
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    {showNew ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>

                            {newPassword && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">Kekuatan password:</span>
                                        <span className={`text-xs font-semibold ${
                                            passwordStrength.color === 'red' ? 'text-red-600' :
                                            passwordStrength.color === 'orange' ? 'text-orange-600' :
                                            passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                                            passwordStrength.color === 'lime' ? 'text-lime-600' : 'text-green-600'
                                        }`}>{passwordStrength.label}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                                            className={`h-full ${
                                                passwordStrength.color === 'red' ? 'bg-red-500' :
                                                passwordStrength.color === 'orange' ? 'bg-orange-500' :
                                                passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                                                passwordStrength.color === 'lime' ? 'bg-lime-500' : 'bg-green-500'
                                            }`}
                                        />
                                    </div>
                                    {passwordValidation.errors.length > 0 && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                            <ul className="space-y-0.5">
                                                {passwordValidation.errors.map((error, idx) => (
                                                    <li key={idx} className="text-xs text-red-600 flex items-center gap-1">
                                                        <Lock className="h-3 w-3" /> {error}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                                    placeholder="Ulangi password baru"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    {showConfirm ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                            {confirmPassword && (
                                <div className={`mt-2 text-xs flex items-center gap-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                    {newPassword === confirmPassword ? (
                                        <><CheckCircle2 className="h-3 w-3" /> Password cocok</>
                                    ) : (
                                        <><Lock className="h-3 w-3" /> Password tidak cocok</>
                                    )}
                                </div>
                            )}
                        </div>

                        {pwdMessage.text && (
                            <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-2 ${pwdMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {pwdMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
                                <span>{pwdMessage.text}</span>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword || !passwordValidation.valid || newPassword !== confirmPassword}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {pwdLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                                {pwdLoading ? 'Memproses...' : 'Ganti Password'}
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Security Tips */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full bg-blue-50 rounded-2xl p-6 border border-blue-100"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-sm text-blue-800 leading-relaxed text-left">
                            <strong>Keamanan Akun:</strong> Pastikan Anda menggunakan password yang kuat. Hindari kata sandi umum dan gunakan kombinasi huruf, angka, serta karakter unik. Jangan membagikan informasi ini kepada siapapun.
                        </p>
                    </div>
                </motion.div>
                </div>
            </div>
        </div>
    )
}
