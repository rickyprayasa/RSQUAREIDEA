'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
    Settings,
    Save,
    Ticket,
    Globe,
    Mail,
    Check,
    Layout,
    Type,
    Percent,
    FileText,
    ToggleLeft,
    Info,
    ShoppingCart,
    CreditCard,
    QrCode,
    Upload,
    X,
    AlertCircle,
    BarChart3,
    Code,
    Users,
    Loader2,
    CheckCircle2
} from 'lucide-react'
import jsQR from 'jsqr'

interface SettingsData {
    site_name: string
    site_description: string
    contact_email: string
    active_users_count: string
    voucher_code: string
    voucher_discount: string
    voucher_active: string
    homepage_free_limit: string
    homepage_featured_limit: string
    cart_enabled: string
    payment_gateway_enabled: string
    qris_enabled: string
    qris_static_image: string
    qris_merchant_string: string
    // Tracking pixels
    meta_pixel_id: string
    google_analytics_id: string
    google_tag_manager_id: string
    tiktok_pixel_id: string
    twitter_pixel_id: string
    custom_head_script: string
    // Email settings
    smtp_host: string
    smtp_port: string
    smtp_user: string
    smtp_password: string
    smtp_from_name: string
    smtp_from_email: string
    email_subject_template: string
    email_body_template: string
}

const defaultSettings: SettingsData = {
    site_name: 'RSQUARE',
    site_description: 'Platform template Google Sheets premium',
    contact_email: 'hello@rsquareidea.my.id',
    active_users_count: '0',
    voucher_code: '',
    voucher_discount: '10',
    voucher_active: 'false',
    homepage_free_limit: '4',
    homepage_featured_limit: '4',
    cart_enabled: 'true',
    payment_gateway_enabled: 'false',
    qris_enabled: 'false',
    qris_static_image: '',
    qris_merchant_string: '',
    // Tracking pixels
    meta_pixel_id: '',
    google_analytics_id: '',
    google_tag_manager_id: '',
    tiktok_pixel_id: '',
    twitter_pixel_id: '',
    custom_head_script: '',
    // Email settings
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    smtp_from_name: 'RSQUARE',
    smtp_from_email: '',
    email_subject_template: 'Link Download Template - {{order_number}}',
    email_body_template: `Halo {{customer_name}},

Terima kasih telah melakukan pembelian di RSQUARE!

Pesanan Kamu dengan nomor {{order_number}} telah dikonfirmasi.

Berikut adalah link download template yang Kamu beli:

{{download_links}}

Total Pembayaran: Rp {{total_amount}}

Jika ada pertanyaan, silakan hubungi kami melalui email atau WhatsApp.

Salam hangat,
Tim RSQUARE`,
}

const tabs = [
    { id: 'general', label: 'Umum', icon: Globe, color: 'orange' },
    { id: 'voucher', label: 'Voucher', icon: Ticket, color: 'purple' },
    { id: 'homepage', label: 'Beranda', icon: Layout, color: 'blue' },
    { id: 'payment', label: 'Pembayaran', icon: CreditCard, color: 'green' },
    { id: 'email', label: 'Email', icon: Mail, color: 'pink' },
    { id: 'tracking', label: 'Tracking', icon: BarChart3, color: 'cyan' },
]

