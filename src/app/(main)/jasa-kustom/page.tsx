'use client'

import { ClientLordIcon } from '@/components/ui/lordicon'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
    FileSpreadsheet, 
    Globe, 
    Rocket, 
    Check, 
    Star,
    MessageCircle,
    Clock,
    ChevronDown,
    ChevronRight,
    Sparkles,
    ArrowRight
} from 'lucide-react'

interface DialogState {
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
}

interface Portfolio {
    id: number
    title: string
    slug: string
    description: string
    image: string
    category: string
    features: string[]
    serviceType: string
}

interface Testimonial {
    id: number
    name: string
    socialMedia: string
    templateName: string
    templateSlug: string
    rating: number
    likes: string
}

const services = [
    {
        id: 'sheets',
        icon: FileSpreadsheet,
        title: 'Google Sheets Templates',
        shortDesc: 'Spreadsheet pintar dengan automasi',
        badge: 'Mulai Rp 250K',
        color: 'orange',
        description: 'Spreadsheet pintar dengan formula canggih dan automasi Google Apps Script untuk efisiensi maksimal.',
        features: [
            'Custom formulas & conditional formatting',
            'Apps Script automation',
            'Multi-sheet integration',
            'Data validation & protection',
            'Email notifications otomatis',
            'Custom dashboard & charts'
        ],
        useCases: [
            'Inventory management system',
            'Sales tracking & reporting',
            'HR attendance & payroll',
            'Project management tracker',
            'CRM sederhana',
            'Financial budgeting tool'
        ],
        pricing: 'Rp 250.000 - Rp 3.000.000',
        timeline: '7-14 hari kerja',
        support: {
            free: '1 Tahun',
            description: 'Free support & bug fixes selama 1 tahun penuh'
        },
        showcase: {
            title: 'Sistem Inventory & POS',
            description: 'Spreadsheet lengkap untuk tracking stok, penjualan, dan laporan keuangan otomatis',
            image: '/screenshot/sheets-inventory.png'
        }
    },
    {
        id: 'webapp',
        icon: Globe,
        title: 'Google Web Apps',
        shortDesc: 'Aplikasi web berbasis Apps Script',
        badge: 'Mulai Rp 1.5jt',
        color: 'blue',
        description: 'Aplikasi web interaktif yang terintegrasi penuh dengan Google Workspace Anda.',
        features: [
            'Custom UI dengan HTML/CSS/JS',
            'Google Apps Script backend',
            'Integration dengan Sheets, Drive, Gmail',
            'Real-time data synchronization',
            'User authentication system',
            'Mobile responsive design'
        ],
        useCases: [
            'Internal dashboard perusahaan',
            'Form submission system',
            'Approval workflow app',
            'Employee portal',
            'Document management system',
            'Reporting & analytics platform'
        ],
        pricing: 'Rp 1.500.000 - Rp 5.000.000+',
        timeline: '14-30 hari kerja',
        support: {
            free: '6 Bulan',
            description: 'Free support & bug fixes selama 6 bulan'
        },
        showcase: {
            title: 'Employee Portal System',
            description: 'Aplikasi portal karyawan dengan absensi, pengajuan cuti, dan dashboard HR terintegrasi Google Workspace',
            image: '/screenshot/webapp-portal.png'
        }
    },
    {
        id: 'fullstack',
        icon: Rocket,
        title: 'Full Stack Development',
        shortDesc: 'Website & aplikasi custom',
        badge: 'Mulai Rp 5jt',
        color: 'purple',
        description: 'Website dan aplikasi custom full-featured dengan teknologi modern seperti Next.js, React, dan Supabase.',
        features: [
            'Modern tech stack (Next.js, React)',
            'Database design (Supabase/PostgreSQL)',
            'Authentication & authorization',
            'Admin dashboard lengkap',
            'Payment integration',
            'SEO optimized & mobile responsive',
            'Cloud deployment',
            'Ongoing maintenance (optional)'
        ],
        useCases: [
            'E-commerce platform',
            'SaaS application',
            'Booking & reservation system',
            'Company profile website',
            'Learning management system',
            'Custom business application'
        ],
        pricing: 'Rp 5.000.000 - Rp 30.000.000+',
        timeline: '30-90 hari kerja',
        support: {
            free: '1 Bulan',
            description: 'Free support & bug fixes selama 1 bulan'
        },
        showcase: {
            title: 'Omzetin.web.id',
            description: 'Platform jajanan online dengan inventory, ordering system, dan payment integration',
            link: 'https://omzetin.web.id',
            tech: ['Next.js', 'Supabase', 'Tailwind CSS', 'TypeScript']
        }
    }
]

