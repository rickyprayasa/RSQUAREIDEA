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
    MessageSquare,
    Star,
    FileSpreadsheet,
    Users,
    ChevronDown,
    Inbox,
    BarChart3,
    Store,
    type LucideIcon
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
    name: string
    href: string
    icon: LucideIcon
    color: string
}

interface NavGroup {
    name: string
    icon: LucideIcon
    color: string
    items: NavItem[]
}

// Main navigation - Dashboard only
const mainNav: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500' },
]

// Grouped navigation
const navGroups: NavGroup[] = [
    {
        name: 'Katalog',
        icon: Store,
        color: 'from-orange-500 to-amber-500',
        items: [
            { name: 'Produk', href: '/admin/products', icon: Package, color: 'from-orange-500 to-amber-500' },
            { name: 'Kategori', href: '/admin/categories', icon: FolderOpen, color: 'from-green-500 to-emerald-500' },
            { name: 'Video', href: '/admin/videos', icon: Play, color: 'from-red-500 to-pink-500' },
        ]
    },
    {
        name: 'Penjualan',
        icon: ShoppingCart,
        color: 'from-purple-500 to-violet-500',
        items: [
            { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart, color: 'from-purple-500 to-violet-500' },
            { name: 'Pelanggan', href: '/admin/customers', icon: Users, color: 'from-cyan-500 to-blue-500' },
            { name: 'Pembayaran', href: '/admin/payments', icon: CreditCard, color: 'from-teal-500 to-cyan-500' },
        ]
    },
    {
        name: 'Inbox',
        icon: Inbox,
        color: 'from-pink-500 to-rose-500',
        items: [
            { name: 'Pesan', href: '/admin/messages', icon: MessageSquare, color: 'from-pink-500 to-rose-500' },
            { name: 'Feedback', href: '/admin/feedback', icon: Star, color: 'from-amber-500 to-yellow-500' },
            { name: 'Request', href: '/admin/requests', icon: FileSpreadsheet, color: 'from-lime-500 to-green-500' },
        ]
    },
]

// Bottom navigation
const bottomNav: NavItem[] = [
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: 'from-indigo-500 to-purple-500' },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings, color: 'from-gray-500 to-slate-500' },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['Katalog', 'Penjualan', 'Inbox'])

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupName)
                ? prev.filter(g => g !== groupName)
                : [...prev, groupName]
        )
    }

    const isGroupActive = (group: NavGroup) => {
        return group.items.some(item =>
            pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
        )
    }

    const NavLink = ({ item, compact = false }: { item: NavItem, compact?: boolean }) => {
        const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))

        return (
            <Link
                href={item.href}
                prefetch={true}
                onClick={() => setMobileOpen(false)}
                className="relative block"
            >
                <div
                    className={`flex items-center gap-2.5 px-3 ${compact ? 'py-2 pl-9' : 'py-2.5'} rounded-lg text-sm font-medium transition-all ${isActive
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <item.icon className={`${compact ? 'h-4 w-4' : 'h-4.5 w-4.5'}`} />
                    <span>{item.name}</span>
                    {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                </div>
            </Link>
        )
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <span className="text-white font-bold">R</span>
                </div>
                <div>
                    <span className="text-white font-bold">RSQUARE</span>
                    <p className="text-gray-500 text-xs">Admin</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {/* Main Nav */}
                {mainNav.map((item) => (
                    <NavLink key={item.name} item={item} />
                ))}

                {/* Divider */}
                <div className="my-3 border-t border-gray-800" />

                {/* Grouped Nav */}
                {navGroups.map((group) => {
                    const isExpanded = expandedGroups.includes(group.name)
                    const groupActive = isGroupActive(group)

                    return (
                        <div key={group.name}>
                            <button
                                onClick={() => toggleGroup(group.name)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${groupActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                <group.icon className="h-4.5 w-4.5" />
                                <span>{group.name}</span>
                                {groupActive && (
                                    <span className="ml-1 w-2 h-2 bg-orange-500 rounded-full" />
                                )}
                                <ChevronDown
                                    className={`ml-auto h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="py-1 space-y-0.5">
                                            {group.items.map((item) => (
                                                <NavLink key={item.name} item={item} compact />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}

                {/* Divider */}
                <div className="my-3 border-t border-gray-800" />

                {/* Bottom Nav */}
                {bottomNav.map((item) => (
                    <NavLink key={item.name} item={item} />
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-gray-800">
                <Link href="/">
                    <div className="flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali</span>
                    </div>
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
