'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    RotateCcw,
    Sparkles,
    Loader2,
    X,
    Bot,
    MessageSquare,
    CheckCircle2,
    FileSpreadsheet,
    Globe,
    Rocket,
    Layers,
    Users,
    ShieldCheck,
    Calendar,
    CircleDollarSign
} from 'lucide-react'

export interface ChatFormData {
    serviceType: string
    selectedModel: string
    name: string
    email: string
    phone: string
    company: string
    requirements: string
    budget: string
    deadline: string
}

interface MessageOption {
    id: string
    label: string
    subtext?: string
    iconType?: 'sheets' | 'webapp' | 'fullstack' | 'consultation' | 'proyek' | 'tim-embed' | 'retainer' | 'budget' | 'deadline'
}

interface Message {
    id: string
    sender: 'bot' | 'user'
    text: string
    timestamp: string
    options?: MessageOption[]
    inputType?: 'text' | 'email' | 'tel' | 'textarea' | 'date' | 'options'
    isSummary?: boolean
}

export interface ChatBotModalProps {
    isOpen: boolean
    onClose: () => void
    initialServiceType?: string
    initialModel?: string
    onSubmitSuccess?: (data: ChatFormData) => void
}

export function ChatBotModal({
    isOpen,
    onClose,
    initialServiceType = 'sheets',
    initialModel = 'proyek',
    onSubmitSuccess
}: ChatBotModalProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [currentStep, setCurrentStep] = useState<number>(1)
    const [isTyping, setIsTyping] = useState<boolean>(false)
    const [inputValue, setInputValue] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isCompleted, setIsCompleted] = useState<boolean>(false)

    // Form data state
    const [formData, setFormData] = useState<ChatFormData>({
        serviceType: initialServiceType,
        selectedModel: initialModel,
        name: '',
        email: '',
        phone: '',
        company: '',
        requirements: '',
        budget: '',
        deadline: ''
    })

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

    // Lock background page scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const scrollToBottom = (instant = false) => {
        if (!messagesEndRef.current) return
        const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768
        if (instant || isMobileDevice) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
        } else {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom(false)
        }
    }, [messages, isTyping, isOpen])

    // Helper to format timestamp
    const getTimestamp = () => {
        const now = new Date()
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Initialize Bot Greeting & First Question when modal opens or initial values change
    useEffect(() => {
        if (isOpen) {
            initChat()
        }
    }, [isOpen, initialServiceType, initialModel])

    const initChat = () => {
        setIsCompleted(false)
        setCurrentStep(1)
        setFormData({
            serviceType: initialServiceType,
            selectedModel: initialModel,
            name: '',
            email: '',
            phone: '',
            company: '',
            requirements: '',
            budget: '',
            deadline: ''
        })

        setIsTyping(true)
        setTimeout(() => {
            setIsTyping(false)
            setMessages([
                {
                    id: 'msg-1',
                    sender: 'bot',
                    text: 'Halo! 👋 Selamat datang di RSQUARE.\nSaya RSQUARE Assistant Bot yang akan memandu Anda merancang kebutuhan solusi digital terbaik.\n\nUntuk memulai, **Layanan Utama** mana yang Anda butuhkan?',
                    timestamp: getTimestamp(),
                    options: [
                        { id: 'sheets', label: 'Google Sheets', subtext: 'Automasi & Formula', iconType: 'sheets' },
                        { id: 'webapp', label: 'Web Apps', subtext: 'Apps Script & Workspace', iconType: 'webapp' },
                        { id: 'fullstack', label: 'Full Stack', subtext: 'Next.js, Supabase, Cloud', iconType: 'fullstack' },
                        { id: 'consultation', label: 'Konsultasi Gratis', subtext: 'Diskusi & Pemetaan Scope', iconType: 'consultation' }
                    ]
                }
            ])
        }, 200)
    }

    // Process Bot Responses based on Step
    const triggerNextBotStep = (stepNumber: number, updatedData: ChatFormData) => {
        setIsTyping(true)
        setTimeout(() => {
            setIsTyping(false)

            if (stepNumber === 2) {
                if (updatedData.serviceType === 'consultation') {
                    setCurrentStep(3)
                    setMessages(prev => [
                        ...prev,
                        {
                            id: `msg-${Date.now()}`,
                            sender: 'bot',
                            text: 'Siap! Tim kami akan menjadwalkan sesi **Konsultasi Gratis** untuk Anda. ☕\n\nBolehkah tahu **Nama Lengkap** Anda?',
                            timestamp: getTimestamp(),
                            inputType: 'text'
                        }
                    ])
                } else {
                    const serviceLabel = updatedData.serviceType === 'sheets' ? 'Google Sheets' : updatedData.serviceType === 'webapp' ? 'Web Apps' : 'Full Stack'
                    setCurrentStep(2)
                    setMessages(prev => [
                        ...prev,
                        {
                            id: `msg-${Date.now()}`,
                            sender: 'bot',
                            text: `Pilihan tepat! Untuk layanan **${serviceLabel}**, **Model Kerjasama** mana yang paling sesuai dengan kebutuhan Anda?`,
                            timestamp: getTimestamp(),
                            options: [
                                { id: 'proyek', label: 'Model Proyek', subtext: 'Fixed Scope & Garansi Support', iconType: 'proyek' },
                                { id: 'tim-embed', label: 'Tim Embed', subtext: 'Dedicated Squad Bulanan', iconType: 'tim-embed' },
                                { id: 'retainer', label: 'Retainer', subtext: 'Enterprise SLA & On-Call', iconType: 'retainer' }
                            ]
                        }
                    ])
                }
            } else if (stepNumber === 3) {
                setCurrentStep(3)
                setMessages(prev => [
                    ...prev,
                    {
                        id: `msg-${Date.now()}`,
                        sender: 'bot',
                        text: 'Terima kasih! Bolehkah saya tahu **Nama Lengkap** Anda?',
                        timestamp: getTimestamp(),
                        inputType: 'text'
                    }
                ])
            } else if (stepNumber === 4) {
                setCurrentStep(4)
                setMessages(prev => [
                    ...prev,
                    {
                        id: `msg-${Date.now()}`,
                        sender: 'bot',
                        text: `Salam kenal, **${updatedData.name}**! ✨\n\nSelanjutnya, silakan masukkan **Alamat Email** aktif Anda untuk pengiriman proposal & penawaran:`,
                        timestamp: getTimestamp(),
                        inputType: 'email'
                    }
                ])
            } else if (stepNumber === 5) {
                setCurrentStep(5)
                setMessages(prev => [
                    ...prev,
                    {
                        id: `msg-${Date.now()}`,
                        sender: 'bot',
                        text: 'Bagus! Agar komunikasi lebih cepat, boleh masukkan **No. WhatsApp** Anda? (Atau klik lewati jika tidak berkenan):',
                        timestamp: getTimestamp(),
                        inputType: 'tel'
                    }
                ])
            } else if (stepNumber === 6) {
                setCurrentStep(6)
                setMessages(prev => [
                    ...prev,
                    {
                        id: `msg-${Date.now()}`,
                        sender: 'bot',
                        text: 'Boleh juga sebutkan nama **Perusahaan / Organisasi** Anda? (Opsional, atau klik lewati):',
                        timestamp: getTimestamp(),
                        inputType: 'text'
                    }
                ])
            } else if (stepNumber === 7) {
                setCurrentStep(7)
                setMessages(prev => [
                    ...prev,
                    {
                        id: `msg-${Date.now()}`,
                        sender: 'bot',
                        text: 'Sip! Sekarang silakan **Ceritakan Detail Kebutuhan** atau fitur utama yang ingin Anda bangun:',
                        timestamp: getTimestamp(),
                        inputType: 'textarea'
                    }
                ])
            } else if (stepNumber === 8) {
                setCurrentStep(8)
                setMessages(prev => [
                    ...prev,
                    {
                        id: `msg-${Date.now()}`,
                        sender: 'bot',
                        text: 'Berapa perkiraan **Budget Range** yang Anda sediakan untuk project ini?',
                        timestamp: getTimestamp(),
                        options: [
                            { id: 'Belum tahu budget', label: 'Belum tahu budget', iconType: 'budget' },
                            { id: '< 500k', label: '< Rp 500.000', iconType: 'budget' },
                            { id: '500k - 1jt', label: 'Rp 500rb - 1jt', iconType: 'budget' },
                            { id: '1jt - 3jt', label: 'Rp 1jt - 3jt', iconType: 'budget' },
                            { id: '3jt - 5jt', label: 'Rp 3jt - 5jt', iconType: 'budget' },
                            { id: '5jt - 10jt', label: 'Rp 5jt - 10jt', iconType: 'budget' },
                            { id: '> 10jt', label: '> Rp 10jt', iconType: 'budget' }
                        ]
                    }
                ])
            } else if (stepNumber === 9) {
                setCurrentStep(9)
                setMessages(prev => [
                    ...prev,
                    {
                        id: `msg-${Date.now()}`,
                        sender: 'bot',
                        text: 'Terakhir, kapan **Target Deadline** pengerjaan project ini?',
                        timestamp: getTimestamp(),
                        options: [
                            { id: 'ASAP (Secepatnya)', label: '⚡ ASAP (Secepatnya)', iconType: 'deadline' },
                            { id: '1-2 Minggu', label: '📅 1-2 Minggu', iconType: 'deadline' },
                            { id: '1 Bulan', label: '🗓️ 1 Bulan', iconType: 'deadline' },
                            { id: 'Fleksibel', label: '⏳ Fleksibel', iconType: 'deadline' }
                        ]
                    }
                ])
            } else if (stepNumber === 10) {
                setCurrentStep(10)
                setMessages(prev => [
                    ...prev,
                    {
                        id: `msg-${Date.now()}`,
                        sender: 'bot',
                        text: 'Luar biasa! 🎉 Semua data telah terkumpul. Mohon periksa ringkasan request Anda berikut ini:',
                        timestamp: getTimestamp(),
                        isSummary: true
                    }
                ])
            }
        }, 200)
    }

    // Option Pill Click Handler
    const handleOptionSelect = (optionId: string, optionLabel: string) => {
        if (isTyping) return

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: optionLabel,
            timestamp: getTimestamp()
        }
        setMessages(prev => [...prev, userMsg])

        let updated = { ...formData }

        if (currentStep === 1) {
            updated.serviceType = optionId
            setFormData(updated)
            triggerNextBotStep(2, updated)
        } else if (currentStep === 2) {
            updated.selectedModel = optionId
            setFormData(updated)
            triggerNextBotStep(3, updated)
        } else if (currentStep === 8) {
            updated.budget = optionId
            setFormData(updated)
            triggerNextBotStep(9, updated)
        } else if (currentStep === 9) {
            updated.deadline = optionId
            setFormData(updated)
            triggerNextBotStep(10, updated)
        }
    }

    // Text Input Submit Handler
    const handleTextSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const text = inputValue.trim()

        if (!text && currentStep !== 5 && currentStep !== 6) return

        const textToShow = text || '(Dilewati)'

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: textToShow,
            timestamp: getTimestamp()
        }
        setMessages(prev => [...prev, userMsg])
        setInputValue('')

        let updated = { ...formData }

        if (currentStep === 3) {
            updated.name = text
            setFormData(updated)
            triggerNextBotStep(4, updated)
        } else if (currentStep === 4) {
            if (!text.includes('@') || !text.includes('.')) {
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: `bot-err-${Date.now()}`,
                            sender: 'bot',
                            text: '⚠️ Format email sepertinya belum pas. Masukkan alamat email yang valid (contoh: nama@domain.com):',
                            timestamp: getTimestamp(),
                            inputType: 'email'
                        }
                    ])
                }, 150)
                return
            }
            updated.email = text
            setFormData(updated)
            triggerNextBotStep(5, updated)
        } else if (currentStep === 5) {
            updated.phone = text
            setFormData(updated)
            triggerNextBotStep(6, updated)
        } else if (currentStep === 6) {
            updated.company = text
            setFormData(updated)
            triggerNextBotStep(7, updated)
        } else if (currentStep === 7) {
            updated.requirements = text
            setFormData(updated)
            triggerNextBotStep(8, updated)
        }
    }

    // Final Request Submit Handler
    const handleFinalSubmit = async () => {
        setIsSubmitting(true)
        try {
            const payloadService = formData.serviceType === 'consultation' ? 'consultation' : `${formData.serviceType}_${formData.selectedModel}`
            const res = await fetch('/api/template-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    company: formData.company || null,
                    serviceType: payloadService,
                    requirements: formData.requirements,
                    budget: formData.budget || null,
                    deadline: formData.deadline || null
                })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setIsSubmitting(false)
                setIsCompleted(true)
                setMessages(prev => [
                    ...prev,
                    {
                        id: `msg-success-${Date.now()}`,
                        sender: 'bot',
                        text: `✨ **Permintaan Berhasil Terkirim!**\n\nTerima kasih, **${formData.name}**! Tim RSQUARE akan mempelajari kebutuhan Anda dan menghubungi Anda via WhatsApp/Email dalam 1x24 jam.`,
                        timestamp: getTimestamp()
                    }
                ])
                if (onSubmitSuccess) onSubmitSuccess(formData)
            } else {
                throw new Error(data.error || 'Gagal mengirim')
            }
        } catch (err) {
            setIsSubmitting(false)
            setMessages(prev => [
                ...prev,
                {
                    id: `msg-err-${Date.now()}`,
                    sender: 'bot',
                    text: '❌ Terjadi masalah saat mengirim request. Mohon pastikan koneksi lancar atau tekan tombol kirim ulang.',
                    timestamp: getTimestamp()
                }
            ])
        }
    }

    const getServiceLabel = (type: string) => {
        switch (type) {
            case 'sheets': return 'Google Sheets'
            case 'webapp': return 'Google Web Apps'
            case 'fullstack': return 'Full Stack App'
            case 'consultation': return 'Konsultasi Gratis'
            default: return type
        }
    }

    const getModelLabel = (model: string) => {
        switch (model) {
            case 'proyek': return 'Model Proyek'
            case 'tim-embed': return 'Tim Embed'
            case 'retainer': return 'Retainer SLA'
            default: return model
        }
    }

    const renderFormattedText = (text: string) => {
        if (!text) return null
        const parts = text.split(/(\*\*.*?\*\*)/g)
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={i} className="font-bold text-gray-900">
                        {part.slice(2, -2)}
                    </strong>
                )
            }
            return part
        })
    }

    const renderOptionIcon = (iconType?: string) => {
        switch (iconType) {
            case 'sheets':
                return <FileSpreadsheet className="w-5 h-5 text-orange-600 flex-shrink-0" />
            case 'webapp':
                return <Globe className="w-5 h-5 text-amber-600 flex-shrink-0" />
            case 'fullstack':
                return <Rocket className="w-5 h-5 text-purple-600 flex-shrink-0" />
            case 'consultation':
                return <MessageSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            case 'proyek':
                return <Layers className="w-5 h-5 text-orange-600 flex-shrink-0" />
            case 'tim-embed':
                return <Users className="w-5 h-5 text-amber-600 flex-shrink-0" />
            case 'retainer':
                return <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0" />
            case 'budget':
                return <CircleDollarSign className="w-4 h-4 text-orange-500 flex-shrink-0" />
            case 'deadline':
                return <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
            default:
                return null
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[999999] bg-slate-950/80 sm:backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: 'easeOut', duration: 0.25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-3xl h-[92vh] sm:h-[88vh] max-h-[92vh] sm:max-h-[700px] min-h-[480px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border-t sm:border border-gray-200 relative z-[1000000] transform-gpu"
                >
                    {/* Mobile Sheet Drag Handle Indicator */}
                    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-2 sm:hidden flex-shrink-0" />

                    {/* Modal Header */}
                    <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-white border-b border-gray-100 text-gray-900 flex items-center justify-between z-20 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shadow-2xs">
                                <Bot className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-base sm:text-lg text-gray-900 tracking-tight">RSQUARE Assistant Bot</h3>
                                    <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold border border-orange-100">
                                        Interactive
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Online • Asisten Konsultasi Project
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={initChat}
                                title="Reset Percakapan"
                                className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Reset</span>
                            </button>
                            <button
                                onClick={onClose}
                                title="Tutup Modal"
                                className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 border border-gray-200 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                            >
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline">Tutup</span>
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60 custom-scrollbar transform-gpu">
                        <div className="text-center py-1">
                            <span className="text-[11px] font-medium text-gray-500 bg-white border border-gray-200/80 px-3.5 py-1 rounded-full shadow-2xs">
                                💬 Sesi Diskusi Interactive • RSQUARE Assistant
                            </span>
                        </div>

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`flex items-end gap-2.5 max-w-[92%] sm:max-w-[82%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {msg.sender === 'bot' && (
                                        <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 border border-orange-200 flex items-center justify-center flex-shrink-0 shadow-2xs mb-1">
                                            <Bot className="w-4.5 h-4.5 text-orange-600" />
                                        </div>
                                    )}

                                    <div
                                        className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-br-xs shadow-sm font-medium'
                                                : 'bg-white text-gray-800 rounded-bl-xs border border-gray-200/80 shadow-2xs'
                                            }`}
                                    >
                                        <div className="whitespace-pre-line">{renderFormattedText(msg.text)}</div>

                                        {/* Option Pills - Fast SVG Lucide Icons */}
                                        {msg.options && !isCompleted && (
                                            <div className="mt-3.5 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {msg.options.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleOptionSelect(opt.id, opt.label)}
                                                        disabled={isTyping}
                                                        className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-orange-50/60 border border-gray-200 hover:border-orange-400 text-left transition-all duration-200 group active:scale-[0.98] shadow-2xs"
                                                    >
                                                        {renderOptionIcon(opt.iconType)}
                                                        <div>
                                                            <span className="font-bold text-xs text-gray-900 group-hover:text-orange-600 transition-colors block">
                                                                {opt.label}
                                                            </span>
                                                            {opt.subtext && (
                                                                <span className="text-[11px] text-gray-500 block font-normal mt-0.5">
                                                                    {opt.subtext}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Summary Card */}
                                        {msg.isSummary && (
                                            <div className="mt-4 p-4 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                    <div className="p-2.5 rounded-lg bg-white border border-orange-100 shadow-2xs">
                                                        <span className="text-gray-400 block text-[10px] font-semibold uppercase">Layanan Utama</span>
                                                        <span className="font-bold text-orange-600">{getServiceLabel(formData.serviceType)}</span>
                                                    </div>
                                                    {formData.serviceType !== 'consultation' && (
                                                        <div className="p-2.5 rounded-lg bg-white border border-orange-100 shadow-2xs">
                                                            <span className="text-gray-400 block text-[10px] font-semibold uppercase">Model Kerjasama</span>
                                                            <span className="font-bold text-amber-700">{getModelLabel(formData.selectedModel)}</span>
                                                        </div>
                                                    )}
                                                    <div className="p-2.5 rounded-lg bg-white border border-orange-100 shadow-2xs">
                                                        <span className="text-gray-400 block text-[10px] font-semibold uppercase">Nama & Email</span>
                                                        <span className="font-semibold text-gray-800">{formData.name}</span>
                                                        <span className="text-gray-500 block text-[11px]">{formData.email}</span>
                                                    </div>
                                                    <div className="p-2.5 rounded-lg bg-white border border-orange-100 shadow-2xs">
                                                        <span className="text-gray-400 block text-[10px] font-semibold uppercase">Kontak & Perusahaan</span>
                                                        <span className="font-semibold text-gray-800">{formData.phone || '-'}</span>
                                                        <span className="text-gray-500 block text-[11px]">{formData.company || '-'}</span>
                                                    </div>
                                                </div>

                                                <div className="p-2.5 rounded-lg bg-white border border-orange-100 text-xs shadow-2xs">
                                                    <span className="text-gray-400 block text-[10px] font-semibold uppercase mb-1">Detail Kebutuhan</span>
                                                    <p className="text-gray-700 italic">{formData.requirements}</p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 font-semibold border border-orange-200">
                                                        Budget: {formData.budget || 'Belum tahu'}
                                                    </span>
                                                    <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                                                        Deadline: {formData.deadline || 'Fleksibel'}
                                                    </span>
                                                </div>

                                                {!isCompleted && (
                                                    <button
                                                        onClick={handleFinalSubmit}
                                                        disabled={isSubmitting}
                                                        className="w-full mt-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                Mengirim Request...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="w-4 h-4" />
                                                                Kirim Request Sekarang
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <span className="text-[10px] text-gray-400 mt-1 px-1 font-mono">
                                    {msg.timestamp}
                                </span>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex items-center gap-2 max-w-[80%]">
                                <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                    <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                                </div>
                                <div className="p-3.5 rounded-2xl rounded-bl-xs bg-white border border-gray-200/80 shadow-2xs flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Text Input Bar */}
                    {!isCompleted && [3, 4, 5, 6, 7].includes(currentStep) && (
                        <div className="p-3.5 sm:p-4 bg-white border-t border-gray-100 z-20 flex-shrink-0">
                            <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                                {currentStep === 7 ? (
                                    <textarea
                                        ref={inputRef as any}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleTextSubmit()
                                            }
                                        }}
                                        rows={2}
                                        placeholder="Jelaskan fitur/kebutuhan Anda... (Tekan Enter untuk kirim)"
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none transition-all"
                                    />
                                ) : (
                                    <input
                                        ref={inputRef as any}
                                        type={currentStep === 4 ? 'email' : currentStep === 5 ? 'tel' : 'text'}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={
                                            currentStep === 3 ? 'Ketik nama lengkap Anda...' :
                                                currentStep === 4 ? 'contoh: nama@gmail.com' :
                                                    currentStep === 5 ? '08xxxxxxxxxx (opsional)' :
                                                        currentStep === 6 ? 'Nama perusahaan/organisasi (opsional)...' :
                                                            'Ketik balasan Anda...'
                                        }
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                    />
                                )}

                                {(currentStep === 5 || currentStep === 6) && (
                                    <button
                                        type="button"
                                        onClick={() => handleTextSubmit()}
                                        className="px-3.5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold border border-gray-200 transition-all active:scale-95"
                                    >
                                        Lewati
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={isTyping}
                                    className="p-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
