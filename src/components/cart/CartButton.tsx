'use client'

import { ClientLordIcon } from '@/components/ui/lordicon'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { Search, Package, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Download, Mail } from 'lucide-react'

interface DownloadLink {
    title: string
    url: string
}

interface OrderConfirmation {
    id: number
    order_number: string
    customer_name: string
    customer_email: string
    amount: number
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    downloadLinks?: DownloadLink[]
}

// Helper function to convert Google Drive view URL to direct download URL
function getDirectDownloadUrl(url: string): string {
    // Match Google Drive file URL pattern
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
    if (driveMatch) {
        const fileId = driveMatch[1]
        return `https://drive.google.com/uc?export=download&id=${fileId}`
    }
    // For Google Sheets - create a copy URL
    const sheetsMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([^/]+)/)
    if (sheetsMatch) {
        const fileId = sheetsMatch[1]
        return `https://docs.google.com/spreadsheets/d/${fileId}/copy`
    }
    return url
}


export function CartButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'cart' | 'order'>('cart')
    const { items, removeItem, clearCart, totalItems, totalPrice } = useCart()
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Order tracking state
    const [orderNumber, setOrderNumber] = useState('')
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState('')
    const [orderResult, setOrderResult] = useState<OrderConfirmation | null>(null)
    const [searched, setSearched] = useState(false)
    const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const handleSearchOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!orderNumber.trim()) {
            setSearchError('Masukkan nomor pesanan')
            return
        }
        setSearchLoading(true)
        setSearchError('')
        setOrderResult(null)
        setSearched(true)
        setEmailStatus('idle') // Reset email status on new search

        try {
            const res = await fetch(`/api/qris-confirmation?orderNumber=${encodeURIComponent(orderNumber.trim())}`)
            const data = await res.json()
            if (data.confirmations && data.confirmations.length > 0) {
                setOrderResult(data.confirmations[0])
            } else {
                setSearchError('Pesanan tidak ditemukan')
            }
        } catch {
            setSearchError('Gagal mencari pesanan')
        } finally {
            setSearchLoading(false)
        }
    }

    const statusConfig = {
        pending: { label: 'Menunggu', color: 'bg-amber-100 text-amber-700', icon: Clock },
        approved: { label: 'Dikonfirmasi', color: 'bg-green-100 text-green-700', icon: CheckCircle },
        rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle },
    }

    const handleResendEmail = async () => {
        if (!orderResult || orderResult.status !== 'approved' || !orderResult.downloadLinks?.length) return

        setEmailStatus('sending')
        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: orderResult.customer_email,
                    customerName: orderResult.customer_name,
                    orderNumber: orderResult.order_number,
                    totalAmount: orderResult.amount,
                    downloadLinks: orderResult.downloadLinks,
                }),
            })

            if (res.ok) {
                setEmailStatus('success')
                setTimeout(() => setEmailStatus('idle'), 5000) // Reset after 5 seconds
            } else {
                setEmailStatus('error')
            }
        } catch {
            setEmailStatus('error')
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Cart Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors group"
            >
                <ClientLordIcon
                    src="https://cdn.lordicon.com/pbrgppbb.json"
                    trigger="hover"
                    colors="primary:#ea580c"
                    style={{ width: '22px', height: '22px' }}
                />
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {totalItems}
                    </span>
                )}
            </button>

            {/* Cart Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                        {/* Header with Tabs */}
                        <div className="border-b bg-gray-50">
                            <div className="flex items-center justify-between px-4 py-2">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setActiveTab('cart')}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'cart'
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Keranjang {totalItems > 0 && `(${totalItems})`}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('order')}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'order'
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Cek Pesanan
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <ClientLordIcon
                                        src="https://cdn.lordicon.com/nqtddedc.json"
                                        trigger="hover"
                                        colors="primary:#6b7280"
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Cart Tab */}
                        {activeTab === 'cart' && (
                            <div className="max-h-80 overflow-y-auto">
                                {items.length === 0 ? (
                                    <div className="text-center py-8 px-4">
                                        <ClientLordIcon
                                            src="https://cdn.lordicon.com/pbrgppbb.json"
                                            trigger="loop"
                                            delay="2000"
                                            colors="primary:#d1d5db"
                                            style={{ width: '48px', height: '48px' }}
                                        />
                                        <p className="text-gray-500 text-sm mt-2">Keranjang masih kosong</p>
                                        <p className="text-xs text-gray-400 mt-1">Tambahkan template yang ingin dibeli</p>
                                    </div>
                                ) : (
                                    <div className="p-3 space-y-2">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                                            >
                                                <Link
                                                    href={`/templates/${item.slug}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex gap-3 flex-1 min-w-0"
                                                >
                                                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                        {item.image ? (
                                                            <Image
                                                                src={item.image}
                                                                alt={item.title}
                                                                width={56}
                                                                height={56}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                                                <ClientLordIcon
                                                                    src="https://cdn.lordicon.com/ghhwiltn.json"
                                                                    trigger="loop"
                                                                    colors="primary:#f97316"
                                                                    style={{ width: '24px', height: '24px' }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-gray-900 text-sm leading-tight line-clamp-1 hover:text-orange-600 transition-colors">{item.title}</h4>
                                                        <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded">
                                                            {item.category}
                                                        </span>
                                                        <div className="mt-0.5">
                                                            {item.discountPrice ? (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-bold text-orange-600 text-sm">Rp {item.discountPrice.toLocaleString('id-ID')}</span>
                                                                    <span className="text-xs text-gray-400 line-through">Rp {item.price.toLocaleString('id-ID')}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="font-bold text-orange-600 text-sm">
                                                                    {item.price === 0 ? 'Gratis' : `Rp ${item.price.toLocaleString('id-ID')}`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        removeItem(item.id)
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors self-start flex-shrink-0"
                                                >
                                                    <ClientLordIcon
                                                        src="https://cdn.lordicon.com/skkahier.json"
                                                        trigger="hover"
                                                        colors="primary:#ef4444"
                                                        style={{ width: '16px', height: '16px' }}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer - Only show in cart tab with items */}
                        {activeTab === 'cart' && items.length > 0 && (
                            <div className="p-3 border-t bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-600">Total</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {totalPrice === 0 ? 'Gratis' : `Rp ${totalPrice.toLocaleString('id-ID')}`}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        href="/checkout"
                                        onClick={() => setIsOpen(false)}
                                        className="group relative flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm overflow-hidden"
                                    >
                                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                        <span className="relative z-10">Checkout</span>
                                        <ClientLordIcon
                                            src="https://cdn.lordicon.com/whtfgdfm.json"
                                            trigger="loop-on-hover"
                                            colors="primary:#ffffff"
                                            style={{ width: '18px', height: '18px' }}
                                            className="relative z-10"
                                        />
                                    </Link>
                                    <button
                                        onClick={() => {
                                            clearCart()
                                            setIsOpen(false)
                                        }}
                                        className="w-full py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors text-xs flex items-center justify-center gap-1"
                                    >
                                        <ClientLordIcon
                                            src="https://cdn.lordicon.com/skkahier.json"
                                            trigger="hover"
                                            colors="primary:#6b7280"
                                            style={{ width: '14px', height: '14px' }}
                                        />
                                        Kosongkan Keranjang
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Order Tab */}
                        {activeTab === 'order' && (
                            <div className="p-4">
                                <form onSubmit={handleSearchOrder} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Nomor Pesanan</label>
                                        <div className="relative">
                                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={orderNumber}
                                                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                                                placeholder="RSQ-XXXXXXXX-XXXXXX"
                                                className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono uppercase"
                                            />
                                        </div>
                                    </div>
                                    {searchError && (
                                        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {searchError}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={searchLoading}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                                    >
                                        {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        {searchLoading ? 'Mencari...' : 'Cek Status'}
                                    </button>
                                </form>

                                {/* Search Result */}
                                {searched && !searchLoading && orderResult && (
                                    <div className="mt-4">
                                        {/* Order Info Card */}
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            {(() => {
                                                const status = statusConfig[orderResult.status]
                                                const StatusIcon = status.icon
                                                return (
                                                    <>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-mono text-sm font-bold text-gray-900">{orderResult.order_number}</span>
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                                                                <StatusIcon className="h-3 w-3" />
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1 text-xs text-gray-600">
                                                            <p><span className="text-gray-500">Nama:</span> {orderResult.customer_name}</p>
                                                            <p><span className="text-gray-500">Total:</span> <span className="font-bold text-orange-600">Rp {orderResult.amount.toLocaleString('id-ID')}</span></p>
                                                            <p><span className="text-gray-500">Tanggal:</span> {new Date(orderResult.created_at).toLocaleDateString('id-ID')}</p>
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>

                                        {/* Download Links - Show immediately for approved orders */}
                                        {orderResult.status === 'approved' && orderResult.downloadLinks && orderResult.downloadLinks.length > 0 && (
                                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
                                                    <Download className="h-3.5 w-3.5" />
                                                    Download Template Kamu
                                                </p>
                                                <div className="space-y-2">
                                                    {orderResult.downloadLinks.map((link, index) => (
                                                        <a
                                                            key={index}
                                                            href={getDirectDownloadUrl(link.url)}
                                                            download
                                                            className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg text-sm hover:bg-green-100 transition-colors group border border-green-200"
                                                        >
                                                            <span className="text-gray-700 font-medium truncate">{link.title}</span>
                                                            <Download className="h-4 w-4 text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                                        </a>
                                                    ))}
                                                </div>
                                                <div className="mt-3">
                                                    {emailStatus === 'success' ? (
                                                        <div className="flex items-center justify-center gap-2 p-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium animate-in fade-in slide-in-from-top-1">
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                            Email berhasil dikirim ulang!
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={handleResendEmail}
                                                                disabled={emailStatus === 'sending'}
                                                                className="w-full flex items-center justify-center gap-2 p-2 text-xs text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-dashed border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {emailStatus === 'sending' ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <Mail className="h-3.5 w-3.5" />
                                                                )}
                                                                {emailStatus === 'sending' ? 'Mengirim...' : 'Kirim Ulang Link ke Email'}
                                                            </button>
                                                            {emailStatus === 'error' && (
                                                                <p className="mt-1 text-xs text-red-600 text-center animate-in fade-in">
                                                                    Gagal mengirim email. Silakan coba lagi.
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* If approved but no download links found */}
                                        {orderResult.status === 'approved' && (!orderResult.downloadLinks || orderResult.downloadLinks.length === 0) && (
                                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                <p className="text-xs text-amber-700 flex items-center gap-1">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    Pesanan dikonfirmasi, namun link download tidak tersedia. Hubungi admin untuk bantuan.
                                                </p>
                                            </div>
                                        )}

                                        {/* Pending status */}
                                        {orderResult.status === 'pending' && (
                                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                <p className="text-xs text-amber-700 flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Pembayaran sedang diverifikasi (maks 1x24 jam)
                                                </p>
                                            </div>
                                        )}

                                        {/* Rejected status */}
                                        {orderResult.status === 'rejected' && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-xs text-red-700 flex items-center gap-1">
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Pembayaran ditolak. Hubungi admin untuk info lebih lanjut.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {searched && !searchLoading && !orderResult && !searchError && (
                                    <div className="mt-4 text-center py-4">
                                        <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Pesanan tidak ditemukan</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
