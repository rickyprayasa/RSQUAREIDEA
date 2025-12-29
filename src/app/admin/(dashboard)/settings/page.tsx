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
    CheckCircle2,
    Gift,
    Coffee,
    Link as LinkIcon,
    Copy,
    Bell,
    Send,
    MessageCircle
} from 'lucide-react'
import jsQR from 'jsqr'

interface SettingsData {
    site_name: string
    site_description: string
    contact_email: string
    active_users_count: string
    external_sales_count: string
    voucher_code: string
    voucher_discount: string
    voucher_active: string
    voucher_valid_from: string
    voucher_valid_until: string
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
    // Saweria reward settings
    saweria_reward_enabled: string
    saweria_reward_product_id: string
    saweria_min_donation: string
    saweria_reward_message: string
    // Telegram notification settings
    telegram_enabled: string
    telegram_bot_token: string
    telegram_chat_id: string
    telegram_keepalive_notify: string
    // Duitku payment gateway settings
    duitku_enabled: string
    duitku_merchant_code: string
    duitku_api_key: string
    duitku_production: string
}

const defaultSettings: SettingsData = {
    site_name: 'RSQUARE',
    site_description: 'Platform template Google Sheets premium',
    contact_email: 'hello@rsquareidea.my.id',
    active_users_count: '0',
    external_sales_count: '0',
    voucher_code: '',
    voucher_discount: '10',
    voucher_active: 'false',
    voucher_valid_from: '',
    voucher_valid_until: '',
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
    // Saweria reward settings
    saweria_reward_enabled: 'false',
    saweria_reward_product_id: '',
    saweria_min_donation: '50000',
    saweria_reward_message: 'Terima kasih atas dukungannya! Sebagai apresiasi, silakan download template gratis berikut:',
    // Telegram notification settings
    telegram_enabled: 'false',
    telegram_bot_token: '',
    telegram_chat_id: '',
    telegram_keepalive_notify: 'false',
    // Duitku payment gateway settings
    duitku_enabled: 'false',
    duitku_merchant_code: '',
    duitku_api_key: '',
    duitku_production: 'false',
}

