'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { LordIcon, ClientLordIcon } from '@/components/ui/lordicon'

const footerLinks = {
    products: [
        { name: 'Semua Template', href: '/templates', lordicon: 'https://cdn.lordicon.com/pflszboa.json' },
        { name: 'Template Gratis', href: '/templates?filter=free', lordicon: 'https://cdn.lordicon.com/wcjauznf.json' },
        { name: 'Template Premium', href: '/templates?filter=premium', lordicon: 'https://cdn.lordicon.com/mdgrhyca.json' },
        { name: 'Jasa Kustom', href: '/jasa-kustom', lordicon: 'https://cdn.lordicon.com/wloilxuq.json' },
    ],
    company: [
        { name: 'Tentang Kami', href: '/tentang-kami', lordicon: 'https://cdn.lordicon.com/bhfjfgqz.json' },
        { name: 'Kirim Masukan', href: '/feedback', lordicon: 'https://cdn.lordicon.com/fdxqrdfe.json' },
        { name: 'Kebijakan Privasi', href: '/kebijakan-privasi', lordicon: 'https://cdn.lordicon.com/jgnvfzqg.json' },
        { name: 'Syarat & Ketentuan', href: '/syarat-ketentuan', lordicon: 'https://cdn.lordicon.com/foxhetpf.json' },
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
                            <div className="flex gap-4 mb-8">
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

                            {/* Saweria Support */}
                            <a
                                href="https://saweria.co/rsquareidea"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl transition-all duration-300"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-lg group-hover:blur-xl transition-all" />
                                    <ClientLordIcon
                                        src="https://cdn.lordicon.com/yeallgsa.json"
                                        trigger="loop"
                                        delay="2000"
                                        colors="primary:#fbbf24,secondary:#f97316"
                                        style={{ width: '56px', height: '56px' }}
                                    />
                                </div>
                                <div>
                                    <p className="text-amber-400 font-semibold text-sm mb-0.5">Dukung Kami ☕</p>
                                    <p className="text-gray-400 text-xs">Traktir kopi via Saweria</p>
                                </div>
                                <div className="ml-auto">
                                    <ClientLordIcon
                                        src="https://cdn.lordicon.com/vduvxizq.json"
                                        trigger="hover"
                                        colors="primary:#fbbf24"
                                        style={{ width: '24px', height: '24px' }}
                                    />
                                </div>
                            </a>
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
                                                    className="group inline-flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors duration-200"
                                                >
                                                    <ClientLordIcon
                                                        src={item.lordicon}
                                                        trigger="hover"
                                                        colors="primary:#fb923c,secondary:#fbbf24"
                                                        style={{ width: '18px', height: '18px' }}
                                                    />
                                                    <span className="relative">
                                                        {item.name}
                                                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full" />
                                                    </span>
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
                                                    className="group inline-flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors duration-200"
                                                >
                                                    <ClientLordIcon
                                                        src={item.lordicon}
                                                        trigger="hover"
                                                        colors="primary:#fb923c,secondary:#fbbf24"
                                                        style={{ width: '18px', height: '18px' }}
                                                    />
                                                    <span className="relative">
                                                        {item.name}
                                                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full" />
                                                    </span>
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
                                                className="group text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-start gap-2"
                                            >
                                                <ClientLordIcon
                                                    src="https://cdn.lordicon.com/diihvcfp.json"
                                                    trigger="hover"
                                                    colors="primary:#fb923c,secondary:#fbbf24"
                                                    style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }}
                                                />
                                                <span className="relative text-sm break-all">
                                                    {contactEmail}
                                                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full" />
                                                </span>
                                            </a>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-400">
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/surcxhka.json"
                                                trigger="loop"
                                                delay="3000"
                                                colors="primary:#fb923c,secondary:#fbbf24"
                                                style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }}
                                            />
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
                                                    className="group text-gray-400 hover:text-orange-400 transition-colors duration-200 inline-flex items-center gap-2"
                                                >
                                                    <ClientLordIcon
                                                        src="https://cdn.lordicon.com/ercyvufy.json"
                                                        trigger="hover"
                                                        colors="primary:#fb923c,secondary:#fbbf24"
                                                        style={{ width: '18px', height: '18px' }}
                                                    />
                                                    <span className="relative">
                                                        {item.name}
                                                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full" />
                                                    </span>
                                                </a>
                                                <p className="text-xs text-gray-500 mt-1 ml-6">{item.description}</p>
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
                            <Link href="/kebijakan-privasi" className="group inline-flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/jgnvfzqg.json"
                                    trigger="hover"
                                    colors="primary:#fb923c,secondary:#fbbf24"
                                    style={{ width: '16px', height: '16px' }}
                                />
                                <span className="relative">
                                    Privasi
                                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full" />
                                </span>
                            </Link>
                            <Link href="/syarat-ketentuan" className="group inline-flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/foxhetpf.json"
                                    trigger="hover"
                                    colors="primary:#fb923c,secondary:#fbbf24"
                                    style={{ width: '16px', height: '16px' }}
                                />
                                <span className="relative">
                                    Syarat
                                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full" />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
