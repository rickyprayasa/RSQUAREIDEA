'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User, ChevronDown } from 'lucide-react'

interface AdminHeaderProps {
    user: {
        id: number
        email: string
        name: string
        role: string
    }
}

export function AdminHeader({ user }: AdminHeaderProps) {
    const router = useRouter()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

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
