'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
    ShoppingCart, 
    Trash2, 
    ArrowLeft, 
    User, 
    Mail, 
    Phone,
    CreditCard,
    QrCode,
    Check,
    Copy,
    Building2,
    Loader2,
    Download
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

interface PaymentMethod {
    id: number
    name: string
    type: 'internal' | 'external'
    bankName: string | null
    accountNumber: string | null
    accountName: string | null
    qrCodeImage: string | null
    externalUrl: string | null
    instructions: string | null
    isActive: boolean
}

export default function CheckoutPage() {
    const router = useRouter()
    const { items, removeItem, clearCart, totalPrice } = useCart()
    const [step, setStep] = useState(1)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [orderNumber, setOrderNumber] = useState('')
    const [purchasedItems, setPurchasedItems] = useState<typeof items>([])
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    })

    useEffect(() => {
        // Fetch payment methods
        fetch('/api/payments')
            .then(res => res.json())
            .then(data => {
                if (data.payments) {
                    setPaymentMethods(data.payments.filter((p: PaymentMethod) => p.isActive))
                }
            })
            .catch(console.error)
    }, [])

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const generateOrderNumber = () => {
        const date = new Date()
        const random = Math.random().toString(36).substring(2, 8).toUpperCase()
        return `RSQ-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}-${random}`
    }

    const handleSubmitOrder = async () => {
        if (!selectedPayment) return
        
        setLoading(true)
        const newOrderNumber = generateOrderNumber()
        
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderNumber: newOrderNumber,
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    items: items.map(item => ({
                        productId: item.id,
                        productTitle: item.title,
                        price: item.discountPrice || item.price,
                    })),
                    totalAmount: totalPrice,
                    paymentMethod: selectedPayment.name,
                }),
            })

            if (res.ok) {
                setOrderNumber(newOrderNumber)
                setPurchasedItems([...items])
                setStep(3)
            }
        } catch (error) {
            console.error('Error creating order:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFinish = () => {
        clearCart()
        router.push('/')
    }

    if (items.length === 0 && step !== 3) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-6">
                    <div className="max-w-md mx-auto text-center py-16">
                        <ShoppingCart className="h-20 w-20 mx-auto text-gray-200 mb-6" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Kosong</h1>
                        <p className="text-gray-500 mb-6">Tambahkan template ke keranjang untuk melanjutkan checkout</p>
                        <Link href="/templates" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Lihat Template
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                                step >= s ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                                {step > s ? <Check className="h-4 w-4" /> : s}
                            </div>
                            {s < 3 && <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-orange-500' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Step 1: Customer Info */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Form */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <User className="h-5 w-5 text-orange-500" /> Data Pembeli
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <User className="h-4 w-4 text-gray-400" /> Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                                placeholder="Nama lengkap Anda"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <Mail className="h-4 w-4 text-gray-400" /> Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                                placeholder="email@domain.com"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <Phone className="h-4 w-4 text-gray-400" /> No. WhatsApp
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                                placeholder="08xxxxxxxxxx"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5 text-orange-500" /> Ringkasan Pesanan
                                    </h2>
                                    <div className="space-y-3 mb-6">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
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
                                                            <ShoppingCart className="w-5 h-5 text-orange-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 text-sm truncate">{item.title}</h4>
                                                    <p className="text-sm font-bold text-orange-600">
                                                        {(item.discountPrice || item.price) === 0 ? 'Gratis' : `Rp ${(item.discountPrice || item.price).toLocaleString('id-ID')}`}
                                                    </p>
                                                </div>
                                                <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-orange-600">{totalPrice === 0 ? 'Gratis' : `Rp ${totalPrice.toLocaleString('id-ID')}`}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!formData.name || !formData.email}
                                    className="px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Lanjut ke Pembayaran
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Payment */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-orange-500" /> Pilih Metode Pembayaran
                                </h2>
                                
                                {paymentMethods.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Belum ada metode pembayaran tersedia</p>
                                        <p className="text-sm text-gray-400 mt-1">Silakan hubungi admin</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {paymentMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => setSelectedPayment(method)}
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                                                    selectedPayment?.id === method.id
                                                        ? 'border-orange-500 bg-orange-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                    selectedPayment?.id === method.id ? 'bg-orange-500' : 'bg-gray-100'
                                                }`}>
                                                    {method.type === 'external' ? (
                                                        <CreditCard className={`h-6 w-6 ${selectedPayment?.id === method.id ? 'text-white' : 'text-gray-500'}`} />
                                                    ) : method.qrCodeImage ? (
                                                        <QrCode className={`h-6 w-6 ${selectedPayment?.id === method.id ? 'text-white' : 'text-gray-500'}`} />
                                                    ) : (
                                                        <Building2 className={`h-6 w-6 ${selectedPayment?.id === method.id ? 'text-white' : 'text-gray-500'}`} />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-900">{method.name}</p>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                            method.type === 'external' 
                                                                ? 'bg-purple-100 text-purple-700' 
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {method.type === 'external' ? 'External' : 'Transfer'}
                                                        </span>
                                                    </div>
                                                    {method.bankName && <p className="text-sm text-gray-500">{method.bankName}</p>}
                                                    {method.type === 'external' && <p className="text-sm text-gray-500">Redirect ke halaman pembayaran</p>}
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                    selectedPayment?.id === method.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                                                }`}>
                                                    {selectedPayment?.id === method.id && <Check className="h-4 w-4 text-white" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Payment Details */}
                                {selectedPayment && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-6 p-6 bg-gray-50 rounded-xl"
                                    >
                                        <h3 className="font-semibold text-gray-900 mb-4">Detail Pembayaran</h3>
                                        
                                        {/* External Payment */}
                                        {selectedPayment.type === 'external' && selectedPayment.externalUrl && (
                                            <div className="text-center mb-4 p-6 bg-purple-50 rounded-xl border border-purple-200">
                                                <CreditCard className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                                                <p className="text-purple-800 font-medium mb-2">Pembayaran External</p>
                                                <p className="text-sm text-purple-600 mb-4">Anda akan diarahkan ke halaman pembayaran {selectedPayment.name}</p>
                                                <a
                                                    href={selectedPayment.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                                                >
                                                    Bayar via {selectedPayment.name}
                                                </a>
                                            </div>
                                        )}

                                        {/* QRIS / QR Code */}
                                        {selectedPayment.type === 'internal' && selectedPayment.qrCodeImage && (
                                            <div className="text-center mb-4">
                                                <div className="inline-block p-4 bg-white rounded-xl shadow-sm">
                                                    <img 
                                                        src={selectedPayment.qrCodeImage} 
                                                        alt="QRIS" 
                                                        className="w-48 h-48 mx-auto"
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">Scan QR Code dengan aplikasi e-wallet atau m-banking</p>
                                            </div>
                                        )}

                                        {/* Bank Transfer */}
                                        {selectedPayment.type === 'internal' && selectedPayment.accountNumber && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Bank</p>
                                                        <p className="font-semibold">{selectedPayment.bankName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                    <div>
                                                        <p className="text-sm text-gray-500">No. Rekening</p>
                                                        <p className="font-semibold font-mono">{selectedPayment.accountNumber}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopy(selectedPayment.accountNumber!)}
                                                        className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg"
                                                    >
                                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Atas Nama</p>
                                                        <p className="font-semibold">{selectedPayment.accountName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Amount to Pay */}
                                        <div className="mt-4 p-4 bg-orange-100 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-orange-800">Total Bayar</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-orange-600">
                                                        Rp {totalPrice.toLocaleString('id-ID')}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(totalPrice.toString())}
                                                        className="p-1.5 text-orange-500 hover:bg-orange-200 rounded"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedPayment.instructions && (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                                                <p className="text-sm text-blue-800 whitespace-pre-line">{selectedPayment.instructions}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-600 hover:text-gray-900">
                                    <ArrowLeft className="h-4 w-4 inline mr-2" /> Kembali
                                </button>
                                <button
                                    onClick={handleSubmitOrder}
                                    disabled={!selectedPayment || loading}
                                    className="px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Konfirmasi Pesanan
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="h-10 w-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil Dibuat!</h2>
                                <p className="text-gray-500 mb-2">Nomor Pesanan:</p>
                                <p className="text-xl font-mono font-bold text-orange-600 mb-4">{orderNumber}</p>
                            </div>

                            {/* Download Links */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 max-w-lg mx-auto">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Download className="h-5 w-5 text-green-500" />
                                    Link Download Template
                                </h3>
                                <div className="space-y-3">
                                    {purchasedItems.map((item) => (
                                        <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                                            <p className="font-medium text-gray-900 mb-2">{item.title}</p>
                                            {item.downloadUrl ? (
                                                <a
                                                    href={item.downloadUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download Template
                                                </a>
                                            ) : (
                                                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                                    Link download akan tersedia setelah pembayaran dikonfirmasi
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Reminder */}
                            {selectedPayment && selectedPayment.type === 'internal' && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 max-w-lg mx-auto">
                                    <h3 className="font-bold text-amber-800 mb-2">Catatan Pembayaran</h3>
                                    <p className="text-sm text-amber-700">
                                        Silakan lakukan pembayaran ke {selectedPayment.bankName || selectedPayment.name} sesuai nominal yang tertera. 
                                        Setelah melakukan pembayaran, konfirmasi via WhatsApp untuk mempercepat proses verifikasi.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleFinish}
                                    className="px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                                >
                                    Kembali ke Beranda
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
