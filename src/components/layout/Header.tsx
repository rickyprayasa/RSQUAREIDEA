'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/components/cart/CartButton'

const navigation = [
    { name: 'Beranda', href: '/' },
    { name: 'Templates', href: '/templates' },
    { name: 'Kontak', href: '/kontak' },
]

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
            <nav className="container mx-auto flex items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <Image
                        src="/images/rsquare-logo.png"
                        alt="RSQUARE Logo"
                        width={44}
                        height={44}
                        className="h-11 w-11 transition-transform duration-300 group-hover:scale-105"
                        priority
                    />
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-2xl font-bold text-transparent">
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
                                className="relative px-4 py-2 text-sm font-medium transition-colors duration-200 group"
                            >
                                <span className={`relative z-10 ${isActive ? 'text-orange-600' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {item.name}
                                </span>
                                {/* Hover underline effect */}
                                <span className={`absolute bottom-0 left-1/2 h-0.5 bg-orange-500 transition-all duration-300 ease-out ${
                                    isActive ? 'w-1/2 -translate-x-1/2' : 'w-0 group-hover:w-1/2 group-hover:-translate-x-1/2'
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
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </nav>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="space-y-1 px-6 py-4">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`block rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-orange-50 text-orange-600' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </header>
    )
}
