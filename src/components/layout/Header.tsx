'use client'

import { ClientLordIcon } from '@/components/ui/lordicon'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/components/cart/CartButton'

const navigation = [
    { name: 'Beranda', href: '/' },
    { name: 'Templates', href: '/templates' },
    { name: 'Artikel', href: '/articles' },
    { name: 'Kontak', href: '/kontak' },
]

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
            <nav className="container mx-auto flex items-center justify-between px-4 py-2.5 md:px-6 md:py-4">
                <Link href="/" className="flex items-center gap-1.5 md:gap-2 group">
                    <Image
                        src="/images/rsquare-logo.png"
                        alt="RSQUARE Logo"
                        width={44}
                        height={44}
                        className="h-8 w-8 md:h-11 md:w-11 transition-transform duration-300 group-hover:scale-105"
                        priority
                    />
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-lg md:text-2xl font-bold text-transparent">
                        RSQUARE
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center space-x-1 md:flex">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative px-4 py-2 text-sm font-medium transition-colors duration-200 group flex items-center gap-1.5"
                            >
                                <span className={`relative z-10 ${isActive ? 'text-orange-600' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {item.name}
                                </span>
                                {item.name === 'Artikel' && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                )}
                                <span className={`absolute bottom-0 left-1/2 h-0.5 bg-orange-500 transition-all duration-300 ease-out ${isActive ? 'w-1/2 -translate-x-1/2' : 'w-0 group-hover:w-1/2 group-hover:-translate-x-1/2'
                                    }`} />
                            </Link>
                        )
                    })}
                </div>

                {/* Cart & Mobile Menu */}
                <div className="flex items-center gap-2">
                    <CartButton />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden hover:bg-orange-50"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <ClientLordIcon
                                src="https://cdn.lordicon.com/nqtddedc.json"
                                trigger="hover"
                                colors="primary:#374151"
                                style={{ width: '24px', height: '24px' }}
                            />
                        ) : (
                            <ClientLordIcon
                                src="https://cdn.lordicon.com/eouimtlu.json"
                                trigger="hover"
                                colors="primary:#374151"
                                style={{ width: '24px', height: '24px' }}
                            />
                        )}
                    </Button>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        <div className="space-y-1 px-4 py-3">
                            {navigation.map((item, index) => {
                                const isActive = pathname === item.href
                                return (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                                ? 'bg-orange-50 text-orange-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98]'
                                                }`}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
