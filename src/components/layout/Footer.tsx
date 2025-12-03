'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Youtube, Mail, MapPin, ArrowUpRight, ExternalLink, Globe } from 'lucide-react'

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
)

const footerLinks = {
    products: [
        { name: 'Semua Template', href: '/templates' },
        { name: 'Template Gratis', href: '/templates?filter=free' },
        { name: 'Template Premium', href: '/templates?filter=premium' },
        { name: 'Jasa Kustom', href: '/jasa-kustom' },
    ],
    company: [
        { name: 'Tentang Kami', href: '/kontak' },
        { name: 'Kirim Masukan', href: '/feedback' },
        { name: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
        { name: 'Syarat & Ketentuan', href: '/syarat-ketentuan' },
    ],
    social: [
        { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@RSQUAREIDEA', color: 'hover:bg-red-500' },
        { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/rsquareidea/', color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400' },
        { name: 'TikTok', icon: TikTokIcon, href: 'https://www.tiktok.com/@rsquareidea', color: 'hover:bg-black' },
    ],
    portfolio: [
        { name: 'Omzetin', href: 'https://omzetin.web.id/', description: 'Aplikasi Kasir & Inventory' },
    ],
}

export function Footer() {
    const currentYear = new Date().getFullYear()
    const [contactEmail, setContactEmail] = useState('hello@rsquareidea.my.id')

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings?.contact_email) {
                    setContactEmail(data.settings.contact_email)
                }
            })
            .catch(console.error)
    }, [])

    return (
        <footer className="relative bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Main Footer Content */}
                <div className="py-16">
                    <div className="grid gap-12 lg:grid-cols-12">
                        {/* Brand Section */}
                        <div className="lg:col-span-5">
                            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                                {/* Logo with white background */}
                                <div className="relative p-2 bg-white rounded-xl shadow-lg group-hover:shadow-orange-500/20 transition-shadow duration-300">
                                    <Image
                                        src="/images/rsquare-logo.png"
                                        alt="RSQUARE Logo"
                                        width={40}
                                        height={40}
                                        className="h-10 w-10 transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>
                                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-3xl font-bold text-transparent">
                                    RSQUARE
                                </span>
                            </Link>
                            <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
                                Template Google Sheets premium untuk meningkatkan produktivitas bisnis dan personal Kamu. 
                                Hemat waktu, kurangi stres, dan buat keputusan lebih cerdas.
                            </p>

                            {/* Social Links */}
                            <div className="flex gap-3">
                                {footerLinks.social.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-11 h-11 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 ${item.color}`}
                                        aria-label={item.name}
                                    >
                                        <item.icon className="h-5 w-5" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links Sections */}
                        <div className="lg:col-span-7">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                {/* Products */}
                                <div>
                                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-orange-500 rounded-full" />
                                        Produk
                                    </h3>
                                    <ul className="space-y-3">
                                        {footerLinks.products.map((item) => (
                                            <li key={item.name}>
                                                <Link 
                                                    href={item.href} 
                                                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center gap-1 group"
                                                >
                                                    <span>{item.name}</span>
                                                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Company */}
                                <div>
                                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-orange-500 rounded-full" />
                                        Perusahaan
                                    </h3>
                                    <ul className="space-y-3">
                                        {footerLinks.company.map((item) => (
                                            <li key={item.name}>
                                                <Link 
                                                    href={item.href} 
                                                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center gap-1 group"
                                                >
                                                    <span>{item.name}</span>
                                                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Contact & Portfolio */}
                                <div>
                                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-orange-500 rounded-full" />
                                        Kontak
                                    </h3>
                                    <ul className="space-y-4">
                                        <li>
                                            <a 
                                                href={`mailto:${contactEmail}`}
                                                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-start gap-3"
                                            >
                                                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm break-all">{contactEmail}</span>
                                            </a>
                                        </li>
                                        <li className="flex items-start gap-3 text-gray-400">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">Indonesia</span>
                                        </li>
                                    </ul>

                                    {/* Portfolio */}
                                    <h3 className="text-white font-semibold mt-6 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-orange-500 rounded-full" />
                                        Portfolio
                                    </h3>
                                    <ul className="space-y-3">
                                        {footerLinks.portfolio.map((item) => (
                                            <li key={item.name}>
                                                <a 
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center gap-2 group"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    <span>{item.name}</span>
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                                <p className="text-xs text-gray-500 ml-6">{item.description}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">
                            &copy; {currentYear} RSQUARE. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <Link href="/kebijakan-privasi" className="hover:text-orange-400 transition-colors">
                                Privasi
                            </Link>
                            <Link href="/syarat-ketentuan" className="hover:text-orange-400 transition-colors">
                                Syarat
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
