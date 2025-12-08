'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User, ChevronDown, Bell, Mail, Star, FileSpreadsheet, QrCode, Check } from 'lucide-react'

interface Notification {
    id: number
    type: string
    title: string
    message: string | null
    link: string | null
    is_read: boolean
    created_at: string
}

interface AdminHeaderProps {
    user: {
        id: number
        email: string
        name: string
        role: string
    }
}

const typeIcons: Record<string, typeof Mail> = {
    contact: Mail,
    feedback: Star,
    template_request: FileSpreadsheet,
    payment: QrCode,
}

const typeColors: Record<string, string> = {
    contact: 'bg-pink-100 text-pink-600',
    feedback: 'bg-amber-100 text-amber-600',
    template_request: 'bg-green-100 text-green-600',
    payment: 'bg-purple-100 text-purple-600',
}

export function AdminHeader({ user }: AdminHeaderProps) {
    const router = useRouter()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/admin/notifications')
            const data = await res.json()
            if (data.notifications) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    const handleMarkRead = async (id: number) => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            fetchNotifications()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true }),
            })
            fetchNotifications()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleLogout = async () => {
        setLoggingOut(true)
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                <div className="lg:hidden w-10" />
                
                <div className="flex-1" />

                {/* Notifications */}
                <div className="relative mr-4">
                    <motion.button
                        onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Bell className="h-5 w-5 text-gray-600" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {notifOpen && (
                            <>
                                <motion.div 
                                    className="fixed inset-0 z-10"
                                    onClick={() => setNotifOpen(false)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                                <motion.div 
                                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                                            >
                                                Tandai semua dibaca
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                                            </div>
                                        ) : (
                                            notifications.slice(0, 10).map((notif) => {
                                                const Icon = typeIcons[notif.type] || Bell
                                                const colorClass = typeColors[notif.type] || 'bg-gray-100 text-gray-600'

                                                return (
                                                    <div
                                                        key={notif.id}
                                                        className={`flex items-start gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                                            !notif.is_read ? 'bg-orange-50/50' : ''
                                                        }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            {notif.link ? (
                                                                <Link
                                                                    href={notif.link}
                                                                    onClick={() => { handleMarkRead(notif.id); setNotifOpen(false); }}
                                                                    className="block"
                                                                >
                                                                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                                                    {notif.message && (
                                                                        <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                                                                    )}
                                                                </Link>
                                                            ) : (
                                                                <>
                                                                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                                                    {notif.message && (
                                                                        <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                                                                    )}
                                                                </>
                                                            )}
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </p>
                                                        </div>
                                                        {!notif.is_read && (
                                                            <button
                                                                onClick={() => handleMarkRead(notif.id)}
                                                                className="p-1 text-gray-400 hover:text-green-500"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative">
                    <motion.button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                        <motion.div
                            animate={{ rotate: dropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </motion.div>
                    </motion.button>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <>
                                <motion.div 
                                    className="fixed inset-0 z-10"
                                    onClick={() => setDropdownOpen(false)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                                <motion.div 
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="p-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {loggingOut ? 'Keluar...' : 'Keluar'}
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}