const processSteps = [
    { number: 1, title: 'Konsultasi Gratis', desc: 'Diskusikan kebutuhan & budget', lordicon: 'https://cdn.lordicon.com/fdxqrdfe.json', duration: '30 menit' },
    { number: 2, title: 'Proposal', desc: 'Scope of work & quotation', lordicon: 'https://cdn.lordicon.com/nocovwne.json', duration: '1-2 hari' },
    { number: 3, title: 'Development', desc: 'Pengerjaan dengan update berkala', lordicon: 'https://cdn.lordicon.com/wloilxuq.json', duration: '1-12 minggu' },
    { number: 4, title: 'Review', desc: 'Revisi sampai sempurna', lordicon: 'https://cdn.lordicon.com/aklfruoc.json', duration: '3-7 hari' },
    { number: 5, title: 'Delivery', desc: 'Handover + training + support', lordicon: 'https://cdn.lordicon.com/lupuorrc.json', duration: 'Forever' }
]

const faqs = [
    { q: 'Apakah bisa revisi setelah project selesai?', a: 'Ya! Kami provide unlimited revision hingga Anda puas. Setelah delivery, minor updates dan bug fixes gratis selamanya.' },
    { q: 'Berapa lama waktu pengerjaan?', a: 'Sheets templates: 7-14 hari. Web apps: 14-30 hari. Full stack: 30-90 hari. Tergantung kompleksitas project.' },
    { q: 'Apakah saya mendapat source code?', a: 'Ya! Anda mendapat full ownership source code + dokumentasi lengkap untuk semua project.' },
    { q: 'Bagaimana sistem pembayarannya?', a: 'DP 50% setelah proposal disetujui, pelunasan 50% setelah project selesai dan Anda approve hasil akhirnya.' },
    { q: 'Apakah ada maintenance fee?', a: 'Free maintenance & bug fixes selamanya. Untuk penambahan fitur baru, dikenakan biaya terpisah sesuai scope.' },
    { q: 'Apakah bisa integrasi dengan sistem existing?', a: 'Ya! Kami bisa integrate dengan API, database, atau sistem yang sudah Anda punya.' }
]

