'use client'

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
    Download,
    Upload,
    Camera,
    Clock,
    AlertCircle,
    X,
    Ticket,
    Tag,
    ChevronDown,
    Zap,
    FileText
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { useCart } from '@/contexts/CartContext'
import { trackInitiateCheckout, trackPurchase, trackButtonClick } from '@/hooks/useAnalytics'

interface PaymentMethod {
    id: number
    name: string
    type: 'internal' | 'external' | 'duitku'
    bankName: string | null
    accountNumber: string | null
    accountName: string | null
    qrCodeImage: string | null
    externalUrl: string | null
    instructions: string | null
    isActive: boolean
    duitkuCode?: string
    duitkuFee?: string
    duitkuImage?: string
}

export default function CheckoutPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { items, removeItem, clearCart, totalPrice } = useCart()
    const [step, setStep] = useState(1)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [orderNumber, setOrderNumber] = useState('')
    const [purchasedItems, setPurchasedItems] = useState<typeof items>([])
    const [qrisSettings, setQrisSettings] = useState({ enabled: false, image: '', merchantString: '' })
    const [dynamicQrisImage, setDynamicQrisImage] = useState<string | null>(null)
    const [generatingQris, setGeneratingQris] = useState(false)
    const [showQrisConfirm, setShowQrisConfirm] = useState(false)
    const [qrisProof, setQrisProof] = useState<{ file: File | null, preview: string }>({ file: null, preview: '' })
    const [qrisNotes, setQrisNotes] = useState('')
    const [uploadingProof, setUploadingProof] = useState(false)
    const [confirmationSent, setConfirmationSent] = useState(false)
    const [paymentConfirmed, setPaymentConfirmed] = useState(false)
    const [paymentRejected, setPaymentRejected] = useState(false)
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '' })
    const [duitkuEnabled, setDuitkuEnabled] = useState(false)
    const [duitkuLoading, setDuitkuLoading] = useState(false)
    const [expandedSection, setExpandedSection] = useState<'auto' | 'manual' | null>('auto')

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    })

    // Voucher state
    const [voucherCode, setVoucherCode] = useState('')
    const [voucherLoading, setVoucherLoading] = useState(false)
    const [voucherError, setVoucherError] = useState('')
    const [appliedVoucher, setAppliedVoucher] = useState<{
        code: string
        discountAmount: number
        finalAmount: number
    } | null>(null)

    // Check if running on localhost
    const [isLocalhost, setIsLocalhost] = useState(false)

    useEffect(() => {
        const hostname = window.location.hostname
        setIsLocalhost(
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.')
        )
    }, [])

    // Handle return from Duitku
    useEffect(() => {
        const status = searchParams.get('status')
        const order = searchParams.get('order')

        if (status === 'check' && order) {
            setOrderNumber(order)
            setConfirmationSent(true)
            setStep(3)
            // Clear cart as order is placed
            clearCart()
        }
    }, [searchParams, clearCart])

    useEffect(() => {
        // Fetch payment methods and QRIS settings
        Promise.all([
            fetch('/api/payments').then(res => res.json()),
            fetch('/api/settings').then(res => res.json())
        ]).then(async ([paymentData, settingsData]) => {
            const methods: PaymentMethod[] = []

            // Check if Duitku is enabled and fetch payment methods
            if (settingsData.settings?.duitku_enabled === 'true') {
                setDuitkuEnabled(true)
                try {
                    const duitkuRes = await fetch('/api/duitku/payment-methods', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: 50000 }), // Will update with actual amount
                    })
                    const duitkuData = await duitkuRes.json()
                    if (duitkuData.paymentMethods) {
                        // Add Duitku payment methods
                        duitkuData.paymentMethods.forEach((dm: { paymentMethod: string; paymentName: string; paymentImage: string; totalFee: string }, index: number) => {
                            methods.push({
                                id: -100 - index, // Negative IDs for Duitku methods
                                name: dm.paymentName,
                                type: 'duitku',
                                bankName: null,
                                accountNumber: null,
                                accountName: null,
                                qrCodeImage: null,
                                externalUrl: null,
                                instructions: null,
                                isActive: true,
                                duitkuCode: dm.paymentMethod,
                                duitkuFee: dm.totalFee,
                                duitkuImage: dm.paymentImage,
                            })
                        })
                    }
                } catch (err) {
                    console.error('Error fetching Duitku methods:', err)
                }
            }

            // Add QRIS from settings if enabled
            if (settingsData.settings?.qris_enabled === 'true' && settingsData.settings?.qris_static_image) {
                methods.push({
                    id: -1,
                    name: 'QRIS (Manual)',
                    type: 'internal',
                    bankName: null,
                    accountNumber: null,
                    accountName: null,
                    qrCodeImage: settingsData.settings.qris_static_image,
                    externalUrl: null,
                    instructions: 'Scan QR Code dengan GoPay, OVO, DANA, ShopeePay, atau M-Banking',
                    isActive: true,
                })

                setQrisSettings({
                    enabled: true,
                    image: settingsData.settings.qris_static_image,
                    merchantString: settingsData.settings.qris_merchant_string || '',
                })
            }

            // Add other payment methods
            if (paymentData.payments) {
                const otherMethods = paymentData.payments.filter((p: PaymentMethod) => p.isActive)
                methods.push(...otherMethods)
            }

            setPaymentMethods(methods)
        }).catch(console.error)
    }, [])

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Voucher validation
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            setVoucherError('Masukkan kode voucher')
            return
        }

        setVoucherLoading(true)
        setVoucherError('')

        try {
            const res = await fetch('/api/vouchers/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: voucherCode,
                    totalAmount: totalPrice,
                }),
            })

            const data = await res.json()

            if (data.valid) {
                setAppliedVoucher({
                    code: data.voucher.code,
                    discountAmount: data.discountAmount,
                    finalAmount: data.finalAmount,
                })
                setVoucherError('')
            } else {
                setVoucherError(data.error || 'Voucher tidak valid')
                setAppliedVoucher(null)
            }
        } catch (error) {
            console.error('Error validating voucher:', error)
            setVoucherError('Gagal memvalidasi voucher')
            setAppliedVoucher(null)
        } finally {
            setVoucherLoading(false)
        }
    }

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null)
        setVoucherCode('')
        setVoucherError('')
    }

    // Calculate final price with voucher
    const finalPrice = appliedVoucher ? appliedVoucher.finalAmount : totalPrice



    // Generate QRIS when settings or total price changes
    useEffect(() => {
        const generateQris = async () => {
            if (!qrisSettings.merchantString || totalPrice <= 0) {
                setDynamicQrisImage(null)
                return
            }

            setGeneratingQris(true)
            try {
                const res = await fetch('/api/qris/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        staticQRIS: qrisSettings.merchantString,
                        amount: finalPrice,
                    }),
                })
                const data = await res.json()
                if (data.qrCode) {
                    setDynamicQrisImage(data.qrCode)
                }
            } catch (error) {
                console.error('Error generating dynamic QRIS:', error)
            } finally {
                setGeneratingQris(false)
            }
        }

        if (qrisSettings.merchantString && finalPrice > 0) {
            generateQris()
        }
    }, [qrisSettings.merchantString, finalPrice])

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showQrisConfirm) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [showQrisConfirm])

    // Poll payment confirmation status
    useEffect(() => {
        if (!confirmationSent || !orderNumber || paymentConfirmed || paymentRejected) return

        const checkPaymentStatus = async () => {
            try {
                const res = await fetch(`/api/qris-confirmation?orderNumber=${orderNumber}`)
                const data = await res.json()
                if (data.confirmations && data.confirmations.length > 0) {
                    const confirmation = data.confirmations[0]
                    if (confirmation.status === 'approved') {
                        setPaymentConfirmed(true)
                    } else if (confirmation.status === 'rejected') {
                        setPaymentRejected(true)
                    }
                }
            } catch (error) {
                console.error('Error checking payment status:', error)
            }
        }

        // Check immediately
        checkPaymentStatus()

        // Then poll every 10 seconds
        const interval = setInterval(checkPaymentStatus, 10000)
        return () => clearInterval(interval)
    }, [confirmationSent, orderNumber, paymentConfirmed, paymentRejected])

    const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const preview = URL.createObjectURL(file)
            setQrisProof({ file, preview })
        }
    }

    const handleSubmitQrisConfirmation = async () => {
        if (!qrisProof.file || !orderNumber) return

        setUploadingProof(true)
        try {
            // Upload proof image using public endpoint
            const uploadFormData = new FormData()
            uploadFormData.append('file', qrisProof.file)

            const uploadRes = await fetch('/api/upload-proof', {
                method: 'POST',
                body: uploadFormData,
            })

            const uploadData = await uploadRes.json()
            if (!uploadData.url) {
                console.error('Upload failed:', uploadData.error)
                setErrorDialog({
                    isOpen: true,
                    title: 'Gagal Upload',
                    message: 'Gagal upload bukti pembayaran. Silakan coba lagi.'
                })
                return
            }

            // Submit confirmation
            const confirmRes = await fetch('/api/qris-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderNumber,
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    amount: finalPrice,
                    proofImage: uploadData.url,
                    notes: qrisNotes,
                    paymentMethod: selectedPayment?.name || 'Transfer',
                }),
            })

            if (confirmRes.ok) {
                setConfirmationSent(true)
                setShowQrisConfirm(false)
                setQrisProof({ file: null, preview: '' })
                setQrisNotes('')
            } else {
                const errorData = await confirmRes.json()
                console.error('Confirmation failed:', errorData)
                setErrorDialog({
                    isOpen: true,
                    title: 'Gagal Mengirim',
                    message: 'Gagal mengirim konfirmasi. Silakan coba lagi.'
                })
            }
        } catch (error) {
            console.error('Error submitting confirmation:', error)
            setErrorDialog({
                isOpen: true,
                title: 'Terjadi Kesalahan',
                message: 'Tidak dapat terhubung ke server. Silakan coba lagi.'
            })
        } finally {
            setUploadingProof(false)
        }
    }

    const generateOrderNumber = () => {
        const date = new Date()
        const random = Math.random().toString(36).substring(2, 8).toUpperCase()
        return `RSQ-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${random}`
    }

    // Handle free product checkout - skip payment step
    const handleFreeCheckout = async () => {
        setLoading(true)
        const newOrderNumber = generateOrderNumber()

        trackInitiateCheckout(0)
        trackButtonClick('Download Gratis', 'Checkout')

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
                        price: 0,
                    })),
                    totalAmount: 0,
                    paymentMethod: 'Gratis',
                    status: 'completed', // Auto complete for free products
                    voucherCode: appliedVoucher?.code || null,
                    discountAmount: appliedVoucher?.discountAmount || 0,
                }),
            })

            if (res.ok) {
                await fetch('/api/admin/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        amount: 0,
                    }),
                })

                // Send order confirmation email for free products
                try {
                    await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: formData.email,
                            customerName: formData.name,
                            orderNumber: newOrderNumber,
                            totalAmount: 0,
                            downloadLinks: items.map(item => ({
                                title: item.title,
                                url: item.downloadUrl || '#',
                            })),
                        }),
                    })
                } catch (emailError) {
                    console.error('Failed to send confirmation email:', emailError)
                }

                trackPurchase({
                    orderId: newOrderNumber,
                    value: 0,
                    items: items.map(item => ({
                        name: item.title,
                        price: 0,
                    })),
                })

                setOrderNumber(newOrderNumber)
                setPurchasedItems([...items])
                setPaymentConfirmed(true) // Auto confirm for free products
                setStep(3)
            }
        } catch (error) {
            console.error('Error creating free order:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle Duitku payment
    const handleDuitkuPayment = async () => {
        if (!selectedPayment || selectedPayment.type !== 'duitku') return

        setDuitkuLoading(true)
        const newOrderNumber = generateOrderNumber()

        trackInitiateCheckout(finalPrice)
        trackButtonClick('Bayar via Duitku', 'Checkout')

        try {
            const res = await fetch('/api/duitku/create-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderNumber: newOrderNumber,
                    paymentMethod: selectedPayment.duitkuCode,
                    totalAmount: finalPrice,
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    items: items.map(item => ({
                        productId: item.id,
                        productTitle: item.title,
                        price: item.discountPrice || item.price,
                    })),
                }),
            })

            const data = await res.json()

            if (data.success && data.paymentUrl) {
                // Save customer data
                await fetch('/api/admin/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        amount: finalPrice,
                    }),
                })

                // Redirect to Duitku payment page
                window.location.href = data.paymentUrl
            } else {
                setErrorDialog({
                    isOpen: true,
                    title: 'Gagal Membuat Transaksi',
                    message: data.error || 'Terjadi kesalahan saat membuat transaksi. Silakan coba lagi.',
                })
            }
        } catch (error) {
            console.error('Error creating Duitku transaction:', error)
            setErrorDialog({
                isOpen: true,
                title: 'Terjadi Kesalahan',
                message: 'Tidak dapat terhubung ke server pembayaran. Silakan coba lagi.',
            })
        } finally {
            setDuitkuLoading(false)
        }
    }

    const handleSubmitOrder = async () => {
        if (!selectedPayment) return

        // If Duitku payment, use different handler
        if (selectedPayment.type === 'duitku') {
            await handleDuitkuPayment()
            return
        }

        setLoading(true)
        const newOrderNumber = generateOrderNumber()

        // Track checkout initiation
        trackInitiateCheckout(finalPrice)
        trackButtonClick('Lanjut ke Pembayaran', 'Checkout')

        try {
            // Create order
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
                    totalAmount: finalPrice,
                    paymentMethod: selectedPayment.name,
                    voucherCode: appliedVoucher?.code || null,
                    discountAmount: appliedVoucher?.discountAmount || 0,
                }),
            })

            if (res.ok) {
                // Save customer data
                await fetch('/api/admin/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        amount: finalPrice,
                    }),
                })

                // Track purchase conversion
                trackPurchase({
                    orderId: newOrderNumber,
                    value: finalPrice,
                    items: items.map(item => ({
                        name: item.title,
                        price: item.discountPrice || item.price,
                    })),
                })

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
            <div className="min-h-screen relative py-12">
                {/* Background with Grid and Shapes */}
                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 to-white" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
                    <motion.div
                        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 left-[10%] w-24 h-24 opacity-20"
                    >
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-xl transform rotate-45" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-40 right-[15%] w-32 h-32 rounded-full bg-gradient-to-tr from-blue-400/30 to-purple-500/30 blur-2xl"
                    />
                </div>
                <div className="container mx-auto px-6 relative z-10">
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
        <div className="min-h-screen relative py-6 md:py-8 overflow-x-hidden">
            {/* Background with Grid and Shapes */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 to-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
                {/* Floating Shape 1 */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-[5%] w-20 h-20 opacity-15"
                >
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-xl transform rotate-45" />
                </motion.div>
                {/* Floating Shape 2 */}
                <motion.div
                    animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-32 right-[10%] w-28 h-28 rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-500/20 blur-2xl"
                />
                {/* Floating Shape 3 */}
                <motion.div
                    animate={{ y: [0, -25, 0], rotate: [0, -15, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-40 left-[15%] w-32 h-32 opacity-10"
                >
                    <div className="w-full h-full border-4 border-orange-300 rounded-3xl transform -rotate-12" />
                </motion.div>
                {/* Floating Shape 4 */}
                <motion.div
                    animate={{ y: [0, 20, 0], scale: [1, 0.95, 1] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-20 right-[8%] w-24 h-24 rounded-full bg-gradient-to-bl from-amber-400/20 to-orange-500/20 blur-xl"
                />
            </div>
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 md:mb-4 text-sm md:text-base">
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Checkout</h1>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-medium text-sm md:text-base ${step >= s ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step > s ? <Check className="h-3.5 w-3.5 md:h-4 md:w-4" /> : s}
                            </div>
                            {s < 3 && <div className={`w-8 md:w-16 h-0.5 md:h-1 mx-1 md:mx-2 ${step > s ? 'bg-orange-500' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto overflow-hidden">
                    {/* Step 1: Customer Info */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                {/* Form */}
                                <div className="bg-white rounded-2xl p-3 md:p-6 shadow-lg border border-gray-200 overflow-hidden">
                                    <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                                        <User className="h-4 w-4 md:h-5 md:w-5 text-orange-500" /> Data Pembeli
                                    </h2>
                                    <div className="space-y-3 md:space-y-4">
                                        <div>
                                            <label className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                                                <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" /> Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                                placeholder="Nama lengkap Anda"
                                                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                                                <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" /> Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                                placeholder="email@domain.com"
                                                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                                                <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" /> No. WhatsApp
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                                placeholder="08xxxxxxxxxx"
                                                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-white rounded-2xl p-3 md:p-6 shadow-lg border border-gray-200 overflow-hidden">
                                    <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                                        <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-orange-500" /> Ringkasan Pesanan
                                    </h2>
                                    <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-xl overflow-hidden">
                                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
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
                                                    <h4 className="font-medium text-gray-900 text-xs md:text-sm truncate">{item.title}</h4>
                                                    <p className="text-xs md:text-sm font-bold text-orange-600">
                                                        {(item.discountPrice || item.price) === 0 ? 'Gratis' : `Rp ${(item.discountPrice || item.price).toLocaleString('id-ID')}`}
                                                    </p>
                                                </div>
                                                <button onClick={() => removeItem(item.id)} className="p-1.5 md:p-2 text-gray-400 hover:text-red-500">
                                                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Voucher Input - Only show for non-free products */}
                                    {totalPrice > 0 && (
                                        <div className="border-t pt-4 mb-4">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <Ticket className="h-4 w-4 text-gray-400" /> Kode Voucher
                                            </label>
                                            {appliedVoucher ? (
                                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium text-green-700">{appliedVoucher.code}</span>
                                                        <span className="text-sm text-green-600">
                                                            (-Rp {appliedVoucher.discountAmount.toLocaleString('id-ID')})
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={handleRemoveVoucher}
                                                        className="p-1 text-gray-400 hover:text-red-500"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={voucherCode}
                                                        onChange={(e) => {
                                                            setVoucherCode(e.target.value.toUpperCase())
                                                            setVoucherError('')
                                                        }}
                                                        placeholder="Masukkan kode voucher"
                                                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm uppercase"
                                                    />
                                                    <button
                                                        onClick={handleApplyVoucher}
                                                        disabled={voucherLoading || !voucherCode.trim()}
                                                        className="px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                                                    >
                                                        {voucherLoading ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            'Pakai'
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                            {voucherError && (
                                                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {voucherError}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="border-t pt-4">
                                        {appliedVoucher && (
                                            <>
                                                <div className="flex justify-between text-sm text-gray-500 mb-1">
                                                    <span>Subtotal</span>
                                                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-green-600 mb-2">
                                                    <span>Diskon Voucher</span>
                                                    <span>-Rp {appliedVoucher.discountAmount.toLocaleString('id-ID')}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-orange-600">{finalPrice === 0 ? 'Gratis' : `Rp ${finalPrice.toLocaleString('id-ID')}`}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-6 flex justify-end">
                                <button
                                    onClick={() => {
                                        if (finalPrice === 0) {
                                            handleFreeCheckout()
                                        } else {
                                            setStep(2)
                                        }
                                    }}
                                    disabled={!formData.name || !formData.email || loading}
                                    className="w-full md:w-auto px-6 md:px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {finalPrice === 0 ? 'Download Gratis' : 'Lanjut ke Pembayaran'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Payment */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200 mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-orange-500" /> Pilih Metode Pembayaran
                                </h2>

                                {paymentMethods.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Belum ada metode pembayaran tersedia</p>
                                        <p className="text-sm text-gray-400 mt-1">Silakan hubungi admin</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Automatic Payments Section */}
                                        {paymentMethods.some(m => m.type === 'duitku') && (
                                            <div className="border border-emerald-200 rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedSection(expandedSection === 'auto' ? null : 'auto')}
                                                    className="w-full flex items-center justify-between p-3 md:p-4 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-emerald-500 rounded-lg">
                                                            <Zap className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-semibold text-emerald-800">Pembayaran Otomatis</p>
                                                            <p className="text-xs text-emerald-600">Verifikasi instan, tanpa upload bukti</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`h-5 w-5 text-emerald-600 transition-transform ${expandedSection === 'auto' ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {expandedSection === 'auto' && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-3 md:p-4 bg-white grid gap-2">
                                                                {paymentMethods.filter(m => m.type === 'duitku').map((method) => (
                                                                    <button
                                                                        key={method.id}
                                                                        onClick={() => setSelectedPayment(selectedPayment?.id === method.id ? null : method)}
                                                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${selectedPayment?.id === method.id
                                                                            ? 'border-emerald-500 bg-emerald-50'
                                                                            : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                            {method.duitkuImage ? (
                                                                                <img src={method.duitkuImage} alt={method.name} className="w-8 h-8 object-contain" />
                                                                            ) : (
                                                                                <CreditCard className="h-5 w-5 text-gray-400" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-gray-900 text-sm truncate">{method.name}</p>
                                                                            <p className="text-xs text-gray-500">
                                                                                Admin: {method.duitkuFee && Number(method.duitkuFee) > 0
                                                                                    ? `Rp ${Number(method.duitkuFee).toLocaleString('id-ID')}`
                                                                                    : 'Gratis'}
                                                                            </p>
                                                                        </div>
                                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPayment?.id === method.id ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                                                                            {selectedPayment?.id === method.id && <Check className="h-3 w-3 text-white" />}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {/* Manual Payments Section */}
                                        {paymentMethods.some(m => m.type !== 'duitku') && (
                                            <div className="border border-blue-200 rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedSection(expandedSection === 'manual' ? null : 'manual')}
                                                    className="w-full flex items-center justify-between p-3 md:p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-500 rounded-lg">
                                                            <FileText className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-semibold text-blue-800">Pembayaran Manual</p>
                                                            <p className="text-xs text-blue-600">Transfer bank, perlu konfirmasi admin</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`h-5 w-5 text-blue-600 transition-transform ${expandedSection === 'manual' ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {expandedSection === 'manual' && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-3 md:p-4 bg-white grid gap-2">
                                                                {paymentMethods.filter(m => m.type !== 'duitku').map((method) => (
                                                                    <button
                                                                        key={method.id}
                                                                        onClick={() => setSelectedPayment(selectedPayment?.id === method.id ? null : method)}
                                                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${selectedPayment?.id === method.id
                                                                            ? 'border-blue-500 bg-blue-50'
                                                                            : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedPayment?.id === method.id ? 'bg-blue-500' : 'bg-gray-100'}`}>
                                                                            {method.qrCodeImage ? (
                                                                                <QrCode className={`h-5 w-5 ${selectedPayment?.id === method.id ? 'text-white' : 'text-gray-500'}`} />
                                                                            ) : method.type === 'external' ? (
                                                                                <CreditCard className={`h-5 w-5 ${selectedPayment?.id === method.id ? 'text-white' : 'text-gray-500'}`} />
                                                                            ) : (
                                                                                <Building2 className={`h-5 w-5 ${selectedPayment?.id === method.id ? 'text-white' : 'text-gray-500'}`} />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-gray-900 text-sm truncate">{method.name}</p>
                                                                            <p className="text-xs text-gray-500">
                                                                                {method.bankName || (method.type === 'external' ? 'Link eksternal' : '')} • Admin: Gratis
                                                                            </p>
                                                                        </div>
                                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPayment?.id === method.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                                                            {selectedPayment?.id === method.id && <Check className="h-3 w-3 text-white" />}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
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

                                        {/* Duitku Payment */}
                                        {selectedPayment.type === 'duitku' && (
                                            <div className="text-center mb-4 p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                                                {selectedPayment.duitkuImage && (
                                                    <img src={selectedPayment.duitkuImage} alt={selectedPayment.name} className="w-16 h-16 mx-auto mb-3 object-contain" />
                                                )}
                                                <p className="text-emerald-800 font-medium mb-2">Pembayaran {selectedPayment.name}</p>
                                                <p className="text-sm text-emerald-600 mb-4">
                                                    Anda akan diarahkan ke halaman pembayaran Duitku untuk menyelesaikan transaksi.
                                                </p>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Biaya Admin: {selectedPayment.duitkuFee && Number(selectedPayment.duitkuFee) > 0
                                                        ? `Rp ${Number(selectedPayment.duitkuFee).toLocaleString('id-ID')}`
                                                        : 'Gratis'}
                                                </p>
                                                <div className="flex items-center justify-center gap-2 text-sm text-emerald-700">
                                                    <Check className="h-4 w-4" />
                                                    <span>Pembayaran otomatis terverifikasi</span>
                                                </div>
                                            </div>
                                        )}

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
                                                    {generatingQris ? (
                                                        <div className="w-48 h-48 flex items-center justify-center">
                                                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                                        </div>
                                                    ) : dynamicQrisImage ? (
                                                        <img
                                                            src={dynamicQrisImage}
                                                            alt="QRIS Dinamis"
                                                            className="w-48 h-48 mx-auto"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={selectedPayment.qrCodeImage}
                                                            alt="QRIS"
                                                            className="w-48 h-48 mx-auto"
                                                        />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Scan QR Code dengan aplikasi e-wallet atau m-banking
                                                </p>
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
                                                        Rp {finalPrice.toLocaleString('id-ID')}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(finalPrice.toString())}
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
                                    disabled={!selectedPayment || loading || duitkuLoading}
                                    className={`px-8 py-3 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${selectedPayment?.type === 'duitku' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500 hover:bg-orange-600'
                                        }`}
                                >
                                    {(loading || duitkuLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {selectedPayment?.type === 'duitku' ? 'Bayar Sekarang' : 'Konfirmasi Pesanan'}
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

                            {/* Download Links - Only show if payment confirmed or product is free */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6 max-w-lg mx-auto">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Download className="h-5 w-5 text-green-500" />
                                    Link Download Template
                                </h3>
                                <div className="space-y-3">
                                    {purchasedItems.map((item) => {
                                        const isFree = (item.discountPrice || item.price) === 0
                                        const canDownload = isFree || paymentConfirmed

                                        return (
                                            <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                                                <p className="font-medium text-gray-900 mb-2">{item.title}</p>
                                                {canDownload && item.downloadUrl ? (
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
                                                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Link download akan muncul setelah pembayaran dikonfirmasi admin</span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Payment Confirmation Section - RSQUARE Theme (Hide for free products or 100% voucher) */}
                            {!confirmationSent && finalPrice > 0 && (
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 shadow-lg border border-orange-200 mb-6 max-w-lg mx-auto overflow-hidden relative">
                                    {/* RSQUARE Branding */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full -translate-y-1/2 translate-x-1/2" />

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                                                <span className="text-white font-bold text-lg">R</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">Konfirmasi Pembayaran</h3>
                                            </div>
                                        </div>

                                        {/* QRIS Section */}
                                        {qrisSettings.enabled && (qrisSettings.image || dynamicQrisImage) && (
                                            <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <QrCode className="h-5 w-5 text-orange-500" />
                                                    <span className="font-semibold text-gray-900">Bayar dengan QRIS</span>
                                                </div>
                                                <div className="flex justify-center mb-3">
                                                    <div className="p-3 bg-white rounded-xl border-2 border-orange-200 shadow-inner">
                                                        {dynamicQrisImage ? (
                                                            <img
                                                                src={dynamicQrisImage}
                                                                alt="QRIS Dinamis RSQUARE"
                                                                width={180}
                                                                height={180}
                                                                className="rounded-lg"
                                                            />
                                                        ) : (
                                                            <Image
                                                                src={qrisSettings.image}
                                                                alt="QRIS RSQUARE"
                                                                width={180}
                                                                height={180}
                                                                className="rounded-lg"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-center text-gray-500">
                                                    Scan dengan GoPay, OVO, DANA, ShopeePay, atau M-Banking
                                                </p>
                                            </div>
                                        )}

                                        {/* Bank Transfer Info */}
                                        {selectedPayment && selectedPayment.type === 'internal' && selectedPayment.accountNumber && (
                                            <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Building2 className="h-5 w-5 text-orange-500" />
                                                    <span className="font-semibold text-gray-900">Transfer Bank</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                        <span className="text-sm text-gray-600">Bank</span>
                                                        <span className="font-semibold">{selectedPayment.bankName}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                        <span className="text-sm text-gray-600">No. Rekening</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-semibold">{selectedPayment.accountNumber}</span>
                                                            <button
                                                                onClick={() => handleCopy(selectedPayment.accountNumber!)}
                                                                className="p-1 text-orange-500 hover:bg-orange-50 rounded"
                                                            >
                                                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                        <span className="text-sm text-gray-600">Atas Nama</span>
                                                        <span className="font-semibold">{selectedPayment.accountName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Amount */}
                                        <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl mb-4 text-white">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium opacity-90">Total Pembayaran</span>
                                                <span className="text-2xl font-bold">
                                                    Rp {finalPrice.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Confirmation Button */}
                                        <button
                                            onClick={() => setShowQrisConfirm(true)}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg"
                                        >
                                            <Camera className="h-5 w-5" />
                                            Sudah Bayar? Upload Bukti Transfer
                                        </button>

                                        <p className="text-xs text-center text-gray-500 mt-3">
                                            Pembayaran akan diverifikasi dalam 1x24 jam kerja
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Confirmed Success / Free Product Success */}
                            {paymentConfirmed && (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6 max-w-lg mx-auto">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200">
                                            <Check className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            {totalPrice === 0 ? (
                                                <>
                                                    <h3 className="font-bold text-green-800 text-lg mb-1">Template Gratis Siap Diunduh!</h3>
                                                    <p className="text-sm text-green-700 mb-3">
                                                        Terima kasih! Silakan download template gratis Kamu di atas.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <h3 className="font-bold text-green-800 text-lg mb-1">Pembayaran Dikonfirmasi!</h3>
                                                    <p className="text-sm text-green-700 mb-3">
                                                        Pembayaran Kamu telah diverifikasi. Silakan download template di atas.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Confirmation Sent - Waiting */}
                            {confirmationSent && !paymentConfirmed && !paymentRejected && (
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 mb-6 max-w-lg mx-auto">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-200">
                                            <Clock className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-amber-800 text-lg mb-1">Menunggu Verifikasi</h3>
                                            <p className="text-sm text-amber-700 mb-3">
                                                Konfirmasi pembayaran Kamu sedang diverifikasi oleh tim RSQUARE.
                                                Halaman ini akan otomatis terupdate setelah pembayaran dikonfirmasi.
                                            </p>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 rounded-lg text-sm text-amber-700">
                                                <Clock className="h-4 w-4" />
                                                <span>Estimasi verifikasi: 1x24 jam kerja</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Payment Rejected */}
                            {paymentRejected && (
                                <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 mb-6 max-w-lg mx-auto">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-200">
                                            <X className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-red-800 text-lg mb-1">Pembayaran Ditolak</h3>
                                            <p className="text-sm text-red-700 mb-3">
                                                Maaf, konfirmasi pembayaran Kamu tidak dapat diverifikasi.
                                                Hal ini bisa terjadi karena bukti pembayaran tidak valid atau nominal tidak sesuai.
                                            </p>
                                            <p className="text-sm text-red-600">
                                                Silakan hubungi kami melalui WhatsApp atau email jika ada pertanyaan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center">
                                <button
                                    onClick={handleFinish}
                                    className="px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                                >
                                    Kembali ke Beranda
                                </button>
                            </div>
                            {/* Save order info hint */}
                            {confirmationSent && orderNumber && (
                                <div className="text-center mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 max-w-md mx-auto">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Simpan nomor pesanan untuk mengecek status:
                                    </p>
                                    <p className="font-mono font-bold text-lg text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200">
                                        {orderNumber}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Cek status pesanan melalui ikon keranjang di header &rarr; tab &quot;Cek Pesanan&quot;
                                    </p>
                                </div>
                            )}

                        </motion.div>
                    )}
                </div>
            </div>

            {/* QRIS Confirmation Modal */}
            {showQrisConfirm && createPortal(
                <div
                    className="fixed inset-0 bg-black/60 z-[9999] flex items-end md:items-center justify-center"
                    onClick={() => setShowQrisConfirm(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white w-full md:w-auto md:min-w-[500px] md:max-w-4xl md:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90dvh] md:max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header - Always visible */}
                        <div className="flex-shrink-0 bg-white p-4 border-b border-gray-100 rounded-t-3xl md:rounded-t-2xl">
                            {/* Mobile drag indicator */}
                            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3 md:hidden" />
                            <div className="flex items-center justify-between">
                                <h2 className="text-base md:text-lg font-bold text-gray-900">Upload Bukti Pembayaran</h2>
                                <button
                                    onClick={() => setShowQrisConfirm(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 pb-8 md:pb-4">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Left Column - Upload Proof */}
                                <div className="md:w-1/2">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Upload Bukti Pembayaran *
                                    </label>
                                    {qrisProof.preview ? (
                                        <div className="relative">
                                            <div className="aspect-video md:aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                                                <Image
                                                    src={qrisProof.preview}
                                                    alt="Bukti Pembayaran"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setQrisProof({ file: null, preview: '' })}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="block cursor-pointer h-full">
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-8 text-center hover:border-orange-400 hover:bg-orange-50 transition-all h-full flex flex-col items-center justify-center min-h-[200px]">
                                                <Upload className="h-8 w-8 md:h-10 md:w-10 text-gray-400 mx-auto mb-2 md:mb-3" />
                                                <p className="text-xs md:text-sm text-gray-500">Klik untuk upload screenshot bukti transfer</p>
                                                <p className="text-xs text-gray-400 mt-1">JPG, PNG max 5MB</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProofUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Right Column - Details */}
                                <div className="md:w-1/2 flex flex-col gap-4">
                                    {/* Order Info */}
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-500">No. Pesanan</p>
                                                <p className="font-mono font-bold">{orderNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Total</p>
                                                <p className="font-bold text-orange-600">Rp {finalPrice.toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Catatan (Opsional)
                                        </label>
                                        <textarea
                                            value={qrisNotes}
                                            onChange={(e) => setQrisNotes(e.target.value)}
                                            placeholder="Tambahkan catatan jika perlu..."
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                        />
                                    </div>

                                    {/* Warning */}
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                        <div className="flex gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-700">
                                                Pastikan bukti pembayaran jelas dan menunjukkan nominal yang sesuai. Konfirmasi palsu akan ditolak.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="mt-auto">
                                        <button
                                            onClick={handleSubmitQrisConfirmation}
                                            disabled={!qrisProof.file || uploadingProof}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {uploadingProof ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Mengirim...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-5 w-5" />
                                                    Kirim Konfirmasi
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                , document.body)}
            {/* Error Dialog */}
            <AnimatePresence>
                {errorDialog.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                        onClick={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{errorDialog.title}</h3>
                            <p className="text-gray-600 mb-6">{errorDialog.message}</p>
                            <button
                                onClick={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                                className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                            >
                                Tutup
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
