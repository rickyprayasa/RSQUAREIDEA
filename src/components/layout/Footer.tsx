'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, ExternalLink } from 'lucide-react'
import { LordIcon } from '@/components/ui/lordicon'

const footerLinks = {
    products: [
        { name: 'Semua Template', href: '/templates' },
        { name: 'Template Gratis', href: '/templates?filter=free' },
        { name: 'Template Premium', href: '/templates?filter=premium' },
        { name: 'Jasa Kustom', href: '/jasa-kustom' },
    ],
    company: [
        { name: 'Tentang Kami', href: '/tentang-kami' },
        { name: 'Kirim Masukan', href: '/feedback' },
        { name: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
        { name: 'Syarat & Ketentuan', href: '/syarat-ketentuan' },
    ],
    social: [
        {
            name: 'YouTube',
            lordicon: '/icons/wired-lineal-2676-logo-square-youtube-morph-logotype.json',
            href: 'https://www.youtube.com/@RSQUAREIDEA',
            colors: { primary: '#121331', secondary: '#e83a30', tertiary: '#ffffff' }
        },
        {
            name: 'Instagram',
            lordicon: '/icons/wired-lineal-2542-logo-instagram-hover-pinch.json',
            href: 'https://www.instagram.com/rsquareidea/',
            colors: { primary: '#121331', secondary: '#d62976', tertiary: '#ffffff' }
        },
        {
            name: 'TikTok',
            lordicon: '/icons/wired-lineal-2675-logo-square-tiktok-hover-draw.json',
            href: 'https://www.tiktok.com/@rsquareidea',
            colors: { primary: '#121331', secondary: '#000000', tertiary: '#25f4ee', quaternary: '#fe2c55' }
        },
    ] as Array<{ name: string; lordicon: string; href: string; colors: Record<string, string> }>,
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
                            <div className="flex gap-4">
                                {footerLinks.social.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-all duration-300 hover:scale-110"
                                        aria-label={item.name}
                                    >
                                        <LordIcon src={item.lordicon} trigger="hover" size={44} colors={item.colors} />
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
                                                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
                                                >
                                                    {item.name}
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
                                                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
                                                >
                                                    {item.name}
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
                                                    <span>{item.name}</span>
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
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
