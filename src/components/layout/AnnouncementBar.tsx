'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface VoucherSettings {
    voucher_code: string | null
    voucher_discount: string | null
    voucher_active: string | null
}

export function AnnouncementBar() {
    const [settings, setSettings] = useState<VoucherSettings | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) {
                    setSettings({
                        voucher_code: data.settings.voucher_code,
                        voucher_discount: data.settings.voucher_discount,
                        voucher_active: data.settings.voucher_active,
                    })
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading || !settings || settings.voucher_active !== 'true' || !settings.voucher_code) {
        return null
    }

    return (
        <div className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-3 py-2 md:px-6 md:py-3 text-center text-xs md:text-sm font-medium text-white shadow-lg overflow-hidden">
            {/* Animated background shimmer */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            
            <p className="relative z-10 flex items-center justify-center gap-1.5 md:gap-2 flex-wrap leading-relaxed">
                <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-sm md:text-base"
                >
                    🔥
                </motion.span>
                <span>Kode Voucher:</span>
                <span className="font-bold tracking-wider bg-white/20 px-1.5 py-0.5 md:px-2 rounded text-[11px] md:text-sm">
                    {settings.voucher_code}
                </span>
                <span className="hidden sm:inline">untuk mendapatkan Diskon {settings.voucher_discount}% semua Templates</span>
                <span className="sm:hidden">Diskon {settings.voucher_discount}%</span>
                <Link 
                    href="/templates" 
                    className="inline-flex items-center gap-0.5 md:gap-1 group ml-0.5 md:ml-1"
                >
                    <motion.span 
                        className="relative font-bold"
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer">
                            Klaim Sekarang
                        </span>
                    </motion.span>
                    <motion.span
                        className="inline-block"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    >
                        →
                    </motion.span>
                </Link>
            </p>
        </div>
    )
}
