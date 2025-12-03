'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
    Info
} from 'lucide-react'

interface SettingsData {
    site_name: string
    site_description: string
    contact_email: string
    voucher_code: string
    voucher_discount: string
    voucher_active: string
    homepage_free_limit: string
    homepage_featured_limit: string
}

const defaultSettings: SettingsData = {
    site_name: 'RSQUARE',
    site_description: 'Platform template Google Sheets premium',
    contact_email: 'hello@rsquareidea.my.id',
    voucher_code: '',
    voucher_discount: '10',
    voucher_active: 'false',
    homepage_free_limit: '4',
    homepage_featured_limit: '4',
}

const tabs = [
    { id: 'general', label: 'Umum', icon: Globe, color: 'orange' },
    { id: 'voucher', label: 'Voucher', icon: Ticket, color: 'purple' },
    { id: 'homepage', label: 'Beranda', icon: Layout, color: 'blue' },
]

export default function SettingsPage() {
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [settings, setSettings] = useState<SettingsData>(defaultSettings)
    const [activeTab, setActiveTab] = useState('general')
    const [stats, setStats] = useState({ freeCount: 0, featuredCount: 0 })

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) {
                    setSettings(prev => ({ ...prev, ...data.settings }))
                }
            })
            .catch(console.error)

        // Get product stats
        fetch('/api/admin/products')
            .then(res => res.json())
            .then(data => {
                if (data.products) {
                    const freeCount = data.products.filter((p: any) => p.is_free && p.is_active).length
                    const featuredCount = data.products.filter((p: any) => p.is_featured && p.is_active).length
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

    const tabColors: Record<string, string> = {
        orange: 'from-orange-500 to-amber-500',
        purple: 'from-purple-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500',
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
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all duration-200 ${
                        saved 
                            ? 'bg-green-500 text-white shadow-green-200' 
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200 hover:shadow-xl'
                    } disabled:opacity-70`}
                >
                    {saved ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                    {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan'}
                </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900'
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

                        {/* Info Box */}
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

                        {/* Stats */}
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

                        {/* Tip */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600">
                                <strong>Tips:</strong> Untuk mengubah produk mana yang muncul di beranda, edit produk di menu{' '}
                                <Link href="/admin/products" className="text-orange-600 hover:underline font-medium">Produk</Link>{' '}
                                dan centang opsi Gratis atau Produk Unggulan.
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

function SectionHeader({ icon: Icon, title, subtitle, color }: { icon: any, title: string, subtitle: string, color: string }) {
    const colors: Record<string, { bg: string, text: string }> = {
        orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    }
    const c = colors[color]
    
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
    icon?: any
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
                onChange={(e: any) => onChange(e.target.value)} 
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
    icon: any
    label: string
    description: string
    active: boolean
    onToggle: () => void
    color: string 
}) {
    const colors: Record<string, { bg: string, icon: string }> = {
        purple: { bg: 'bg-purple-50 border-purple-200', icon: 'text-purple-500' },
    }
    const c = colors[color]

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
