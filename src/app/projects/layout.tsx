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
            const res = await fetch('/api/admin/me') 
            const data = await res.json()
            if (data.user) {
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="flex items-center justify-between px-4 h-14">
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <Link href="/projects" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-sm">PM</span>
                            </div>
                            <span className="font-bold text-gray-900 hidden sm:block">RSQUARE Workspace</span>
                        </Link>

                        {/* Search (Placeholder) */}
                        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1.5 w-64">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Cari task, project..." 
                                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-gray-500 hover:text-gray-700 relative p-1.5">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        
                        <div className="h-6 w-px bg-gray-200"></div>
                        
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200">
                                U
                            </div>
                            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors p-1.5" title="Logout">
                                <LogOut className="h-4.5 w-4.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Minimalist Sidebar */}
                <aside className="w-16 sm:w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col transition-all duration-300">
                    <nav className="flex-1 py-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/projects' && pathname.startsWith(item.href))
                            return (
                                <Link 
                                    key={item.name} 
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                                        isActive 
                                            ? 'bg-indigo-600 text-white' 
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    <span className="ml-3 font-medium hidden sm:block">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}