export default function JasaKustomPage() {
    const [activeService, setActiveService] = useState('sheets')
    const [serviceType, setServiceType] = useState('sheets')
    const [formStatus, setFormStatus] = useState<'idle' | 'sending'>('idle')
    const [portfolio, setPortfolio] = useState<Portfolio[]>([])
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
    const [dialog, setDialog] = useState<DialogState>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    })

    const heroRef = useRef(null)
    const servicesRef = useRef(null)
    const portfolioRef = useRef(null)
    const processRef = useRef(null)
    const testimonialsRef = useRef(null)
    const faqRef = useRef(null)
    const formRef = useRef(null)

    const heroInView = useInView(heroRef, { once: true })
    const servicesInView = useInView(servicesRef, { once: true })
    const portfolioInView = useInView(portfolioRef, { once: true })
    const processInView = useInView(processRef, { once: true })
    const testimonialsInView = useInView(testimonialsRef, { once: true })
    const faqInView = useInView(faqRef, { once: true })
    const formInView = useInView(formRef, { once: true })

    useEffect(() => {
        fetch('/api/custom-portfolio')
            .then(res => res.json())
            .then(data => {
                if (data.portfolio) setPortfolio(data.portfolio)
            })
            .catch(console.error)

        fetch('/api/custom-testimonials')
            .then(res => res.json())
            .then(data => {
                if (data.testimonials) setTestimonials(data.testimonials)
            })
            .catch(console.error)
    }, [])

    const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }))

    const scrollToForm = () => {
        document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormStatus('sending')

        const formData = new FormData(e.currentTarget)
        const form = e.currentTarget

        try {
            const res = await fetch('/api/template-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone') || null,
                    company: formData.get('company') || null,
                    serviceType: serviceType,
                    requirements: formData.get('requirements'),
                    budget: formData.get('budget') || null,
                    deadline: formData.get('deadline') || null,
                }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setFormStatus('idle')
                form.reset()
                setServiceType('sheets')
                setDialog({
                    isOpen: true,
                    type: 'success',
                    title: 'Request Terkirim!',
                    message: 'Terima kasih! Tim kami akan menghubungi Anda dalam 1x24 jam untuk diskusi lebih lanjut.'
                })
            } else {
                throw new Error(data.error)
            }
        } catch {
            setFormStatus('idle')
            setDialog({
                isOpen: true,
                type: 'error',
                title: 'Gagal Mengirim',
                message: 'Terjadi kesalahan. Silakan coba lagi atau hubungi kami langsung.'
            })
        }
    }

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-white to-purple-50/30" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Floating Shapes */}
                <motion.div
                    className="absolute top-24 right-[10%] w-20 h-20 opacity-20"
                    animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-orange-400">
                        <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" />
                    </svg>
                </motion.div>

                <motion.div
                    className="absolute top-[30%] left-[5%] w-32 h-32 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-500/20 blur-2xl"
                    animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.div
                    className="absolute top-[50%] right-[8%] w-24 h-24 opacity-15"
                    animate={{ y: [0, -25, 0], rotate: [0, 90, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl" />
                </motion.div>

                <motion.div
                    className="absolute bottom-[30%] left-[12%] w-16 h-16 opacity-20"
                    animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-400">
                        <circle cx="50" cy="50" r="45" />
                    </svg>
                </motion.div>

                <motion.div
                    className="absolute bottom-[20%] right-[15%] w-28 h-28 rounded-full bg-gradient-to-br from-orange-400/15 to-amber-500/15 blur-xl"
                    animate={{ y: [0, -20, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                />

                <motion.div
                    className="absolute top-[70%] left-[8%] w-12 h-12 opacity-15"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full stroke-purple-500" fill="none" strokeWidth="8">
                        <polygon points="50,10 90,90 10,90" />
                    </svg>
                </motion.div>
            </div>

            {/* Hero Section */}
            <section ref={heroRef} className="relative py-16 md:py-24 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={heroInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-100 to-purple-100 px-4 py-1.5 text-sm font-medium text-gray-700 mb-6">
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/lupuorrc.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#ea580c,secondary:#9333ea"
                                    style={{ width: '20px', height: '20px' }}
                                />
                                Custom Development Services
                            </span>
                            
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={heroInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="inline-block text-gray-900"
                                >
                                    Dari Ide Menjadi{' '}
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                                    transition={{ 
                                        duration: 0.8, 
                                        delay: 0.3,
                                        type: "spring",
                                        stiffness: 120,
                                        damping: 20
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-500 to-purple-600"
                                >
                                    Solusi Digital
                                </motion.span>
                            </h1>
                            
                            <motion.p
                                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                                animate={heroInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                                transition={{ duration: 0.7, delay: 0.4 }}
                                className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-12"
                            >
                                Transform workflow bisnis Anda dengan automasi cerdas - mulai dari Google Sheets template, Web Apps, hingga Full Stack Development
                            </motion.p>
                        </motion.div>

                        {/* Service Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            {services.map((service, idx) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={heroInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                                    onClick={() => {
                                        setActiveService(service.id)
                                        setServiceType(service.id)
                                        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
                                    }}
                                    className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-200 ease-out hover:-translate-y-2 bg-white shadow-md ${
                                        service.color === 'orange' ? 'border-2 border-orange-200 hover:shadow-xl hover:shadow-orange-200/50 hover:border-orange-300' :
                                        service.color === 'blue' ? 'border-2 border-blue-200 hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-300' :
                                        'border-2 border-purple-200 hover:shadow-xl hover:shadow-purple-200/50 hover:border-purple-300'
                                    } group`}
                                >
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto transition-transform duration-300 group-hover:scale-110 ${
                                        service.color === 'orange' ? 'bg-orange-100' :
                                        service.color === 'blue' ? 'bg-blue-100' :
                                        'bg-purple-100'
                                    }`}>
                                        <service.icon className={`w-7 h-7 ${
                                            service.color === 'orange' ? 'text-orange-600' :
                                            service.color === 'blue' ? 'text-blue-600' :
                                            'text-purple-600'
                                        }`} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{service.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4 text-center">{service.shortDesc}</p>
                                    <div className="text-center">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                            service.color === 'orange' ? 'bg-orange-500 text-white' :
                                            service.color === 'blue' ? 'bg-blue-500 text-white' :
                                            'bg-purple-500 text-white'
                                        }`}>
                                            {service.badge}
                                        </span>
                                    </div>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Detail */}
            <section id="services" ref={servicesRef} className="py-16 md:py-20 relative">
                <div className="container mx-auto px-6 relative z-10">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="inline-block text-gray-900"
                            >
                                Layanan{' '}
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={servicesInView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500"
                            >
                                Kami
                            </motion.span>
                        </h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={servicesInView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-lg text-gray-600 max-w-2xl mx-auto"
                        >
                            Dari spreadsheet sederhana hingga aplikasi enterprise, kami siap membantu transformasi digital bisnis Anda
                        </motion.p>
                    </motion.div>

                    {/* Service Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {services.map((service, idx) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                                className="group"
                            >
                                <div className={`relative h-full bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-md ${
                                    activeService === service.id 
                                        ? service.color === 'orange' ? 'border-orange-400 shadow-lg shadow-orange-200/60' :
                                          service.color === 'blue' ? 'border-blue-400 shadow-lg shadow-blue-200/60' :
                                          'border-purple-400 shadow-lg shadow-purple-200/60'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    {/* Color Accent Top */}
                                    <div className={`h-1.5 rounded-t-2xl ${
                                        service.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                                        service.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                        'bg-gradient-to-r from-purple-500 to-pink-500'
                                    }`} />

                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                                                service.color === 'orange' ? 'bg-orange-100' :
                                                service.color === 'blue' ? 'bg-blue-100' :
                                                'bg-purple-100'
                                            }`}>
                                                <service.icon className={`w-7 h-7 ${
                                                    service.color === 'orange' ? 'text-orange-600' :
                                                    service.color === 'blue' ? 'text-blue-600' :
                                                    'text-purple-600'
                                                }`} />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                service.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                service.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                                {service.badge}
                                            </span>
                                        </div>

                                        {/* Title & Description */}
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{service.shortDesc}</p>

                                        {/* Features */}
                                        <div className="space-y-2 mb-4">
                                            {service.features.slice(0, 4).map((feature, fIdx) => (
                                                <div key={fIdx} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Check className={`w-4 h-4 flex-shrink-0 ${
                                                        service.color === 'orange' ? 'text-orange-500' :
                                                        service.color === 'blue' ? 'text-blue-500' :
                                                        'text-purple-500'
                                                    }`} />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Support Info */}
                                        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                                            service.color === 'orange' ? 'bg-orange-50' :
                                            service.color === 'blue' ? 'bg-blue-50' :
                                            'bg-purple-50'
                                        }`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                service.color === 'orange' ? 'bg-orange-100' :
                                                service.color === 'blue' ? 'bg-blue-100' :
                                                'bg-purple-100'
                                            }`}>
                                                <ClientLordIcon
                                                    src="https://cdn.lordicon.com/ssvybplt.json"
                                                    trigger="hover"
                                                    colors={
                                                        service.color === 'orange' ? 'primary:#ea580c,secondary:#fbbf24' :
                                                        service.color === 'blue' ? 'primary:#2563eb,secondary:#06b6d4' :
                                                        'primary:#9333ea,secondary:#ec4899'
                                                    }
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-semibold ${
                                                    service.color === 'orange' ? 'text-orange-700' :
                                                    service.color === 'blue' ? 'text-blue-700' :
                                                    'text-purple-700'
                                                }`}>
                                                    Free Support {service.support.free}
                                                </p>
                                                <p className="text-xs text-gray-500">Lalu maintenance sesuai kompleksitas</p>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                                <Clock className="w-4 h-4" />
                                                {service.timeline}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setServiceType(service.id)
                                                    scrollToForm()
                                                }}
                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                                                    service.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600' :
                                                    service.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                                                    'bg-purple-500 hover:bg-purple-600'
                                                }`}
                                            >
                                                Request
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.6 }}
                        className="mt-10 text-center"
                    >
                        <p className="text-gray-600 mb-4">
                            Tidak yakin layanan mana yang cocok? Konsultasi gratis untuk membahas kebutuhan Anda
                        </p>
                        <button
                            onClick={scrollToForm}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Konsultasi Gratis
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Portfolio Section */}
            {portfolio.length > 0 && (
                <section ref={portfolioRef} className="py-16 md:py-20 relative">
                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={portfolioInView ? { opacity: 1, y: 0 } : {}}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={portfolioInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="inline-block text-gray-900"
                                >
                                    Portfolio{' '}
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={portfolioInView ? { opacity: 1, scale: 1 } : {}}
                                    transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500"
                                >
                                    Custom Project
                                </motion.span>
                            </h2>
                            <motion.p
                                initial={{ opacity: 0, filter: "blur(5px)" }}
                                animate={portfolioInView ? { opacity: 1, filter: "blur(0px)" } : {}}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="text-lg text-gray-600"
                            >
                                Hasil karya kami untuk berbagai klien
                            </motion.p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {portfolio.slice(0, 6).map((project, idx) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={portfolioInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Link href={`/templates/${project.slug}`}>
                                        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group border-2 border-gray-200 hover:border-orange-300">
                                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                                {project.image ? (
                                                    <Image 
                                                        src={project.image} 
                                                        alt={project.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                                                        <ClientLordIcon
                                                            src="https://cdn.lordicon.com/ghhwiltn.json"
                                                            trigger="loop"
                                                            delay="2000"
                                                            colors="primary:#fdba74,secondary:#fed7aa"
                                                            style={{ width: '48px', height: '48px' }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" />
                                                        Custom
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{project.title}</h3>
                                                <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {portfolio.length > 6 && (
                            <motion.div 
                                className="text-center mt-10"
                                initial={{ opacity: 0 }}
                                animate={portfolioInView ? { opacity: 1 } : {}}
                                transition={{ delay: 0.8 }}
                            >
                                <Link href="/templates?filter=custom">
                                    <motion.button 
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-orange-300 hover:text-orange-600 transition-all"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Lihat Semua Portfolio
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </section>
            )}

            {/* Process Timeline - Modern Design */}
            <section ref={processRef} className="py-16 md:py-24 relative overflow-hidden">
                {/* Background decorations */}
                <motion.div
                    className="absolute top-1/4 right-[5%] w-48 h-48 rounded-full bg-orange-100/40 blur-3xl"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-1/4 left-[5%] w-40 h-40 rounded-full bg-purple-100/40 blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 12, repeat: Infinity }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={processInView ? { opacity: 1, y: 0 } : {}}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={processInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="inline-block text-gray-900"
                            >
                                Proses{' '}
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                                animate={processInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
                                transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500"
                            >
                                Kerjasama
                            </motion.span>
                        </h2>
                        <motion.p
                            initial={{ opacity: 0, filter: "blur(5px)" }}
                            animate={processInView ? { opacity: 1, filter: "blur(0px)" } : {}}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-lg text-gray-600"
                        >
                            5 langkah mudah untuk memulai project Anda
                        </motion.p>
                    </motion.div>

                    {/* Modern Timeline */}
                    <div className="max-w-5xl mx-auto">
                        {/* Desktop Timeline */}
                        <div className="hidden md:block relative">
                            {/* Animated Line */}
                            <motion.div 
                                className="absolute top-24 left-0 right-0 h-1.5 bg-gray-100 rounded-full overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={processInView ? { opacity: 1 } : {}}
                            >
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500"
                                    initial={{ width: "0%" }}
                                    animate={processInView ? { width: "100%" } : {}}
                                    transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                                />
                            </motion.div>

                            <div className="grid grid-cols-5 gap-4 relative z-10">
                                {processSteps.map((step, idx) => (
                                    <motion.div
                                        key={step.number}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={processInView ? { opacity: 1, y: 0 } : {}}
                                        transition={{ duration: 0.6, delay: 0.3 + idx * 0.15 }}
                                        className="text-center"
                                    >
                                        {/* Icon Circle */}
                                        <motion.div
                                            className="relative mx-auto mb-6"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <motion.div
                                                className={`w-20 h-20 rounded-2xl bg-white shadow-xl border-2 flex items-center justify-center mx-auto relative overflow-hidden ${
                                                    idx === 0 ? 'border-orange-300' :
                                                    idx === 1 ? 'border-amber-300' :
                                                    idx === 2 ? 'border-pink-300' :
                                                    idx === 3 ? 'border-purple-300' :
                                                    'border-green-300'
                                                }`}
                                                initial={{ rotate: -180, scale: 0 }}
                                                animate={processInView ? { rotate: 0, scale: 1 } : {}}
                                                transition={{ duration: 0.6, delay: 0.5 + idx * 0.15, type: "spring" }}
                                            >
                                                <motion.div
                                                    className={`absolute inset-0 opacity-20 ${
                                                        idx === 0 ? 'bg-orange-400' :
                                                        idx === 1 ? 'bg-amber-400' :
                                                        idx === 2 ? 'bg-pink-400' :
                                                        idx === 3 ? 'bg-purple-400' :
                                                        'bg-green-400'
                                                    }`}
                                                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.1, 0.2] }}
                                                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.2 }}
                                                />
                                                <ClientLordIcon
                                                    src={step.lordicon}
                                                    trigger="loop"
                                                    delay="2000"
                                                    colors={
                                                        idx === 0 ? 'primary:#ea580c,secondary:#fbbf24' :
                                                        idx === 1 ? 'primary:#f59e0b,secondary:#fcd34d' :
                                                        idx === 2 ? 'primary:#ec4899,secondary:#f9a8d4' :
                                                        idx === 3 ? 'primary:#9333ea,secondary:#c084fc' :
                                                        'primary:#22c55e,secondary:#86efac'
                                                    }
                                                    style={{ width: '40px', height: '40px' }}
                                                />
                                            </motion.div>
                                            
                                            {/* Step Number Badge */}
                                            <motion.div
                                                className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                                                    idx === 0 ? 'bg-orange-500' :
                                                    idx === 1 ? 'bg-amber-500' :
                                                    idx === 2 ? 'bg-pink-500' :
                                                    idx === 3 ? 'bg-purple-500' :
                                                    'bg-green-500'
                                                }`}
                                                initial={{ scale: 0 }}
                                                animate={processInView ? { scale: 1 } : {}}
                                                transition={{ delay: 0.8 + idx * 0.15, type: "spring" }}
                                            >
                                                {step.number}
                                            </motion.div>
                                        </motion.div>

                                        {/* Content */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={processInView ? { opacity: 1, y: 0 } : {}}
                                            transition={{ delay: 0.7 + idx * 0.15 }}
                                        >
                                            <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                                            <p className="text-sm text-gray-600 mb-2">{step.desc}</p>
                                            <motion.span 
                                                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                                                    idx === 0 ? 'bg-orange-100 text-orange-600' :
                                                    idx === 1 ? 'bg-amber-100 text-amber-600' :
                                                    idx === 2 ? 'bg-pink-100 text-pink-600' :
                                                    idx === 3 ? 'bg-purple-100 text-purple-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {step.duration}
                                            </motion.span>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Timeline */}
                        <div className="md:hidden space-y-6">
                            {processSteps.map((step, idx) => (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={processInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                                    className="flex items-start gap-4"
                                >
                                    <motion.div
                                        className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${
                                            idx === 0 ? 'bg-orange-100' :
                                            idx === 1 ? 'bg-amber-100' :
                                            idx === 2 ? 'bg-pink-100' :
                                            idx === 3 ? 'bg-purple-100' :
                                            'bg-green-100'
                                        }`}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                        <ClientLordIcon
                                            src={step.lordicon}
                                            trigger="loop"
                                            delay="2000"
                                            colors={
                                                idx === 0 ? 'primary:#ea580c,secondary:#fbbf24' :
                                                idx === 1 ? 'primary:#f59e0b,secondary:#fcd34d' :
                                                idx === 2 ? 'primary:#ec4899,secondary:#f9a8d4' :
                                                idx === 3 ? 'primary:#9333ea,secondary:#c084fc' :
                                                'primary:#22c55e,secondary:#86efac'
                                            }
                                            style={{ width: '28px', height: '28px' }}
                                        />
                                    </motion.div>
                                    <div className="flex-1 pb-6 border-b-2 border-gray-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                                idx === 0 ? 'bg-orange-500' :
                                                idx === 1 ? 'bg-amber-500' :
                                                idx === 2 ? 'bg-pink-500' :
                                                idx === 3 ? 'bg-purple-500' :
                                                'bg-green-500'
                                            }`}>{step.number}</span>
                                            <h4 className="font-bold text-gray-900">{step.title}</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{step.desc}</p>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            idx === 0 ? 'bg-orange-100 text-orange-600' :
                                            idx === 1 ? 'bg-amber-100 text-amber-600' :
                                            idx === 2 ? 'bg-pink-100 text-pink-600' :
                                            idx === 3 ? 'bg-purple-100 text-purple-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>{step.duration}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            {testimonials.length > 0 && (
                <section ref={testimonialsRef} className="py-16 md:py-20 relative">
                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="inline-block text-gray-900"
                                >
                                    Apa Kata{' '}
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                                    animate={testimonialsInView ? { opacity: 1, scale: 1, rotateX: 0 } : {}}
                                    transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500"
                                >
                                    Klien Kami
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={testimonialsInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="inline-block text-gray-900"
                                >
                                    ?
                                </motion.span>
                            </h2>
                            <motion.p
                                initial={{ opacity: 0, filter: "blur(5px)" }}
                                animate={testimonialsInView ? { opacity: 1, filter: "blur(0px)" } : {}}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="text-lg text-gray-600"
                            >
                                Testimoni dari yang sudah menggunakan jasa kami
                            </motion.p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {testimonials.slice(0, 3).map((testimonial, idx) => (
                                <motion.div
                                    key={testimonial.id}
                                    initial={{ opacity: 0, y: 30, rotateY: -15 }}
                                    animate={testimonialsInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
                                    transition={{ delay: 0.2 + idx * 0.15, type: "spring" }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200 hover:shadow-xl hover:border-orange-200 transition-all"
                                >
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={testimonialsInView ? { opacity: 1, scale: 1 } : {}}
                                                transition={{ delay: 0.5 + idx * 0.1 + i * 0.05 }}
                                            >
                                                <Star 
                                                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-4 line-clamp-4">&quot;{testimonial.likes}&quot;</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-gray-900">{testimonial.name}</p>
                                            {testimonial.templateSlug ? (
                                                <Link 
                                                    href={`/templates/${testimonial.templateSlug}`}
                                                    className="text-sm text-orange-600 hover:text-orange-700"
                                                >
                                                    {testimonial.templateName}
                                                </Link>
                                            ) : (
                                                <p className="text-sm text-gray-500">{testimonial.templateName}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}



            {/* FAQ */}
            <section ref={faqRef} className="py-16 md:py-20 relative">
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={faqInView ? { opacity: 1, y: 0 } : {}}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            <motion.span
                                initial={{ opacity: 0, rotateX: -90 }}
                                animate={faqInView ? { opacity: 1, rotateX: 0 } : {}}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500"
                            >
                                FAQ
                            </motion.span>
                        </h2>
                        <motion.p
                            initial={{ opacity: 0, filter: "blur(5px)" }}
                            animate={faqInView ? { opacity: 1, filter: "blur(0px)" } : {}}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-lg text-gray-600"
                        >
                            Pertanyaan yang sering ditanyakan
                        </motion.p>
                    </motion.div>

                    <div className="max-w-3xl mx-auto space-y-3">
                        {faqs.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={faqInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.2 + idx * 0.08 }}
                                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-md hover:shadow-lg hover:border-orange-200 transition-all"
                            >
                                <motion.button
                                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                                    whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.02)' }}
                                >
                                    <span className="font-medium text-gray-900 flex items-center gap-3">
                                        <ClientLordIcon
                                            src="https://cdn.lordicon.com/ujxzdfjx.json"
                                            trigger="hover"
                                            colors="primary:#ea580c,secondary:#fbbf24"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        {faq.q}
                                    </span>
                                    <motion.div
                                        animate={{ rotate: expandedFaq === idx ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </motion.div>
                                </motion.button>
                                <AnimatePresence>
                                    {expandedFaq === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-4 text-gray-600 pl-14">{faq.a}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Request Form */}
            <section id="request-form" ref={formRef} className="py-16 md:py-20 relative overflow-hidden">
                <motion.div
                    className="absolute top-1/4 right-[5%] w-48 h-48 rounded-full bg-orange-100/30 blur-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
                
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={formInView ? { opacity: 1, y: 0 } : {}}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={formInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="inline-block text-gray-900"
                                >
                                    Siap Mulai{' '}
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={formInView ? { opacity: 1, scale: 1 } : {}}
                                    transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500"
                                >
                                    Project Anda
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={formInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="inline-block text-gray-900"
                                >
                                    ?
                                </motion.span>
                            </h2>
                            <motion.p
                                initial={{ opacity: 0, filter: "blur(5px)" }}
                                animate={formInView ? { opacity: 1, filter: "blur(0px)" } : {}}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="text-lg text-gray-600"
                            >
                                Isi form di bawah, kami akan hubungi dalam 1x24 jam
                            </motion.p>
                        </div>

                        <motion.div 
                            className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 md:p-10"
                            initial={{ opacity: 0, y: 30 }}
                            animate={formInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.4 }}
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Service Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Layanan yang Dibutuhkan</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'sheets', label: 'Google Sheets', lordicon: 'https://cdn.lordicon.com/ghhwiltn.json' },
                                            { id: 'webapp', label: 'Web App', lordicon: 'https://cdn.lordicon.com/lqxfrxad.json' },
                                            { id: 'fullstack', label: 'Full Stack', lordicon: 'https://cdn.lordicon.com/nocovwne.json' },
                                            { id: 'consultation', label: 'Konsultasi', lordicon: 'https://cdn.lordicon.com/fdxqrdfe.json' }
                                        ].map((opt) => (
                                            <motion.button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setServiceType(opt.id)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                                    serviceType === opt.id
                                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }`}
                                            >
                                                <ClientLordIcon
                                                    src={opt.lordicon}
                                                    trigger="hover"
                                                    colors={serviceType === opt.id ? 'primary:#ea580c,secondary:#fbbf24' : 'primary:#6b7280,secondary:#9ca3af'}
                                                    style={{ width: '24px', height: '24px' }}
                                                />
                                                <span className="font-medium">{opt.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Name & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="Nama Anda"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Phone & Company */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            No. WhatsApp <span className="text-gray-400">(Opsional)</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Perusahaan/Organisasi <span className="text-gray-400">(Opsional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="company"
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="Nama perusahaan"
                                        />
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ceritakan Kebutuhan Anda</label>
                                    <textarea
                                        name="requirements"
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all resize-none"
                                        placeholder="Jelaskan kebutuhan, fitur yang diinginkan, referensi (jika ada), dll."
                                    />
                                </div>

                                {/* Budget & Deadline */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Budget Range <span className="text-gray-400">(Opsional)</span>
                                        </label>
                                        <select
                                            name="budget"
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                        >
                                            <option value="">Belum tahu budget</option>
                                            <option value="< 500k">&lt; Rp 500.000</option>
                                            <option value="500k - 1jt">Rp 500.000 - Rp 1.000.000</option>
                                            <option value="1jt - 3jt">Rp 1.000.000 - Rp 3.000.000</option>
                                            <option value="3jt - 5jt">Rp 3.000.000 - Rp 5.000.000</option>
                                            <option value="5jt - 10jt">Rp 5.000.000 - Rp 10.000.000</option>
                                            <option value="> 10jt">&gt; Rp 10.000.000</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Target Deadline <span className="text-gray-400">(Opsional)</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="deadline"
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    disabled={formStatus === 'sending'}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:shadow-orange-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {formStatus === 'sending' ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/aklfruoc.json"
                                                trigger="hover"
                                                colors="primary:#ffffff,secondary:#ffffff"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                            Kirim Request
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Dialog */}
            <AnimatePresence>
                {dialog.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                        onClick={closeDialog}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-gray-200"
                        >
                            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                                dialog.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                                <ClientLordIcon
                                    src={dialog.type === 'success' 
                                        ? 'https://cdn.lordicon.com/lupuorrc.json'
                                        : 'https://cdn.lordicon.com/usownftb.json'
                                    }
                                    trigger="loop"
                                    colors={dialog.type === 'success' ? 'primary:#22c55e,secondary:#86efac' : 'primary:#ef4444,secondary:#fca5a5'}
                                    style={{ width: '48px', height: '48px' }}
                                />
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{dialog.title}</h3>
                            <p className="text-center text-gray-600 mb-6">{dialog.message}</p>
                            <motion.button
                                onClick={closeDialog}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Tutup
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}
