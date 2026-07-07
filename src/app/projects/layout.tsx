'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Settings, LogOut, Bell, Search, Loader2, Check, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [notifications, setNotifications] = useState<any[]>([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

    useEffect(() => {
        checkAuth()
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/admin/notifications')
            const data = await res.json()
            if (data.notifications) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error)
        }
    }

    const markAllRead = async () => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true })
            })
            setUnreadCount(0)
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
            setShowNotifications(false)
        } catch (error) {
            console.error('Failed to mark notifications as read', error)
        }
    }

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/projects/search?q=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/session')
            const data = await res.json()
            if (data.authenticated && data.user) {
                setUser(data.user)
                if (!['admin', 'superadmin', 'pm', 'staff'].includes(data.user.role)) {
                    router.push('/admin/login')
                }
            } else {
                router.push('/admin/login')
            }
        } catch {
            router.push('/admin/login')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/admin/login')
        router.refresh()
    }

    const navItems = [
        { name: 'Dashboard', href: '/projects', icon: LayoutDashboard },
        { name: 'Tasks', href: '/projects/tasks', icon: CheckSquare },
        { name: 'Settings', href: '/projects/settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center justify-between px-6 h-16">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
                                title="Toggle Sidebar"
                            >
                                {isSidebarExpanded ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
                            </button>
                            {/* Logo */}
                            <Link href="/projects" className="flex items-center gap-3 ml-2">
                                <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-sm tracking-wider">PM</span>
                                </div>
                                <span className="font-bold text-gray-900 hidden md:block tracking-tight text-lg">Project Management</span>
                            </Link>
                        </div>

                        {/* Search (Placeholder) */}
                        <div className="hidden md:flex items-center bg-gray-100/80 rounded-lg px-4 py-2 w-80 border border-gray-200 transition-colors focus-within:bg-white focus-within:border-gray-300">
                            <Search className="h-4.5 w-4.5 text-gray-400" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                placeholder="Cari task, project... (Enter)" 
                                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="text-gray-400 hover:text-gray-700 relative p-2 transition-colors rounded-full hover:bg-gray-100"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>
                            
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                    >
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                            <h3 className="font-bold text-gray-900">Notifikasi</h3>
                                            {unreadCount > 0 && (
                                                <button 
                                                    onClick={markAllRead}
                                                    className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md transition-colors"
                                                >
                                                    <Check className="h-3 w-3" /> Tandai Semua
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[360px] overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                <div className="divide-y divide-gray-50">
                                                    {notifications.map((notif) => (
                                                        <div key={notif.id} className={`p-4 transition-colors hover:bg-gray-50 ${!notif.is_read ? 'bg-orange-50/30' : ''}`}>
                                                            <div className="flex gap-3">
                                                                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!notif.is_read ? 'bg-orange-500' : 'bg-gray-300'}`} />
                                                                <div>
                                                                    <p className="text-sm text-gray-800 leading-snug">{notif.message}</p>
                                                                    <p className="text-xs text-gray-400 mt-1.5 font-medium">
                                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center flex flex-col items-center">
                                                    <Bell className="h-8 w-8 text-gray-300 mb-2" />
                                                    <p className="text-sm text-gray-500 font-medium">Tidak ada notifikasi baru</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <div className="h-6 w-px bg-gray-200"></div>
                        
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-sm border border-orange-200 shadow-sm">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="hidden sm:block text-left mr-2">
                                <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 font-medium">{user?.role === 'pm' ? 'Project Manager' : user?.role || 'Staff'}</p>
                            </div>
                            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50" title="Logout">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Minimalist Sidebar */}
                <aside className={`bg-white border-r border-gray-200 flex-shrink-0 flex flex-col transition-all duration-300 z-20 ${isSidebarExpanded ? 'w-64 absolute sm:relative h-full shadow-2xl sm:shadow-none' : 'w-20 hidden sm:flex'}`}>
                    <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/projects' && pathname.startsWith(item.href))
                            return (
                                <Link 
                                    key={item.name} 
                                    href={item.href}
                                    title={!isSidebarExpanded ? item.name : undefined}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-gray-900 text-white shadow-md' 
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                    } ${!isSidebarExpanded ? 'justify-center px-0' : ''}`}
                                >
                                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    {isSidebarExpanded && (
                                        <span className="ml-3.5 font-medium text-sm whitespace-nowrap">{item.name}</span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
