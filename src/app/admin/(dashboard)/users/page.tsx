'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, Users, Mail, Shield, AlertTriangle, Edit2, Trash2, X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        role: 'staff',
        password: ''
    })

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff'
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/users')
            const data = await res.json()
            if (res.ok && data.success) {
                setUsers(data.users)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!form.email.endsWith('@rsquareidea.my.id')) {
            showToast('Email harus menggunakan domain @rsquareidea.my.id', 'error')
            return
        }

        setIsCreating(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()

            if (res.ok && data.success) {
                showToast('Akun berhasil dibuat!', 'success')
                setShowModal(false)
                setForm({ name: '', email: '', password: '', role: 'staff' })
                fetchUsers()
            } else {
                showToast(data.error || 'Gagal membuat akun', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan', 'error')
        } finally {
            setIsCreating(false)
        }
    }

    const handleEditClick = (user: any) => {
        setSelectedUser(user)
        setEditForm({
            name: user.name || '',
            role: user.role || 'staff',
            password: ''
        })
        setShowEditModal(true)
    }

    const handleDeleteClick = (user: any) => {
        setSelectedUser(user)
        setShowDeleteConfirm(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedUser.id,
                    name: editForm.name,
                    role: editForm.role,
                    password: editForm.password
                })
            })
            const data = await res.json()
            if (res.ok && data.success) {
                showToast('Akun berhasil diperbarui!', 'success')
                setShowEditModal(false)
                fetchUsers()
            } else {
                showToast(data.error || 'Gagal memperbarui akun', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan', 'error')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteSubmit = async () => {
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/users?id=${selectedUser.id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (res.ok && data.success) {
                showToast('Akun berhasil dihapus!', 'success')
                setShowDeleteConfirm(false)
                fetchUsers()
            } else {
                showToast(data.error || 'Gagal menghapus akun', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan', 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {toast.show && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-2xl text-white font-medium ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {toast.message}
                </motion.div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-6 w-6" /> Manajemen Tim
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola akses akun internal RSQUARE</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200/50"
                >
                    <Plus className="h-5 w-5" />
                    Tambah Karyawan
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-medium">
                            <th className="py-4 px-6">NAMA & EMAIL</th>
                            <th className="py-4 px-6">ROLE</th>
                            <th className="py-4 px-6 text-right">AKSI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        user.role === 'admin' || user.role === 'superadmin' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {user.role === 'pm' ? 'Project Manager' : user.role === 'staff' ? 'Staff' : 'Admin'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="inline-flex items-center gap-1.5">
                                        <button 
                                            onClick={() => handleEditClick(user)}
                                            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
                                            title="Edit Karyawan"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(user)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Hapus Karyawan"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-orange-500" />
                                Registrasi Akun Internal
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        
                        <div className="p-6">
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm mb-6 flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                <p>Hanya alamat email dengan domain <strong>@rsquareidea.my.id</strong> yang diizinkan untuk mendaftar ke sistem ini.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        placeholder="Misal: Ricky Yusar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Perusahaan</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        placeholder="ricky.yusar@rsquareidea.my.id"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        placeholder="Minimal 6 karakter"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role / Jabatan</label>
                                    <select
                                        value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    >
                                        <option value="staff">Staff / Anggota Tim</option>
                                        <option value="pm">Project Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-xl"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 shadow-md disabled:opacity-50"
                                    >
                                        {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                                        Buat Akun
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Edit2 className="h-5 w-5 text-orange-500" />
                                Edit Akun Anggota Tim
                            </h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        
                        <div className="p-6">
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Perusahaan</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={selectedUser.email}
                                        className="w-full px-4 py-2 border border-gray-150 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru (Opsional)</label>
                                    <input
                                        type="password"
                                        minLength={6}
                                        value={editForm.password}
                                        onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900"
                                        placeholder="Kosongkan jika tidak ingin mengubah"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role / Jabatan</label>
                                    <select
                                        value={editForm.role}
                                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900"
                                    >
                                        <option value="staff">Staff / Anggota Tim</option>
                                        <option value="pm">Project Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-xl"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 shadow-md disabled:opacity-50"
                                    >
                                        {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {showDeleteConfirm && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-red-100"
                    >
                        <div className="px-6 py-4 border-b border-red-50 flex items-center justify-between bg-red-50/50">
                            <h3 className="font-bold text-red-950 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Hapus Anggota Tim
                            </h3>
                            <button onClick={() => setShowDeleteConfirm(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Apakah Anda yakin ingin menghapus akun <span className="font-bold text-gray-900">{selectedUser.name}</span> ({selectedUser.email})? Aksi ini akan menghapus semua hak akses dan tidak dapat dibatalkan.
                            </p>
                            
                            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeleteSubmit}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 shadow-md disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                                    Hapus Akun
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