const tabs = [
    { id: 'general', label: 'Umum', icon: Globe, color: 'orange' },
    { id: 'voucher', label: 'Voucher', icon: Ticket, color: 'purple' },
    { id: 'homepage', label: 'Beranda', icon: Layout, color: 'blue' },
    { id: 'payment', label: 'Pembayaran', icon: CreditCard, color: 'green' },
    { id: 'email', label: 'Email', icon: Mail, color: 'pink' },
    { id: 'tracking', label: 'Tracking', icon: BarChart3, color: 'cyan' },
    { id: 'saweria', label: 'Saweria', icon: Coffee, color: 'yellow' },
    { id: 'telegram', label: 'Telegram', icon: Bell, color: 'sky' },
    { id: 'duitku', label: 'Duitku', icon: CreditCard, color: 'emerald' },
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
    const [products, setProducts] = useState<{ id: number; title: string; slug: string }[]>([])
    const [copiedUrl, setCopiedUrl] = useState(false)

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
                    // Store products for Saweria dropdown
                    setProducts(data.products.filter((p: { is_active: boolean }) => p.is_active).map((p: { id: number; title: string; slug: string }) => ({
                        id: p.id,
                        title: p.title,
                        slug: p.slug
                    })))
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
        yellow: 'from-yellow-500 to-orange-500',
    }

    const activeTabData = tabs.find(t => t.id === activeTab)

    return (
        <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pengaturan</h1>
                    <p className="text-gray-500 text-sm md:text-base mt-0.5 md:mt-1">Konfigurasi website</p>
                </div>
                {/* Desktop Save Button */}
                <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all duration-200 ${saved
                        ? 'bg-green-500 text-white shadow-green-200'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200 hover:shadow-xl'
                        } disabled:opacity-70`}
                >
                    {saved ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                    {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan'}
                </motion.button>
            </div>

            {/* Mobile: Dropdown Tab Selector */}
            <div className="md:hidden">
                <div className="relative">
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                        className={`w-full appearance-none px-4 py-3 pr-10 bg-gradient-to-r ${tabColors[activeTabData?.color || 'orange']} text-white font-medium rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300`}
                    >
                        {tabs.map((tab) => (
                            <option key={tab.id} value={tab.id} className="text-gray-900 bg-white">
                                {tab.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Desktop: Horizontal Tabs */}
            <div className="hidden md:flex gap-1 p-1 bg-gray-100 rounded-2xl overflow-x-auto">
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

            {/* Mobile: Floating Save Button */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
                <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium shadow-xl transition-all duration-200 ${saved
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                        } disabled:opacity-70`}
                >
                    {saved ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                    {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan Pengaturan'}
                </motion.button>
            </div>

            {/* Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6"
            >
                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-4 md:space-y-6">
                        <SectionHeader
                            icon={Settings}
                            title="Pengaturan Umum"
                            subtitle="Informasi dasar website"
                            color="orange"
                        />
                        <div className="grid gap-4 md:gap-5">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                <InputField
                                    label="Jumlah Pengguna Aktif"
                                    icon={Users}
                                    type="number"
                                    value={settings.active_users_count}
                                    onChange={(v) => handleChange('active_users_count', v)}
                                    placeholder="0"
                                    iconColor="text-purple-500"
                                />
                                <InputField
                                    label="Total Penjualan (Platform Lain)"
                                    icon={ShoppingCart}
                                    type="number"
                                    value={settings.external_sales_count}
                                    onChange={(v) => handleChange('external_sales_count', v)}
                                    placeholder="0"
                                    iconColor="text-green-500"
                                />
                            </div>
                        </div>
                        <div className="mt-3 md:mt-4 p-2.5 md:p-3 bg-gray-50 border border-gray-200 rounded-xl">
                            <p className="text-xs text-gray-600">
                                <strong>Info:</strong> Data ini ditampilkan di halaman Tentang Kami. Total penjualan adalah gabungan dari penjualan di platform lain (Lynk.ID, Karyakarsa, Mayar.id, dll) + orders completed dari website ini.
                            </p>
                        </div>
                    </div>
                )}

                {/* Voucher Tab */}
                {activeTab === 'voucher' && (
                    <div className="space-y-4 md:space-y-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
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

                        {/* Masa Aktif Voucher */}
                        <div className="p-3 md:p-4 bg-purple-50 border border-purple-200 rounded-xl">
                            <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2 text-sm md:text-base">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Masa Aktif Voucher
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <label className="text-sm font-medium text-purple-700 mb-2 block">Berlaku Dari</label>
                                    <input
                                        type="datetime-local"
                                        value={settings.voucher_valid_from}
                                        onChange={(e) => handleChange('voucher_valid_from', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <p className="text-xs text-purple-600 mt-1">Kosongkan jika berlaku mulai sekarang</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-purple-700 mb-2 block">Berlaku Sampai</label>
                                    <input
                                        type="datetime-local"
                                        value={settings.voucher_valid_until}
                                        onChange={(e) => handleChange('voucher_valid_until', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <p className="text-xs text-purple-600 mt-1">Kosongkan jika tidak ada batas waktu</p>
                                </div>
                            </div>
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
                    <div className="space-y-4 md:space-y-6">
                        <SectionHeader
                            icon={Layout}
                            title="Pengaturan Beranda"
                            subtitle="Konfigurasi tampilan halaman beranda"
                            color="blue"
                        />

                        <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-xl">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="p-4 md:p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <Ticket className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-900 text-sm md:text-base">Template Gratis</h4>
                                        <p className="text-xs md:text-sm text-green-700">{stats.freeCount} produk tersedia</p>
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

                            <div className="p-4 md:p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-orange-500 rounded-lg">
                                        <Ticket className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-orange-900 text-sm md:text-base">Template Unggulan</h4>
                                        <p className="text-xs md:text-sm text-orange-700">{stats.featuredCount} produk tersedia</p>
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
                    <div className="space-y-4 md:space-y-6">
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
                    <div className="space-y-4 md:space-y-6">
                        <SectionHeader
                            icon={Mail}
                            title="Pengaturan Email"
                            subtitle="Konfigurasi SMTP dan template email otomatis"
                            color="pink"
                        />

                        {/* SMTP Settings */}
                        <div className="p-4 md:p-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200">
                            <div className="flex items-center gap-2 md:gap-3 mb-4">
                                <div className="w-9 h-9 md:w-10 md:h-10 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">Konfigurasi SMTP</h4>
                                    <p className="text-xs md:text-sm text-gray-600">Pengaturan server email</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                        <div className="p-4 md:p-5 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border-2 border-rose-200">
                            <div className="flex items-center gap-2 md:gap-3 mb-4">
                                <div className="w-9 h-9 md:w-10 md:h-10 bg-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">Template Email</h4>
                                    <p className="text-xs md:text-sm text-gray-600">Email saat pembayaran dikonfirmasi</p>
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
                    <div className="space-y-4 md:space-y-6">
                        <SectionHeader
                            icon={BarChart3}
                            title="Tracking & Analytics"
                            subtitle="Integrasi pixel untuk ads dan analytics"
                            color="cyan"
                        />

                        <div className="p-3 md:p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            {/* Meta Pixel */}
                            <div className="p-4 md:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                                <div className="flex items-center gap-2 md:gap-3 mb-4">
                                    <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
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
                {/* Saweria Tab */}
                {activeTab === 'saweria' && (
                    <div className="space-y-4 md:space-y-6">
                        <SectionHeader
                            icon={Coffee}
                            title="Saweria Reward"
                            subtitle="Berikan hadiah template gratis untuk donatur"
                            color="yellow"
                        />

                        <ToggleCard
                            icon={Gift}
                            label="Aktifkan Saweria Reward"
                            description="Tampilkan halaman download khusus untuk donatur Saweria"
                            active={settings.saweria_reward_enabled === 'true'}
                            onToggle={() => handleChange('saweria_reward_enabled', settings.saweria_reward_enabled === 'true' ? 'false' : 'true')}
                            color="yellow"
                        />

                        {settings.saweria_reward_enabled === 'true' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Gift className="h-4 w-4 text-yellow-600" />
                                        Pilih Produk Reward
                                    </label>
                                    <select
                                        value={settings.saweria_reward_product_id}
                                        onChange={(e) => handleChange('saweria_reward_product_id', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border-2 border-yellow-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                    >
                                        <option value="">-- Pilih Template --</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.title}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-yellow-700 mt-2">
                                        Template ini akan bisa didownload gratis oleh donatur
                                    </p>
                                </div>

                                <InputField
                                    label="Minimum Donasi (Rp)"
                                    icon={CreditCard}
                                    value={settings.saweria_min_donation}
                                    onChange={(v) => handleChange('saweria_min_donation', v)}
                                    type="number"
                                    placeholder="50000"
                                    iconColor="text-yellow-500"
                                />

                                <InputField
                                    label="Pesan untuk Donatur"
                                    icon={FileText}
                                    value={settings.saweria_reward_message}
                                    onChange={(v) => handleChange('saweria_reward_message', v)}
                                    placeholder="Terima kasih atas dukungannya!"
                                    iconColor="text-yellow-500"
                                    isTextarea
                                    rows={3}
                                />

                                {/* Generated URL */}
                                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4 text-yellow-600" />
                                        Link untuk Saweria
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={`${typeof window !== 'undefined' ? window.location.origin : 'https://rsquareidea.my.id'}/reward/saweria`}
                                            readOnly
                                            className="flex-1 px-4 py-3 bg-white border-2 border-yellow-300 rounded-xl text-sm font-mono text-gray-600"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/reward/saweria`)
                                                setCopiedUrl(true)
                                                setTimeout(() => setCopiedUrl(false), 2000)
                                            }}
                                            className={`px-4 py-3 rounded-xl font-medium transition-all ${copiedUrl
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                }`}
                                        >
                                            {copiedUrl ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-yellow-700 mt-2">
                                        Masukkan link ini ke &quot;Isi Kiriman&quot; di Saweria untuk donasi di atas Rp {parseInt(settings.saweria_min_donation || '50000').toLocaleString('id-ID')}
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-700">
                                            <p className="font-medium mb-1">Cara Setup di Saweria:</p>
                                            <ol className="list-decimal list-inside space-y-1 text-blue-600">
                                                <li>Buka saweria.co/appreciation</li>
                                                <li>Klik &quot;Buat Kiriman&quot;</li>
                                                <li>Isi pesan dan masukkan link di atas ke &quot;Isi Kiriman&quot;</li>
                                                <li>Set nominal minimum Rp {parseInt(settings.saweria_min_donation || '50000').toLocaleString('id-ID')}</li>
                                                <li>Klik Simpan</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {/* Telegram Tab */}
                {activeTab === 'telegram' && (
                    <TelegramSettings
                        settings={settings}
                        handleChange={handleChange}
                    />
                )}
                {/* Duitku Tab */}
                {activeTab === 'duitku' && (
                    <DuitkuSettings
                        settings={settings}
                        handleChange={handleChange}
                    />
                )}
            </motion.div>
        </div>
    )
}

function TelegramSettings({ settings, handleChange }: { settings: SettingsData, handleChange: (key: keyof SettingsData, value: string) => void }) {
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

    const testTelegram = async () => {
        setTesting(true)
        setTestResult(null)
        try {
            const response = await fetch(`https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: settings.telegram_chat_id,
                    text: `🧪 <b>Test Notifikasi RSQUARE</b>\n\nKoneksi Telegram berhasil! ✅\nWaktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
                    parse_mode: 'HTML',
                }),
            })
            const data = await response.json()
            if (data.ok) {
                setTestResult({ success: true, message: 'Pesan test berhasil dikirim! Cek Telegram Kamu.' })
            } else {
                setTestResult({ success: false, message: data.description || 'Gagal mengirim pesan' })
            }
        } catch (error) {
            setTestResult({ success: false, message: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error') })
        } finally {
            setTesting(false)
        }
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <SectionHeader
                icon={Bell}
                title="Notifikasi Telegram"
                subtitle="Terima notifikasi real-time via Telegram Bot"
                color="sky"
            />

            <ToggleCard
                icon={MessageCircle}
                label="Aktifkan Notifikasi Telegram"
                description="Kirim notifikasi ke Telegram saat ada pesanan baru, pembayaran, pesan, dll"
                active={settings.telegram_enabled === 'true'}
                onToggle={() => handleChange('telegram_enabled', settings.telegram_enabled === 'true' ? 'false' : 'true')}
                color="sky"
            />

            {settings.telegram_enabled === 'true' && (
                <div className="space-y-4">
                    <InputField
                        label="Bot Token"
                        icon={Code}
                        value={settings.telegram_bot_token}
                        onChange={(v) => handleChange('telegram_bot_token', v)}
                        placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                        iconColor="text-sky-500"
                    />
                    <p className="text-xs text-gray-500 -mt-2 ml-1">
                        Dapatkan dari @BotFather di Telegram
                    </p>

                    <InputField
                        label="Chat ID"
                        icon={Users}
                        value={settings.telegram_chat_id}
                        onChange={(v) => handleChange('telegram_chat_id', v)}
                        placeholder="-1001234567890 atau 123456789"
                        iconColor="text-sky-500"
                    />
                    <p className="text-xs text-gray-500 -mt-2 ml-1">
                        Chat ID pribadi atau grup. Dapatkan dari @userinfobot
                    </p>

                    <ToggleCard
                        icon={Bell}
                        label="Notifikasi Keep-alive"
                        description="Kirim notifikasi setiap kali cron keep-alive berjalan (setiap 3 hari)"
                        active={settings.telegram_keepalive_notify === 'true'}
                        onToggle={() => handleChange('telegram_keepalive_notify', settings.telegram_keepalive_notify === 'true' ? 'false' : 'true')}
                        color="sky"
                    />

                    {/* Test Button */}
                    <div className="pt-2">
                        <button
                            onClick={testTelegram}
                            disabled={testing || !settings.telegram_bot_token || !settings.telegram_chat_id}
                            className="w-full px-4 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {testing ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    Test Kirim Notifikasi
                                </>
                            )}
                        </button>
                    </div>

                    {testResult && (
                        <div className={`p-4 rounded-xl border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2">
                                {testResult.success ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                                <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                                    {testResult.message}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Setup Guide */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-2">Cara Setup Telegram Bot:</p>
                                <ol className="list-decimal list-inside space-y-1.5 text-blue-600">
                                    <li>Buka Telegram, cari <code className="bg-blue-100 px-1 rounded">@BotFather</code></li>
                                    <li>Kirim <code className="bg-blue-100 px-1 rounded">/newbot</code> dan ikuti instruksi</li>
                                    <li>Copy Bot Token yang diberikan</li>
                                    <li>Cari <code className="bg-blue-100 px-1 rounded">@userinfobot</code> untuk mendapatkan Chat ID</li>
                                    <li>Atau tambahkan bot ke grup dan gunakan Chat ID grup</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Notification Types */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Notifikasi yang akan dikirim:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>🛒 Pesanan baru</li>
                            <li>✅ Pembayaran dikonfirmasi</li>
                            <li>💬 Pesan masuk dari form kontak</li>
                            <li>⭐ Feedback baru</li>
                            <li>📋 Request template baru</li>
                            <li>📱 Konfirmasi QRIS baru</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

function DuitkuSettings({ settings, handleChange }: { settings: SettingsData, handleChange: (key: keyof SettingsData, value: string) => void }) {
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

    const testDuitku = async () => {
        setTesting(true)
        setTestResult(null)
        try {
            const response = await fetch('/api/duitku/payment-methods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 50000 }),
            })
            const data = await response.json()
            if (data.paymentMethods) {
                setTestResult({
                    success: true,
                    message: `Berhasil! ${data.paymentMethods.length} metode pembayaran tersedia.`
                })
            } else {
                setTestResult({ success: false, message: data.error || 'Gagal mengambil metode pembayaran' })
            }
        } catch (error) {
            setTestResult({ success: false, message: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error') })
        } finally {
            setTesting(false)
        }
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <SectionHeader
                icon={CreditCard}
                title="Duitku Payment Gateway"
                subtitle="Terima pembayaran otomatis via VA, QRIS, E-wallet"
                color="emerald"
            />

            <ToggleCard
                icon={CreditCard}
                label="Aktifkan Duitku"
                description="Gunakan Duitku sebagai payment gateway untuk menerima pembayaran otomatis"
                active={settings.duitku_enabled === 'true'}
                onToggle={() => handleChange('duitku_enabled', settings.duitku_enabled === 'true' ? 'false' : 'true')}
                color="emerald"
            />

            {settings.duitku_enabled === 'true' && (
                <div className="space-y-4">
                    <InputField
                        label="Merchant Code"
                        icon={Code}
                        value={settings.duitku_merchant_code}
                        onChange={(v) => handleChange('duitku_merchant_code', v)}
                        placeholder="DXXXXX"
                        iconColor="text-emerald-500"
                    />
                    <p className="text-xs text-gray-500 -mt-2 ml-1">
                        Dapatkan dari dashboard Duitku → Project
                    </p>

                    <InputField
                        label="API Key"
                        icon={Code}
                        value={settings.duitku_api_key}
                        onChange={(v) => handleChange('duitku_api_key', v)}
                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        iconColor="text-emerald-500"
                    />
                    <p className="text-xs text-gray-500 -mt-2 ml-1">
                        API Key dari dashboard Duitku → Project → API Key
                    </p>

                    <ToggleCard
                        icon={ShoppingCart}
                        label="Mode Production"
                        description="Aktifkan untuk menerima pembayaran real. Nonaktifkan untuk testing (Sandbox)"
                        active={settings.duitku_production === 'true'}
                        onToggle={() => handleChange('duitku_production', settings.duitku_production === 'true' ? 'false' : 'true')}
                        color="emerald"
                    />

                    {/* Test Button */}
                    <div className="pt-2">
                        <button
                            onClick={testDuitku}
                            disabled={testing || !settings.duitku_merchant_code || !settings.duitku_api_key}
                            className="w-full px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {testing ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-5 w-5" />
                                    Test Koneksi Duitku
                                </>
                            )}
                        </button>
                    </div>

                    {testResult && (
                        <div className={`p-4 rounded-xl border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2">
                                {testResult.success ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                                <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                                    {testResult.message}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Supported Payment Methods */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Metode Pembayaran yang Didukung:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                                <p className="font-medium text-gray-700">Virtual Account:</p>
                                <ul className="text-xs space-y-0.5">
                                    <li>• BCA, Mandiri, BNI, BRI</li>
                                    <li>• Permata, CIMB, BSI</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">E-Wallet & QRIS:</p>
                                <ul className="text-xs space-y-0.5">
                                    <li>• OVO, GoPay, DANA</li>
                                    <li>• ShopeePay, LinkAja</li>
                                    <li>• QRIS (semua bank)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Setup Guide */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-2">Cara Setup Duitku:</p>
                                <ol className="list-decimal list-inside space-y-1.5 text-blue-600">
                                    <li>Daftar di <a href="https://passport.duitku.com/merchant" target="_blank" rel="noopener noreferrer" className="underline">duitku.com</a></li>
                                    <li>Buat Project baru di dashboard</li>
                                    <li>Copy Merchant Code dan API Key</li>
                                    <li>Set Callback URL: <code className="bg-blue-100 px-1 rounded text-xs">https://rsquareidea.my.id/api/duitku/callback</code></li>
                                    <li>Test di mode Sandbox dulu sebelum Production</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
        sky: { bg: 'bg-sky-100', text: 'text-sky-600' },
        emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    }
    const c = colors[color] || colors.orange

    return (
        <div className="flex items-center gap-2 md:gap-3 pb-3 md:pb-4 border-b border-gray-100">
            <div className={`p-2 md:p-2.5 ${c.bg} rounded-lg md:rounded-xl`}>
                <Icon className={`h-4 w-4 md:h-5 md:w-5 ${c.text}`} />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{title}</h3>
                <p className="text-xs md:text-sm text-gray-500">{subtitle}</p>
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
            <label className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 flex items-center gap-1.5 md:gap-2">
                {Icon && <Icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${iconColor}`} />}
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
                className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${isTextarea ? 'resize-none' : ''} ${className}`}
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
        yellow: { bg: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-500' },
        sky: { bg: 'bg-sky-50 border-sky-200', icon: 'text-sky-500' },
        emerald: { bg: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-500' },
    }
    const c = colors[color] || colors.green

    return (
        <div className={`p-3 md:p-4 ${c.bg} rounded-xl border flex items-start md:items-center justify-between gap-3`}>
            <div className="flex items-start md:items-center gap-2 md:gap-3 flex-1 min-w-0">
                <Icon className={`h-5 w-5 ${c.icon} flex-shrink-0 mt-0.5 md:mt-0`} />
                <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm md:text-base">{label}</p>
                    <p className="text-xs md:text-sm text-gray-500 line-clamp-2">{description}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${active ? 'bg-green-500' : 'bg-gray-300'}`}
            >
                <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${active ? 'left-6' : 'left-1'}`}
                />
            </button>
        </div>
    )
}
