'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

    // Don't show if loading, no settings, or voucher is not active
    if (loading || !settings || settings.voucher_active !== 'true' || !settings.voucher_code) {
        return null
    }

    return (
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-center text-sm font-medium text-white shadow-lg">
            <p>
                🔥 Kode Voucher: <span className="font-bold tracking-wider">{settings.voucher_code}</span> untuk mendapatkan
                Diskon {settings.voucher_discount}% semua Templates{' '}
                <Link href="/templates" className="underline hover:text-orange-100 transition-colors">
                    Klaim Sekarang &rarr;
                </Link>
            </p>
        </div>
    )
}