export default function SettingsPage() {
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [settings, setSettings] = useState<SettingsData>(defaultSettings)
    const [activeTab, setActiveTab] = useState('general')
    const [stats, setStats] = useState({ freeCount: 0, featuredCount: 0 })
    const [uploading, setUploading] = useState(false)
    const [decodingQris, setDecodingQris] = useState(false)
    const [qrisDecoded, setQrisDecoded] = useState(false)
    const [testingEmail, setTestingEmail] = useState(false)
    const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null)

    // Function to decode QR code from image
    const decodeQRFromImage = async (imageUrl: string): Promise<string | null> => {
        return new Promise((resolve) => {
            const img = document.createElement('img')
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    resolve(null)
                    return
                }

                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const code = jsQR(imageData.data, imageData.width, imageData.height)

                if (code) {
                    resolve(code.data)
                } else {
                    resolve(null)
                }
            }
            img.onerror = () => resolve(null)
            img.src = imageUrl
        })
    }

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) {
                    setSettings(prev => ({ ...prev, ...data.settings }))
                }
            })
            .catch(console.error)

        fetch('/api/admin/products')
            .then(res => res.json())
            .then(data => {
                if (data.products) {
                    const freeCount = data.products.filter((p: { is_free: boolean, is_active: boolean }) => p.is_free && p.is_active).length
                    const featuredCount = data.products.filter((p: { is_featured: boolean, is_active: boolean }) => p.is_featured && p.is_active).length
                    setStats({ freeCount, featuredCount })
                }
            })
            .catch(console.error)
    }, [])

    const handleChange = (key: keyof SettingsData, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        setSaved(false)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })
            if (res.ok) {
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
            }
        } catch (error) {
            console.error('Error saving settings:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('bucket', 'qris')

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            if (data.url) {
                handleChange('qris_static_image', data.url)

                // Auto decode QR code from uploaded image
                setDecodingQris(true)
                setQrisDecoded(false)
                try {
                    const qrisString = await decodeQRFromImage(data.url)
                    if (qrisString) {
                        handleChange('qris_merchant_string', qrisString)
                        setQrisDecoded(true)
                        setTimeout(() => setQrisDecoded(false), 3000)
                    }
                } catch (decodeError) {
                    console.error('Error decoding QRIS:', decodeError)
                } finally {
                    setDecodingQris(false)
                }
            }
        } catch (error) {
            console.error('Error uploading QRIS:', error)
        } finally {
            setUploading(false)
        }
    }

    const handleTestEmail = async () => {
        if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_password) {
            setTestEmailResult({ success: false, message: 'Lengkapi konfigurasi SMTP terlebih dahulu' })
            return
        }

        setTestingEmail(true)
        setTestEmailResult(null)

        try {
            const res = await fetch('/api/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: settings.smtp_from_email || settings.smtp_user,
                    subject: 'Test Email dari RSQUARE',
                    body: `Halo! Ini adalah email test dari RSQUARE.\n\nKonfigurasi SMTP berhasil!\n\nServer: ${settings.smtp_host}:${settings.smtp_port}\nPengirim: ${settings.smtp_from_email || settings.smtp_user}\n\nSalam,\nRSQUARE`,
                    smtpConfig: {
                        host: settings.smtp_host,
                        port: settings.smtp_port,
                        user: settings.smtp_user,
                        pass: settings.smtp_password,
                        fromName: settings.smtp_from_name,
                        fromEmail: settings.smtp_from_email
                    }
                }),
            })

            const data = await res.json()

            if (res.ok) {
                setTestEmailResult({ success: true, message: `Email test berhasil dikirim ke ${settings.smtp_from_email || settings.smtp_user}!` })
            } else {
                setTestEmailResult({ success: false, message: data.error || 'Gagal mengirim email test' })
            }
        } catch (error) {
            console.error('Error testing email:', error)
            setTestEmailResult({ success: false, message: 'Terjadi kesalahan saat mengirim email test' })
        } finally {
            setTestingEmail(false)
        }
    }

    const tabColors: Record<string, string> = {
        orange: 'from-orange-500 to-amber-500',
        purple: 'from-purple-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        cyan: 'from-cyan-500 to-blue-500',
        pink: 'from-pink-500 to-rose-500',
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
                    <p className="text-gray-500 mt-1">Konfigurasi website</p>
                </div>
                <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all duration-200 ${saved
                        ? 'bg-green-500 text-white shadow-green-200'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200 hover:shadow-xl'
                        } disabled:opacity-70`}
                >
                    {saved ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                    {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan'}
                </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl overflow-x-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            whileHover={!isActive ? { scale: 1.02 } : {}}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className={`absolute inset-0 bg-gradient-to-r ${tabColors[tab.color]} rounded-xl shadow-lg`}
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <tab.icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </span>
                        </motion.button>
                    )
                })}
            </div>

            {/* Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <SectionHeader
                            icon={Settings}
                            title="Pengaturan Umum"
                            subtitle="Informasi dasar website"
                            color="orange"
                        />
                        <div className="grid gap-5">
                            <InputField
                                label="Nama Website"
                                icon={Type}
                                value={settings.site_name}
                                onChange={(v) => handleChange('site_name', v)}
                                iconColor="text-orange-500"
                            />
                            <InputField
                                label="Deskripsi"
                                icon={FileText}
                                value={settings.site_description}
                                onChange={(v) => handleChange('site_description', v)}
                                isTextarea
                                rows={2}
                                iconColor="text-blue-500"
                            />
                            <InputField
                                label="Email Kontak"
                                icon={Mail}
                                type="email"
                                value={settings.contact_email}
                                onChange={(v) => handleChange('contact_email', v)}
                                iconColor="text-green-500"
                            />
                            <InputField
                                label="Jumlah Pengguna Aktif"
                                icon={Users}
                                type="number"
                                value={settings.active_users_count}
                                onChange={(v) => handleChange('active_users_count', v)}
                                placeholder="0"
                                iconColor="text-purple-500"
                            />
                        </div>
                        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-xs text-gray-600">
                                <strong>Info:</strong> Jumlah pengguna aktif ditampilkan di halaman Tentang Kami. Rating rata-rata dihitung otomatis dari feedback pengguna.
                            </p>
                        </div>
                    </div>
                )}

                {/* Voucher Tab */}
                {activeTab === 'voucher' && (
                    <div className="space-y-6">
                        <SectionHeader
                            icon={Ticket}
                            title="Kode Voucher"
                            subtitle="Atur kode diskon untuk pelanggan"
                            color="purple"
                        />
                        <ToggleCard
                            icon={ToggleLeft}
                            label="Status Voucher"
                            description="Aktifkan voucher untuk pelanggan"
                            active={settings.voucher_active === 'true'}
                            onToggle={() => handleChange('voucher_active', settings.voucher_active === 'true' ? 'false' : 'true')}
                            color="purple"
                        />
                        <div className="grid md:grid-cols-2 gap-5">
                            <InputField
                                label="Kode Voucher"
                                icon={Ticket}
                                value={settings.voucher_code}
                                onChange={(v) => handleChange('voucher_code', v.toUpperCase())}
                                placeholder="DISKON10"
                                className="font-mono uppercase"
                                iconColor="text-purple-500"
                            />
                            <InputField
                                label="Diskon (%)"
                                icon={Percent}
                                type="number"
                                value={settings.voucher_discount}
                                onChange={(v) => handleChange('voucher_discount', v)}
                                min={0}
                                max={100}
                                iconColor="text-pink-500"
                            />
                        </div>
                        {settings.voucher_code && (
                            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">
                                <p className="text-sm opacity-80">Preview:</p>
                                <p className="font-semibold mt-1">
                                    Gunakan kode <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{settings.voucher_code}</span> untuk diskon {settings.voucher_discount}%
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Homepage Tab */}
                {activeTab === 'homepage' && (
                    <div className="space-y-6">
                        <SectionHeader
                            icon={Layout}
                            title="Pengaturan Beranda"
                            subtitle="Konfigurasi tampilan halaman beranda"
                            color="blue"
                        />

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex gap-3">
                                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Produk ditampilkan otomatis berdasarkan pengaturan:</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                                        <li><strong>Template Gratis:</strong> Produk dengan centang Gratis di halaman produk</li>
                                        <li><strong>Template Unggulan:</strong> Produk dengan centang Produk Unggulan di halaman produk</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <Ticket className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-900">Template Gratis</h4>
                                        <p className="text-sm text-green-700">{stats.freeCount} produk tersedia</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-green-800 mb-2 block">
                                        Jumlah ditampilkan di beranda
                                    </label>
                                    <select
                                        value={settings.homepage_free_limit}
                                        onChange={(e) => handleChange('homepage_free_limit', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="4">4 Produk</option>
                                        <option value="6">6 Produk</option>
                                        <option value="8">8 Produk</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-orange-500 rounded-lg">
                                        <Ticket className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-orange-900">Template Unggulan</h4>
                                        <p className="text-sm text-orange-700">{stats.featuredCount} produk tersedia</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-orange-800 mb-2 block">
                                        Jumlah ditampilkan di beranda
                                    </label>
                                    <select
                                        value={settings.homepage_featured_limit}
                                        onChange={(e) => handleChange('homepage_featured_limit', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="4">4 Produk</option>
                                        <option value="6">6 Produk</option>
                                        <option value="8">8 Produk</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600">
                                <strong>Tips:</strong> Untuk mengubah produk mana yang muncul di beranda, edit produk di menu{' '}
                                <Link href="/admin/products" className="text-orange-600 hover:underline font-medium">Produk</Link>{' '}
                                dan centang opsi Gratis atau Produk Unggulan.
                            </p>
                        </div>
                    </div>
                )}

                {/* Payment Tab */}
                {activeTab === 'payment' && (
                    <div className="space-y-6">
                        <SectionHeader
                            icon={CreditCard}
                            title="Pengaturan Pembayaran"
                            subtitle="Konfigurasi metode pembayaran"
                            color="green"
                        />

                        {/* Cart Toggle */}
                        <ToggleCard
                            icon={ShoppingCart}
                            label="Fitur Keranjang"
                            description="Aktifkan fitur keranjang belanja. Jika dimatikan, tombol 'Beli Sekarang' akan nonaktif."
                            active={settings.cart_enabled === 'true'}
                            onToggle={() => handleChange('cart_enabled', settings.cart_enabled === 'true' ? 'false' : 'true')}
                            color="green"
                        />

                        {settings.cart_enabled !== 'true' && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <div className="flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-800">
                                        <p className="font-medium">Fitur Keranjang Dinonaktifkan</p>
                                        <p className="mt-1">Tombol &quot;Beli Sekarang&quot; akan berwarna abu-abu dan tidak dapat diklik. Pelanggan hanya bisa membeli melalui link eksternal.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Gateway Toggle */}
                        <ToggleCard
                            icon={CreditCard}
                            label="Payment Gateway"
                            description="Aktifkan pembayaran via payment gateway (Midtrans, Xendit, dll)"
                            active={settings.payment_gateway_enabled === 'true'}
                            onToggle={() => handleChange('payment_gateway_enabled', settings.payment_gateway_enabled === 'true' ? 'false' : 'true')}
                            color="green"
                        />

                        {settings.payment_gateway_enabled === 'true' && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                <div className="flex gap-3">
                                    <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-800">
                                        <strong>Coming Soon:</strong> Integrasi payment gateway akan segera tersedia. Hubungi kami untuk informasi lebih lanjut.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* QRIS Toggle */}
                        <ToggleCard
                            icon={QrCode}
                            label="QRIS Dinamis"
                            description="Aktifkan pembayaran QRIS dengan upload gambar QRIS statis"
                            active={settings.qris_enabled === 'true'}
                            onToggle={() => handleChange('qris_enabled', settings.qris_enabled === 'true' ? 'false' : 'true')}
                            color="green"
                        />

                        {settings.qris_enabled === 'true' && (
                            <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gray-800 rounded-lg">
                                        <QrCode className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Upload QRIS Statis</h4>
                                        <p className="text-sm text-gray-600">Upload gambar QRIS dari bank/e-wallet Kamu</p>
                                    </div>
                                </div>

                                {settings.qris_static_image ? (
                                    <div className="relative">
                                        <div className="relative w-48 h-48 mx-auto bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                                            <Image
                                                src={settings.qris_static_image}
                                                alt="QRIS"
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleChange('qris_static_image', '')}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <p className="text-center text-sm text-gray-500 mt-3">QRIS sudah diupload</p>
                                    </div>
                                ) : (
                                    <label className="block cursor-pointer">
                                        <div className="w-48 h-48 mx-auto border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-all">
                                            {uploading ? (
                                                <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full" />
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 text-gray-400" />
                                                    <span className="text-sm text-gray-500 text-center px-4">
                                                        Klik untuk upload gambar QRIS
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleQrisUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}

                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-700">
                                        <strong>Catatan:</strong> QRIS statis akan ditampilkan kepada pelanggan saat checkout. Pastikan gambar QRIS jelas dan mudah di-scan.
                                    </p>
                                </div>

                                {/* QRIS Merchant String for Dynamic QRIS */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-green-500 rounded-lg">
                                            <Code className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">QRIS Merchant String</h4>
                                            <p className="text-sm text-gray-600">Otomatis terisi dari gambar QRIS yang diupload</p>
                                        </div>
                                        {decodingQris && (
                                            <div className="flex items-center gap-2 ml-auto text-amber-600">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm">Membaca QR...</span>
                                            </div>
                                        )}
                                        {qrisDecoded && (
                                            <div className="flex items-center gap-2 ml-auto text-green-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="text-sm">Berhasil terbaca!</span>
                                            </div>
                                        )}
                                    </div>
                                    <textarea
                                        value={settings.qris_merchant_string}
                                        onChange={(e) => handleChange('qris_merchant_string', e.target.value)}
                                        placeholder="String QRIS akan otomatis terisi setelah upload gambar..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                                        readOnly={decodingQris}
                                    />
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-xs text-green-700">
                                            <strong>QRIS Dinamis:</strong> String ini digunakan untuk generate QR Code dengan nominal yang sudah terisi otomatis sesuai total belanja customer.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Email Tab */}
                {activeTab === 'email' && (
                    <div className="space-y-6">
                        <SectionHeader
                            icon={Mail}
                            title="Pengaturan Email"
                            subtitle="Konfigurasi SMTP dan template email otomatis"
                            color="pink"
                        />

                        {/* SMTP Settings */}
                        <div className="p-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Konfigurasi SMTP</h4>
                                    <p className="text-sm text-gray-600">Pengaturan server email untuk pengiriman otomatis</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <InputField
                                    label="SMTP Host"
                                    value={settings.smtp_host}
                                    onChange={(v) => handleChange('smtp_host', v)}
                                    placeholder="smtp.gmail.com"
                                />
                                <InputField
                                    label="SMTP Port"
                                    value={settings.smtp_port}
                                    onChange={(v) => handleChange('smtp_port', v)}
                                    placeholder="587"
                                    type="number"
                                />
                                <InputField
                                    label="SMTP Username"
                                    value={settings.smtp_user}
                                    onChange={(v) => handleChange('smtp_user', v)}
                                    placeholder="email@gmail.com"
                                />
                                <InputField
                                    label="SMTP Password"
                                    value={settings.smtp_password}
                                    onChange={(v) => handleChange('smtp_password', v)}
                                    placeholder="App password"
                                    type="password"
                                />
                                <InputField
                                    label="Nama Pengirim"
                                    value={settings.smtp_from_name}
                                    onChange={(v) => handleChange('smtp_from_name', v)}
                                    placeholder="RSQUARE"
                                />
                                <InputField
                                    label="Email Pengirim"
                                    value={settings.smtp_from_email}
                                    onChange={(v) => handleChange('smtp_from_email', v)}
                                    placeholder="noreply@rsquare.com"
                                />
                            </div>

                            <div className="mt-4 p-3 bg-pink-100 border border-pink-200 rounded-lg">
                                <p className="text-xs text-pink-700">
                                    <strong>Untuk Gmail:</strong> Gunakan App Password, bukan password biasa. Buat di Google Account → Security → 2-Step Verification → App passwords
                                </p>
                            </div>

                            {/* Test Email Button */}
                            <div className="mt-4 flex items-center gap-3">
                                <button
                                    onClick={handleTestEmail}
                                    disabled={testingEmail}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {testingEmail ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="h-4 w-4" />
                                            Kirim Email Test
                                        </>
                                    )}
                                </button>
                                {testEmailResult && (
                                    <div className={`flex items-center gap-2 text-sm ${testEmailResult.success ? 'text-green-600' : 'text-red-600'}`}>
                                        {testEmailResult.success ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4" />
                                        )}
                                        {testEmailResult.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Email Template */}
                        <div className="p-5 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border-2 border-rose-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Template Email</h4>
                                    <p className="text-sm text-gray-600">Email yang dikirim saat pembayaran dikonfirmasi</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <InputField
                                    label="Subject Email"
                                    value={settings.email_subject_template}
                                    onChange={(v) => handleChange('email_subject_template', v)}
                                    placeholder="Link Download Template - {{order_number}}"
                                />

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Body Email</label>
                                    <textarea
                                        value={settings.email_body_template}
                                        onChange={(e) => handleChange('email_body_template', e.target.value)}
                                        placeholder="Tulis template email..."
                                        rows={12}
                                        className="w-full px-4 py-3 bg-white border-2 border-rose-200 rounded-xl font-mono text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-rose-100 border border-rose-200 rounded-lg">
                                <p className="text-xs text-rose-700 mb-2"><strong>Variable yang tersedia:</strong></p>
                                <div className="flex flex-wrap gap-2">
                                    {['{{customer_name}}', '{{customer_email}}', '{{order_number}}', '{{total_amount}}', '{{download_links}}'].map((v) => (
                                        <code key={v} className="px-2 py-1 bg-white rounded text-xs text-rose-600 border border-rose-200">{v}</code>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tracking Tab */}
                {activeTab === 'tracking' && (
                    <div className="space-y-6">
                        <SectionHeader
                            icon={BarChart3}
                            title="Tracking & Analytics"
                            subtitle="Integrasi pixel untuk ads dan analytics"
                            color="cyan"
                        />

                        <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
                            <div className="flex gap-3">
                                <Info className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-cyan-800">
                                    <p className="font-medium mb-1">Cara Mendapatkan Pixel ID:</p>
                                    <ul className="list-disc list-inside space-y-1 text-cyan-700">
                                        <li><strong>Meta Pixel:</strong> business.facebook.com/events_manager</li>
                                        <li><strong>Google Analytics:</strong> analytics.google.com (format: G-XXXXXXXXXX)</li>
                                        <li><strong>Google Tag Manager:</strong> tagmanager.google.com (format: GTM-XXXXXXX)</li>
                                        <li><strong>TikTok Pixel:</strong> ads.tiktok.com</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            {/* Meta Pixel */}
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Meta Pixel (Facebook)</h4>
                                        <p className="text-sm text-gray-600">Track konversi dari Meta Ads</p>
                                    </div>
                                </div>
                                <InputField
                                    label="Pixel ID"
                                    value={settings.meta_pixel_id}
                                    onChange={(v) => handleChange('meta_pixel_id', v)}
                                    placeholder="123456789012345"
                                    className="font-mono"
                                    iconColor="text-blue-500"
                                />
                            </div>

                            {/* Google Analytics */}
                            <div className="p-5 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Google Analytics 4</h4>
                                        <p className="text-sm text-gray-600">Tracking pengunjung website</p>
                                    </div>
                                </div>
                                <InputField
                                    label="Measurement ID"
                                    value={settings.google_analytics_id}
                                    onChange={(v) => handleChange('google_analytics_id', v)}
                                    placeholder="G-XXXXXXXXXX"
                                    className="font-mono"
                                    iconColor="text-orange-500"
                                />
                            </div>

                            {/* Google Tag Manager */}
                            <div className="p-5 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border-2 border-sky-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                                        <Code className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Google Tag Manager</h4>
                                        <p className="text-sm text-gray-600">Kelola semua tag dari satu tempat</p>
                                    </div>
                                </div>
                                <InputField
                                    label="Container ID"
                                    value={settings.google_tag_manager_id}
                                    onChange={(v) => handleChange('google_tag_manager_id', v)}
                                    placeholder="GTM-XXXXXXX"
                                    className="font-mono"
                                    iconColor="text-sky-500"
                                />
                            </div>

                            {/* TikTok Pixel */}
                            <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-gray-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">TikTok Pixel</h4>
                                        <p className="text-sm text-gray-400">Track konversi dari TikTok Ads</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-2 block">Pixel ID</label>
                                    <input
                                        type="text"
                                        value={settings.tiktok_pixel_id}
                                        onChange={(e) => handleChange('tiktok_pixel_id', e.target.value)}
                                        placeholder="XXXXXXXXXXXXXXXXX"
                                        className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Custom Script */}
                        <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <Code className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Custom Head Script</h4>
                                    <p className="text-sm text-gray-600">Tambahkan script lain ke head (Twitter Pixel, Hotjar, dll)</p>
                                </div>
                            </div>
                            <textarea
                                value={settings.custom_head_script}
                                onChange={(e) => handleChange('custom_head_script', e.target.value)}
                                placeholder="<!-- Paste your script here -->"
                                rows={6}
                                className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-xl font-mono text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                            />
                            <p className="text-xs text-purple-600 mt-2">
                                Pastikan script valid dan aman. Script akan dimasukkan ke dalam tag &lt;head&gt;.
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

function SectionHeader({ icon: Icon, title, subtitle, color }: { icon: React.ElementType, title: string, subtitle: string, color: string }) {
    const colors: Record<string, { bg: string, text: string }> = {
        orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
        green: { bg: 'bg-green-100', text: 'text-green-600' },
        cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
        pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
    }
    const c = colors[color] || colors.orange

    return (
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className={`p-2.5 ${c.bg} rounded-xl`}>
                <Icon className={`h-5 w-5 ${c.text}`} />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
        </div>
    )
}

function InputField({
    label,
    icon: Icon,
    value,
    onChange,
    type = 'text',
    placeholder,
    className = '',
    iconColor = 'text-gray-400',
    min,
    max,
    isTextarea = false,
    rows = 3
}: {
    label: string
    icon?: React.ElementType
    value: string
    onChange: (v: string) => void
    type?: string
    placeholder?: string
    className?: string
    iconColor?: string
    min?: number
    max?: number
    isTextarea?: boolean
    rows?: number
}) {
    const InputComponent = isTextarea ? 'textarea' : 'input'

    return (
        <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
                {label}
            </label>
            <InputComponent
                type={type}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
                placeholder={placeholder}
                min={min}
                max={max}
                rows={isTextarea ? rows : undefined}
                className={`w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all mt-1 ${isTextarea ? 'resize-none' : ''} ${className}`}
            />
        </div>
    )
}

function ToggleCard({ icon: Icon, label, description, active, onToggle, color }: {
    icon: React.ElementType
    label: string
    description: string
    active: boolean
    onToggle: () => void
    color: string
}) {
    const colors: Record<string, { bg: string, icon: string }> = {
        purple: { bg: 'bg-purple-50 border-purple-200', icon: 'text-purple-500' },
        green: { bg: 'bg-green-50 border-green-200', icon: 'text-green-500' },
    }
    const c = colors[color] || colors.green

    return (
        <div className={`p-4 ${c.bg} rounded-xl border flex items-center justify-between`}>
            <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${c.icon}`} />
                <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`relative w-14 h-8 rounded-full transition-colors ${active ? 'bg-green-500' : 'bg-gray-300'}`}
            >
                <div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all"
                    style={{ left: active ? 30 : 4 }}
                />
            </button>
        </div>
    )
}
