'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Settings, LogOut, Bell, Search, Loader2 } from 'lucide-react'

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

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
        { name: 'My Tasks', href: '/projects/tasks', icon: CheckSquare },
        { name: 'Settings', href: '/projects/settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center justify-between px-6 h-16">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/projects" className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm tracking-wider">PM</span>
                            </div>
                            <span className="font-bold text-gray-900 hidden sm:block tracking-tight text-lg">Project Management</span>
                        </Link>

                        {/* Search (Placeholder) */}
                        <div className="hidden md:flex items-center bg-gray-100/80 rounded-lg px-4 py-2 w-80 border border-gray-200 transition-colors focus-within:bg-white focus-within:border-gray-300">
                            <Search className="h-4.5 w-4.5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Cari task, project..." 
                                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <button className="text-gray-400 hover:text-gray-700 relative p-2 transition-colors rounded-full hover:bg-gray-100">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        
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
                <aside className="w-20 sm:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col transition-all duration-300">
                    <nav className="flex-1 py-6 px-3 space-y-1.5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/projects' && pathname.startsWith(item.href))
                            return (
                                <Link 
                                    key={item.name} 
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-gray-900 text-white shadow-md' 
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    <span className="ml-3.5 font-medium hidden sm:block text-sm">{item.name}</span>
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
