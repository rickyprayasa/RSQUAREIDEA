'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Lock,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2,
    Shield,
    Key,
    RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { calculatePasswordStrength, validatePasswordRequirements, generateStrongPassword } from '@/lib/password-strength'

export default function ChangePasswordPage() {
    const router = useRouter()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const passwordStrength = calculatePasswordStrength(newPassword)
    const passwordValidation = validatePasswordRequirements(newPassword)

    const generatePassword = () => {
        const newPassword = generateStrongPassword(16)
        setNewPassword(newPassword)
        setConfirmPassword(newPassword)
        toast.success('Password kuat telah dibuat!')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Password baru dan konfirmasi password tidak cocok')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.errors) {
                    setError(data.errors.join('. '))
                } else {
                    setError(data.error || 'Gagal mengubah password')
                }
                return
            }

            setSuccess(true)
            toast.success(data.message || 'Password berhasil diubah!')

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/admin/logout')
            }, 2000)
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Berhasil Diubah!</h2>
                    <p className="text-gray-600 mb-6">Anda akan dialihkan ke halaman login...</p>
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
                </motion.div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Ganti Password</h1>
                <p className="text-gray-600 mt-1">Ubah password admin Anda untuk keamanan lebih baik</p>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-8">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Tips Password Yang Kuat</h3>
                        <ul className="mt-2 space-y-1 text-sm text-gray-700">
                            <li>✅ Minimal 8 karakter (lebih baik 12+)</li>
                            <li>✅ Kombinasi huruf besar & kecil</li>
                            <li>✅ Gunakan angka dan karakter special</li>
                            <li>✅ Hindari kata-kata umum atau informasi pribadi</li>
                            <li>✅ Jangan gunakan password yang sama di tempat lain</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Current Password */}
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Password Saat Ini
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="currentPassword"
                                type={showCurrent ? 'text' : 'password'}
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                placeholder="Masukkan password saat ini"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showCurrent ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Password Baru
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="newPassword"
                                type={showNew ? 'text' : 'password'}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                placeholder="Masukkan password baru"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showNew ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>

                        {/* Password Strength Meter */}
                        {newPassword && (
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Kekuatan password:</span>
                                    <span className={`text-xs font-semibold ${
                                        passwordStrength.color === 'red' ? 'text-red-600' :
                                        passwordStrength.color === 'orange' ? 'text-orange-600' :
                                        passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                                        passwordStrength.color === 'lime' ? 'text-lime-600' :
                                        'text-green-600'
                                    }`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>

                                {/* Strength bar */}
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                                        transition={{ duration: 0.3 }}
                                        className={`h-full ${
                                            passwordStrength.color === 'red' ? 'bg-red-500' :
                                            passwordStrength.color === 'orange' ? 'bg-orange-500' :
                                            passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                                            passwordStrength.color === 'lime' ? 'bg-lime-500' :
                                            'bg-green-500'
                                        }`}
                                    />
                                </div>

                                {/* Validation checklist */}
                                {passwordValidation.errors.length > 0 && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-1">Persyaratan:</p>
                                        <ul className="space-y-0.5">
                                            {passwordValidation.errors.map((error, idx) => (
                                                <li key={idx} className="text-xs text-red-600 flex items-center gap-1">
                                                    <Lock className="h-3 w-3" />
                                                    {error}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Password strength feedback */}
                                {passwordStrength.feedback.length > 0 && passwordValidation.valid && (
                                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-blue-800">
                                            💡 Tips: {passwordStrength.feedback[0]}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Konfirmasi Password Baru
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="confirmPassword"
                                type={showConfirm ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                placeholder="Ulangi password baru"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showConfirm ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>

                        {/* Password match indicator */}
                        {confirmPassword && (
                            <div className={`mt-2 text-xs flex items-center gap-1 ${
                                newPassword === confirmPassword
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            }`}>
                                {newPassword === confirmPassword ? (
                                    <>
                                        <CheckCircle2 className="h-3 w-3" />
                                        Password cocok
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-3 w-3" />
                                        Password tidak cocok
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading || !currentPassword || !newPassword || !confirmPassword || !passwordValidation.valid || newPassword !== confirmPassword}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-semibold shadow-lg shadow-orange-200/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <Shield className="h-5 w-5" />
                                Ganti Password
                            </>
                        )}
                    </motion.button>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-sm text-yellow-800 flex items-start gap-2">
                            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                                <strong>Perhatian:</strong> Setelah password berhasil diubah, Anda akan di-logout dan harus login kembali dengan password baru.
                            </span>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
