'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { LordIcon, ClientLordIcon } from '@/components/ui/lordicon'

const footerLinks = {
    products: [
        { name: 'Semua Template', href: '/templates', lordicon: 'https://cdn.lordicon.com/pflszboa.json' },
        { name: 'Artikel & Tutorial', href: '/articles', lordicon: 'https://cdn.lordicon.com/wxnxiano.json' },
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

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Main Footer Content */}
                <div className="py-8 md:py-16">
                    <div className="grid gap-8 md:gap-12 lg:grid-cols-12">
                        {/* Brand Section */}
                        <div className="lg:col-span-5">
                            <Link href="/" className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6 group">
                                <div className="relative p-1.5 md:p-2 bg-white rounded-lg md:rounded-xl shadow-lg group-hover:shadow-orange-500/20 transition-shadow duration-300">
                                    <Image
                                        src="/images/rsquare-logo.png"
                                        alt="RSQUARE Logo"
                                        width={40}
                                        height={40}
                                        className="h-8 w-8 md:h-10 md:w-10 transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>
                                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-2xl md:text-3xl font-bold text-transparent">
                                    RSQUARE
                                </span>
                            </Link>
                            <p className="text-gray-400 max-w-md mb-5 md:mb-8 leading-relaxed text-sm md:text-base">
                                Template Google Sheets premium untuk meningkatkan produktivitas bisnis dan personal Kamu.
                                Hemat waktu, kurangi stres, dan buat keputusan lebih cerdas.
                            </p>

                            {/* Social Links + Saweria */}
                            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                                {footerLinks.social.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-all duration-300 hover:scale-110"
                                        aria-label={item.name}
                                    >
                                        <LordIcon src={item.lordicon} trigger="hover" size={36} colors={item.colors} />
                                    </a>
                                ))}

                                {/* Divider */}
                                <div className="w-px h-6 md:h-8 bg-gray-700 mx-0.5 md:mx-1" />

                                {/* Saweria */}
                                <a
                                    href="https://saweria.co/rsquareidea"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 rounded-lg md:rounded-xl transition-all duration-300"
                                    aria-label="Dukung via Saweria"
                                >
                                    <ClientLordIcon
                                        src="https://cdn.lordicon.com/yeallgsa.json"
                                        trigger="loop"
                                        delay="2000"
                                        colors="primary:#fbbf24,secondary:#f97316"
                                        style={{ width: '24px', height: '24px' }}
                                    />
                                    <span className="text-amber-400 font-medium text-xs md:text-sm">Traktir Kopi ☕</span>
                                </a>
                            </div>
                        </div>

                        {/* Links Sections */}
                        <div className="lg:col-span-7">
                            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8">
                                {/* Products */}
                                <div>
                                    <h3 className="text-white font-semibold text-sm md:text-base mb-3 md:mb-5 flex items-center gap-2">
                                        <div className="w-1 h-3 md:h-4 bg-orange-500 rounded-full" />
                                        Produk
                                    </h3>
                                    <ul className="space-y-2 md:space-y-3">
                                        {footerLinks.products.map((item) => (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className="group inline-flex items-center gap-1.5 md:gap-2 text-gray-400 hover:text-orange-400 transition-colors duration-200 text-xs md:text-sm"
                                                >
                                                    <ClientLordIcon
                                                        src={item.lordicon}
                                                        trigger="hover"
                                                        colors="primary:#fb923c,secondary:#fbbf24"
                                                        style={{ width: '16px', height: '16px' }}
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
                                    <h3 className="text-white font-semibold text-sm md:text-base mb-3 md:mb-5 flex items-center gap-2">
                                        <div className="w-1 h-3 md:h-4 bg-orange-500 rounded-full" />
                                        Perusahaan
                                    </h3>
                                    <ul className="space-y-2 md:space-y-3">
                                        {footerLinks.company.map((item) => (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className="group inline-flex items-center gap-1.5 md:gap-2 text-gray-400 hover:text-orange-400 transition-colors duration-200 text-xs md:text-sm"
                                                >
                                                    <ClientLordIcon
                                                        src={item.lordicon}
                                                        trigger="hover"
                                                        colors="primary:#fb923c,secondary:#fbbf24"
                                                        style={{ width: '16px', height: '16px' }}
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
                                <div className="col-span-2 md:col-span-1">
                                    <h3 className="text-white font-semibold text-sm md:text-base mb-3 md:mb-5 flex items-center gap-2">
                                        <div className="w-1 h-3 md:h-4 bg-orange-500 rounded-full" />
                                        Kontak
                                    </h3>
                                    <ul className="space-y-2 md:space-y-4">
                                        <li>
                                            <a
                                                href={`mailto:${contactEmail}`}
                                                className="group text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-start gap-1.5 md:gap-2"
                                            >
                                                <ClientLordIcon
                                                    src="https://cdn.lordicon.com/diihvcfp.json"
                                                    trigger="hover"
                                                    colors="primary:#fb923c,secondary:#fbbf24"
                                                    style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }}
                                                />
                                                <span className="relative text-xs md:text-sm break-all">
                                                    {contactEmail}
                                                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full" />
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="https://wa.me/6285794047694"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-start gap-1.5 md:gap-2"
                                            >
                                                <ClientLordIcon
                                                    src="https://cdn.lordicon.com/axewyqun.json"
                                                    trigger="hover"
                                                    colors="primary:#fb923c,secondary:#fbbf24"
                                                    style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }}
                                                />
                                                <span className="relative text-xs md:text-sm">
                                                    +62 857-9404-7694
                                                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full" />
                                                </span>
                                            </a>
                                        </li>
                                        <li className="flex items-start gap-1.5 md:gap-2 text-gray-400">
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/surcxhka.json"
                                                trigger="loop"
                                                delay="3000"
                                                colors="primary:#fb923c,secondary:#fbbf24"
                                                style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }}
                                            />
                                            <span className="text-xs md:text-sm leading-relaxed">
                                                Bumi Arum Regency Blok Akasia no.21,<br />
                                                Kec. Rancaekek, Kab. Bandung
                                            </span>
                                        </li>
                                    </ul>

                                    {/* Portfolio */}
                                    <h3 className="text-white font-semibold text-sm md:text-base mt-4 md:mt-6 mb-3 md:mb-4 flex items-center gap-2">
                                        <div className="w-1 h-3 md:h-4 bg-orange-500 rounded-full" />
                                        Portfolio
                                    </h3>
                                    <ul className="space-y-2 md:space-y-3">
                                        {footerLinks.portfolio.map((item) => (
                                            <li key={item.name}>
                                                <a
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group text-gray-400 hover:text-orange-400 transition-colors duration-200 inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm"
                                                >
                                                    <ClientLordIcon
                                                        src="https://cdn.lordicon.com/ercyvufy.json"
                                                        trigger="hover"
                                                        colors="primary:#fb923c,secondary:#fbbf24"
                                                        style={{ width: '16px', height: '16px' }}
                                                    />
                                                    <span className="relative">
                                                        {item.name}
                                                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full" />
                                                    </span>
                                                </a>
                                                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1 ml-5 md:ml-6">{item.description}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 py-4 md:py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
                        <p className="text-xs md:text-sm text-gray-500">
                            &copy; {currentYear} RSQUARE. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
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
