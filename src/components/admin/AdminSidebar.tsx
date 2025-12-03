'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    LayoutDashboard, 
    Package, 
    CreditCard, 
    FolderOpen,
    Settings,
    ShoppingCart,
    Play,
    X,
    Menu,
    ArrowLeft,
    type LucideIcon
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
    name: string
    href: string
    icon: LucideIcon
    color: string
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500' },
    { name: 'Produk', href: '/admin/products', icon: Package, color: 'from-orange-500 to-amber-500' },
    { name: 'Kategori', href: '/admin/categories', icon: FolderOpen, color: 'from-green-500 to-emerald-500' },
    { name: 'Video Tutorial', href: '/admin/videos', icon: Play, color: 'from-red-500 to-pink-500' },
    { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart, color: 'from-purple-500 to-violet-500' },
    { name: 'Pembayaran', href: '/admin/payments', icon: CreditCard, color: 'from-teal-500 to-cyan-500' },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings, color: 'from-gray-500 to-slate-500' },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <span className="text-white font-bold text-lg">R</span>
                </div>
                <div>
                    <span className="text-white font-bold text-lg">RSQUARE</span>
                    <p className="text-gray-400 text-xs">Admin Panel</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || 
                        (item.href !== '/admin' && pathname.startsWith(item.href))
                    const isHovered = hoveredItem === item.name
                    
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            prefetch={true}
                            onClick={() => setMobileOpen(false)}
                            onMouseEnter={() => setHoveredItem(item.name)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className="relative block"
                        >
                            <motion.div
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors relative overflow-hidden ${
                                    isActive
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                            >
                                {/* Active/Hover Background */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeBg"
                                        className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl`}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                
                                {/* Hover Glow */}
                                {!isActive && isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-gray-800 rounded-xl"
                                    />
                                )}

                                {/* Icon */}
                                <div className="relative z-10">
                                    <item.icon className="h-5 w-5" />
                                </div>

                                {/* Label */}
                                <span className="relative z-10">{item.name}</span>

                                {/* Active Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="ml-auto w-2 h-2 bg-white rounded-full relative z-10"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
                <Link href="/">
                    <motion.div 
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
                        whileHover={{ x: -4 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Website
                    </motion.div>
                </Link>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile Menu Button */}
            <motion.button
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gray-900 text-white rounded-xl shadow-lg"
                onClick={() => setMobileOpen(!mobileOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {mobileOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="h-5 w-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Menu className="h-5 w-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div 
                        className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div 
                        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-900"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    >
                        <SidebarContent />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-gray-900">
                <SidebarContent />
            </div>
        </>
    )
}
