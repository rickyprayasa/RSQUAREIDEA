'use client'

import { ClientLordIcon } from '@/components/ui/lordicon'
import { ChatBotModal } from '@/components/jasa-kustom/ChatBotForm'
import { PortfolioCardStack } from '@/components/jasa-kustom/PortfolioCardStack'

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
    ArrowRight,
    Bot,
    FileText
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
    clientName?: string | null
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

type CategoryId = 'sheets' | 'webapp' | 'fullstack'
type ModelId = 'proyek' | 'tim-embed' | 'retainer'

interface ServiceTier {
    id: string
    serviceId: CategoryId
    modelId: ModelId
    categoryTag: string
    modelTag: string
    title: string
    shortDesc: string
    badge: string
    isPopular: boolean
    color: string
    pricing: string
    pricingSubtext: string
    timeline: string
    scopeType: string
    features: string[]
    support: {
        free: string
        description: string
    }
    ctaText: string
}

interface ServiceCategory {
    id: CategoryId
    name: string
    badge: string
    lordicon: string
    lordiconColor: string
    color: string
    desc: string
    tiers: ServiceTier[]
}

const serviceCategories: ServiceCategory[] = [
    {
        id: 'sheets',
        name: 'Google Sheets Templates',
        badge: 'Automasi & Spreadsheet',
        lordicon: 'https://cdn.lordicon.com/wloilxuq.json',
        lordiconColor: 'primary:#ea580c,secondary:#fbbf24',
        color: 'orange',
        desc: 'Spreadsheet pintar dengan automasi formula, Apps Script, & dashboard rekap otomatis',
        tiers: [
            {
                id: 'sheets_proyek',
                serviceId: 'sheets',
                modelId: 'proyek',
                categoryTag: 'SPRINT / FIXED SCOPE',
                modelTag: 'Model Proyek',
                title: 'Model Proyek (Fixed Scope)',
                shortDesc: 'Template Google Sheets kustom, formula kompleks, & automasi Apps Script sekali jalan.',
                badge: 'Mulai Rp 250K',
                isPopular: false,
                color: 'orange',
                pricing: 'Rp 250rb - 3jt',
                pricingSubtext: '/ project',
                timeline: '1-2 minggu',
                scopeType: 'Fixed Scope',
                features: [
                    'Scope & kebutuhan spesifik disepakati di awal',
                    'Formula kustom, conditional formatting & dashboard rekap',
                    'Automasi Apps Script (Email otomatis, WA link, cetak PDF)',
                    'Multi-sheet integration & proteksi data/rekening',
                    'Garansi bug fix hingga 1 tahun gratis',
                    'Full source spreadsheet + video tutorial pemakaian'
                ],
                support: {
                    free: '1 Tahun',
                    description: 'Free support & bug fixes selama 1 tahun penuh'
                },
                ctaText: 'PILIH MODEL PROYEK'
            },
            {
                id: 'sheets_tim-embed',
                serviceId: 'sheets',
                modelId: 'tim-embed',
                categoryTag: 'SQUAD / DEDICATED',
                modelTag: 'Tim Embed',
                title: 'Tim Embed (Dedicated Squad)',
                shortDesc: 'Developer Apps Script & Sheets dedicated untuk maintenance & pengembangan spreadsheet bulanan.',
                badge: 'PALING DIMINTA',
                isPopular: true,
                color: 'blue',
                pricing: 'Rp 3.5jt',
                pricingSubtext: '/ bulan',
                timeline: 'Dedicated Squad',
                scopeType: 'Min. 1 bulan',
                features: [
                    'Developer dedicated Apps Script & Google Sheets Specialist',
                    'Pengembangan & optimasi spreadsheet tanpa batas scope',
                    'Automasi workflow internal bulanan perusahaan Anda',
                    'Akses langsung via WhatsApp/Slack & demo berkala',
                    'Roadmap & prioritas tugas langsung dari Anda',
                    'Evaluasi & penyesuaian kebutuhan setiap bulan'
                ],
                support: {
                    free: 'Included',
                    description: 'Dedicated priority support & maintenance'
                },
                ctaText: 'PILIH TIM EMBED'
            },
            {
                id: 'sheets_retainer',
                serviceId: 'sheets',
                modelId: 'retainer',
                categoryTag: 'ENTERPRISE / SLA',
                modelTag: 'Retainer',
                title: 'Retainer (Enterprise SLA)',
                shortDesc: 'Support operasional berkelanjutan & SLA formal untuk spreadsheet bisnis kritis.',
                badge: 'Enterprise SLA',
                isPopular: false,
                color: 'purple',
                pricing: 'Custom SLA',
                pricingSubtext: '/ bulan',
                timeline: 'SLA Formal',
                scopeType: 'Kontrak fleksibel',
                features: [
                    'SLA Response Time < 1 jam untuk incident spreadsheet',
                    'Audit berkala performa formula & batas kuota Apps Script',
                    'Backup otomatis bulanan & recovery data sheet',
                    'On-call emergency support jam operasional bisnis',
                    'Laporan kesehatan spreadsheet & utilisasi bulanan'
                ],
                support: {
                    free: 'SLA 99.9%',
                    description: 'Penanganan insiden dengan SLA tertulis'
                },
                ctaText: 'PILIH RETAINER'
            }
        ]
    },
    {
        id: 'webapp',
        name: 'Google Web Apps',
        badge: 'Portal & Cloud Workspace',
        lordicon: 'https://cdn.lordicon.com/gqdnbnwt.json',
        lordiconColor: 'primary:#2563eb,secondary:#60a5fa',
        color: 'blue',
        desc: 'Aplikasi web kustom interaktif terintegrasi Google Workspace tanpa biaya server bulanan',
        tiers: [
            {
                id: 'webapp_proyek',
                serviceId: 'webapp',
                modelId: 'proyek',
                categoryTag: 'SPRINT / FIXED SCOPE',
                modelTag: 'Model Proyek',
                title: 'Model Proyek (Fixed Scope)',
                shortDesc: 'Pembuatan Web App kustom, portal internal, atau form interaktif berbasis Apps Script sekali jalan.',
                badge: 'Mulai Rp 1.5M',
                isPopular: false,
                color: 'orange',
                pricing: 'Rp 1.5jt - 5jt',
                pricingSubtext: '/ project',
                timeline: '2-4 minggu',
                scopeType: 'Fixed Scope',
                features: [
                    'Custom Web Interface (HTML, CSS, Tailwind, JS)',
                    'Backend Google Apps Script (Gratis tanpa biaya server)',
                    'Integrasi Google Workspace (Sheets, Drive, Gmail, Docs)',
                    'Multi-user login & otentikasi role permission',
                    'Garansi support & bug fix 6 bulan gratis',
                    'Full source code & dokumentasi operasional'
                ],
                support: {
                    free: '6 Bulan',
                    description: 'Free support & bug fixes 6 bulan'
                },
                ctaText: 'PILIH MODEL PROYEK'
            },
            {
                id: 'webapp_tim-embed',
                serviceId: 'webapp',
                modelId: 'tim-embed',
                categoryTag: 'SQUAD / DEDICATED',
                modelTag: 'Tim Embed',
                title: 'Tim Embed (Dedicated Squad)',
                shortDesc: 'Tim dedicated Web & Apps Script engineer untuk iterasi fitur Web App secara berkelanjutan.',
                badge: 'PALING DIMINTA',
                isPopular: true,
                color: 'blue',
                pricing: 'Rp 7.5jt',
                pricingSubtext: '/ bulan',
                timeline: 'Dedicated Squad',
                scopeType: 'Min. 1 bulan',
                features: [
                    'Tim dedicated 2-3 Engineer (Web App & Apps Script) + PM',
                    'Iterasi & peluncuran fitur baru Web App tiap minggu',
                    'Integrasi API 3rd party (Payment, WA Gateway, CRM)',
                    'Roadmap pengembangan fleksibel sesuai keputusan Anda',
                    'Demo mingguan & evaluasi kinerja tim',
                    'Dukungan langsung via grup chat WhatsApp / Slack'
                ],
                support: {
                    free: 'Included',
                    description: 'Dedicated priority squad support'
                },
                ctaText: 'PILIH TIM EMBED'
            },
            {
                id: 'webapp_retainer',
                serviceId: 'webapp',
                modelId: 'retainer',
                categoryTag: 'ENTERPRISE / SLA',
                modelTag: 'Retainer',
                title: 'Retainer (Enterprise SLA)',
                shortDesc: 'SLA formal ketersediaan, monitoring kuota Google Cloud, & incident response cepat.',
                badge: 'Enterprise SLA',
                isPopular: false,
                color: 'purple',
                pricing: 'Custom SLA',
                pricingSubtext: '/ bulan',
                timeline: 'SLA Formal',
                scopeType: 'Kontrak fleksibel',
                features: [
                    'SLA Response Time < 30 menit untuk kendala sistem',
                    'Monitoring Quota & Execution Time Google Workspace',
                    'Perbaikan bug & maintenance preventif berkala',
                    'Dedicated Solutions Architect & Security Audit',
                    'Laporan utilisasi & performa Web App bulanan'
                ],
                support: {
                    free: 'SLA 99.9%',
                    description: 'Incident response < 30 menit'
                },
                ctaText: 'PILIH RETAINER'
            }
        ]
    },
    {
        id: 'fullstack',
        name: 'Full Stack Development',
        badge: 'Enterprise & Modern Cloud',
        lordicon: 'https://cdn.lordicon.com/lupuorrc.json',
        lordiconColor: 'primary:#9333ea,secondary:#c084fc',
        color: 'purple',
        desc: 'Website & aplikasi web kustom full-featured ditenagai Next.js, Supabase, & arsitektur cloud modern',
        tiers: [
            {
                id: 'fullstack_proyek',
                serviceId: 'fullstack',
                modelId: 'proyek',
                categoryTag: 'SPRINT / FIXED SCOPE',
                modelTag: 'Model Proyek',
                title: 'Model Proyek (Fixed Scope)',
                shortDesc: 'Pengembangan MVP SaaS, website perusahaan, atau aplikasi kustom berarsitektur modern sekali jalan.',
                badge: 'Mulai Rp 5M',
                isPopular: false,
                color: 'orange',
                pricing: 'Rp 5jt - 25jt',
                pricingSubtext: '/ project',
                timeline: '4-8 minggu',
                scopeType: 'Fixed Scope',
                features: [
                    'Modern Stack (Next.js, React, Supabase, PostgreSQL)',
                    'Admin Dashboard lengkap, User Auth, & Role Management',
                    'Integrasi Payment Gateway (Midtrans, QRIS, Xendit)',
                    'SEO Optimized, Mobile Responsive, & Ultra Fast',
                    'Deployment Cloud (Vercel, Cloudflare, VPS) + SSL',
                    'Full source code repository & API documentation'
                ],
                support: {
                    free: '3 Bulan',
                    description: 'Free support & bug fixes 3 bulan'
                },
                ctaText: 'PILIH MODEL PROYEK'
            },
            {
                id: 'fullstack_tim-embed',
                serviceId: 'fullstack',
                modelId: 'tim-embed',
                categoryTag: 'SQUAD / DEDICATED',
                modelTag: 'Tim Embed',
                title: 'Tim Embed (Dedicated Squad)',
                shortDesc: 'Squad pengembang dedicated (Tech Lead, Full Stack Dev, UI/UX) melekat langsung di tim Anda.',
                badge: 'PALING DIMINTA',
                isPopular: true,
                color: 'blue',
                pricing: 'Rp 17.5jt',
                pricingSubtext: '/ bulan',
                timeline: 'Dedicated Squad',
                scopeType: 'Min. 1 bulan',
                features: [
                    'Squad dedicated 3-5 role (Full Stack Dev, UI/UX, QA, PM)',
                    'Sprint 2-mingguan dengan grooming & standup reguler',
                    'Arsitektur cloud scalable (CI/CD, Staging, Production)',
                    'Akses penuh repo Git, Jira/Trello, & kanal komunikasi',
                    'Standar code review ketat & pengujian otomatis',
                    'Retrospektif & evaluasi kualitas kerja bulanan'
                ],
                support: {
                    free: 'Included',
                    description: 'Dedicated priority fullstack squad'
                },
                ctaText: 'PILIH TIM EMBED'
            },
            {
                id: 'fullstack_retainer',
                serviceId: 'fullstack',
                modelId: 'retainer',
                categoryTag: 'ENTERPRISE / SLA',
                modelTag: 'Retainer',
                title: 'Retainer (Enterprise SLA)',
                shortDesc: 'Dukungan pemeliharaan sistem 24/7, DevOps, & SLA ketersediaan tinggi untuk aplikasi bisnis kritis.',
                badge: 'Enterprise SLA',
                isPopular: false,
                color: 'purple',
                pricing: 'Custom SLA',
                pricingSubtext: '/ bulan',
                timeline: 'SLA 99.9%+',
                scopeType: 'Kontrak fleksibel',
                features: [
                    'SLA Tertulis dengan jaminan penalti downtime',
                    'Tim On-Call 24/7 untuk incident response & emergency fix',
                    'DevOps, database optimization, & patch keamanan berkala',
                    'Automated backup, failover & disaster recovery plan',
                    'Dedicated Solutions Architect & Compliance Review'
                ],
                support: {
                    free: '24/7 SLA',
                    description: 'Zero downtime commitment & 24/7 support'
                },
                ctaText: 'PILIH RETAINER'
            }
        ]
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
    { q: 'Apakah bisa revisi setelah project selesai?', a: 'Ya! Kami memberikan garansi revisi & bug fixes. Model Proyek mendapatkan garansi bug fix gratis hingga 1 tahun penuh.' },
    { q: 'Berapa lama waktu pengerjaan?', a: 'Model Proyek: 1-4 minggu (tergantung scope). Tim Embed: fleksibel bulanan dengan dedicated squad. Retainer: dukungan berkelanjutan dengan SLA formal.' },
    { q: 'Apakah saya mendapat source code?', a: 'Ya! Anda mendapat full ownership source code, spreadsheet, repository, dan dokumentasi lengkap untuk semua model kerjasama.' },
    { q: 'Bagaimana sistem pembayarannya?', a: 'Untuk Proyek: DP 50% di awal dan 50% setelah delivery. Untuk Tim Embed & Retainer: billing bulanan transparan di awal periode.' },
    { q: 'Apakah ada maintenance fee?', a: 'Model Proyek sudah mencakup garansi support gratis 1 tahun. Untuk penanganan sistem kritis & SLA 24/7, Anda dapat memilih paket Retainer.' },
    { q: 'Apakah bisa integrasi dengan sistem existing?', a: 'Sangat bisa! Tim kami berpengalaman mengintegrasikan Google Workspace, API 3rd party, payment gateway, maupun database internal Anda.' }
]

export default function JasaKustomPage() {
    const [activeCategory, setActiveCategory] = useState<'sheets' | 'webapp' | 'fullstack'>('sheets')
    const [serviceType, setServiceType] = useState('sheets')
    const [selectedModel, setSelectedModel] = useState<'proyek' | 'tim-embed' | 'retainer'>('proyek')
    const [formMode, setFormMode] = useState<'bot' | 'classic'>('bot')
    const [isChatModalOpen, setIsChatModalOpen] = useState(false)
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
            const payloadService = serviceType === 'consultation' ? 'consultation' : `${serviceType}_${selectedModel}`
            const res = await fetch('/api/template-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone') || null,
                    company: formData.get('company') || null,
                    serviceType: payloadService,
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
                setSelectedModel('proyek')
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
                            {serviceCategories.map((cat, idx) => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={heroInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                                    onClick={() => {
                                        setActiveCategory(cat.id)
                                        setServiceType(cat.id)
                                        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
                                    }}
                                    className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 bg-white shadow-md ${cat.color === 'orange' ? 'border-2 border-orange-200 hover:shadow-xl hover:shadow-orange-200/50 hover:border-orange-400' :
                                        cat.color === 'blue' ? 'border-2 border-blue-200 hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-400' :
                                            'border-2 border-purple-200 hover:shadow-xl hover:shadow-purple-200/50 hover:border-purple-400'
                                        } group`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-transform duration-300 group-hover:scale-110 shadow-sm ${cat.color === 'orange' ? 'bg-orange-100/80' :
                                        cat.color === 'blue' ? 'bg-blue-100/80' :
                                            'bg-purple-100/80'
                                        }`}>
                                        <ClientLordIcon
                                            src={cat.lordicon}
                                            trigger="hover"
                                            colors={cat.lordiconColor}
                                            style={{ width: '36px', height: '36px' }}
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">{cat.name}</h3>
                                    <p className="text-xs text-gray-500 mb-4 text-center">{cat.desc}</p>
                                    <div className="text-center">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${cat.color === 'orange' ? 'bg-orange-500 text-white' :
                                            cat.color === 'blue' ? 'bg-blue-500 text-white' :
                                                'bg-purple-500 text-white'
                                            }`}>
                                            3 Model Kerjasama
                                        </span>
                                    </div>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Detail - Skynet Style Pricing Cards */}
            <section id="services" ref={servicesRef} className="py-8 md:py-16 relative">
                <div className="container mx-auto px-6 relative z-10">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                        className="text-center mb-16"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-100 px-3 py-1 rounded-md inline-block mb-3">
                            Transparan & Fleksibel
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="inline-block text-gray-900"
                            >
                                Pilihan Paket{' '}
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={servicesInView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500"
                            >
                                Jasa Kustom
                            </motion.span>
                        </h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={servicesInView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-lg text-gray-600 max-w-2xl mx-auto"
                        >
                            Pilih model pengembangan yang paling pas untuk skala bisnis & kebutuhan digital Anda
                        </motion.p>
                    </motion.div>

                    {/* Category Selector Tabs - Clean & Simple Square Cards */}
                    <div className="max-w-4xl mx-auto mb-6 px-1 sm:px-4">
                        <div className="grid grid-cols-3 gap-2 sm:gap-3.5 p-1.5 sm:p-2 rounded-2xl md:rounded-3xl bg-slate-100/90 border border-slate-200 shadow-inner backdrop-blur-md">
                            {serviceCategories.map((cat) => {
                                const isActive = activeCategory === cat.id

                                const activeBorder =
                                    cat.color === 'orange'
                                        ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-orange-500/10'
                                        : cat.color === 'blue'
                                            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10'
                                            : 'border-purple-500 ring-2 ring-purple-500/20 shadow-purple-500/10'

                                const pillBg =
                                    cat.color === 'orange' ? 'bg-orange-500' : cat.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'

                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveCategory(cat.id)
                                            setServiceType(cat.id)
                                        }}
                                        className={`relative group flex flex-col items-center justify-center p-2.5 xs:p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer text-center aspect-[1/0.95] xs:aspect-[1/0.85] sm:aspect-auto sm:min-h-[105px] bg-white ${isActive
                                            ? `${activeBorder} scale-[1.02] z-10 font-extrabold shadow-md border-2`
                                            : 'text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-sm hover:border-slate-300 hover:bg-slate-50/50'
                                            }`}
                                    >
                                        {/* Active Pill Glow Indicator */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeCategoryIndicator"
                                                className={`absolute -top-1 w-6 sm:w-10 h-1 rounded-full ${pillBg} shadow-sm`}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}

                                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-1.5 transition-transform duration-300 group-hover:scale-110 ${isActive
                                            ? cat.color === 'orange' ? 'bg-orange-50 border border-orange-200' : cat.color === 'blue' ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'
                                            : cat.color === 'orange' ? 'bg-orange-50/60' : cat.color === 'blue' ? 'bg-blue-50/60' : 'bg-purple-50/60'
                                            }`}>
                                            <ClientLordIcon
                                                src={cat.lordicon}
                                                trigger="hover"
                                                colors={cat.lordiconColor}
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        </div>

                                        <span className={`block sm:hidden text-[11px] xs:text-xs leading-tight tracking-tight ${isActive ? 'text-slate-900 font-extrabold' : 'text-slate-600 font-bold'}`}>
                                            {cat.id === 'sheets' ? 'Google Sheets' : cat.id === 'webapp' ? 'Google Web Apps' : 'Full Stack'}
                                        </span>
                                        <span className={`hidden sm:block text-sm md:text-base leading-tight tracking-tight ${isActive ? 'text-slate-900 font-extrabold' : 'text-slate-600 font-bold'}`}>
                                            {cat.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Model Kerjasama Segmented Control Button (Mobile Only) */}
                    <div className="max-w-xl mx-auto mb-8 px-2 md:hidden">
                        <div className="p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200 shadow-inner grid grid-cols-3 gap-1">
                            {[
                                { id: 'proyek', label: 'Model Proyek', badge: null },
                                { id: 'tim-embed', label: 'Tim Embed', badge: 'Populer' },
                                { id: 'retainer', label: 'Retainer', badge: null },
                            ].map((model) => {
                                const isModelActive = selectedModel === model.id
                                return (
                                    <button
                                        key={model.id}
                                        onClick={() => setSelectedModel(model.id as any)}
                                        className={`relative py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${isModelActive
                                            ? 'bg-white text-slate-900 shadow-md border border-slate-200/80 scale-[1.01] z-10'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                                            }`}
                                    >
                                        {isModelActive && (
                                            <motion.div
                                                layoutId="activeModelSegment"
                                                className="absolute inset-0 rounded-xl bg-white shadow-md border border-slate-200/80 -z-10"
                                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                            />
                                        )}
                                        <span className="leading-tight">{model.label}</span>
                                        {model.badge && (
                                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-tight ${isModelActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'
                                                }`}>
                                                {model.badge}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Skynet-Inspired Service Cards Grid / Mobile Single Card View */}
                    {(() => {
                        const currentCategory = serviceCategories.find(c => c.id === activeCategory) || serviceCategories[0]
                        const activeTiers = currentCategory.tiers.filter(t => t.modelId === selectedModel)
                        const mobileTier = activeTiers.length > 0 ? activeTiers[0] : currentCategory.tiers[0]

                        const renderTierCard = (tier: typeof currentCategory.tiers[0], isSelectedTier: boolean) => (
                            <div className={`relative flex flex-col h-full bg-white rounded-3xl transition-all duration-300 hover:shadow-2xl overflow-hidden border-2 ${isSelectedTier
                                ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-xl shadow-orange-500/10'
                                : 'border-gray-200 hover:border-gray-300 shadow-lg'
                                }`}>
                                {/* Popular Banner Header */}
                                {tier.isPopular && (
                                    <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-1.5 px-4 text-center text-xs font-black text-white tracking-widest uppercase">
                                        ★ {tier.badge} ★
                                    </div>
                                )}

                                {/* Card Header Top Bar */}
                                <div className="p-6 md:p-8 flex-1 flex flex-col">
                                    {/* Category Tag & Lordicon */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-xs font-bold tracking-widest text-gray-400 uppercase">
                                                {tier.categoryTag}
                                            </span>
                                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${tier.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                tier.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-purple-100 text-purple-700'
                                                }`}>
                                                {tier.modelTag}
                                            </span>
                                        </div>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-inner ${tier.color === 'orange' ? 'bg-orange-50' :
                                            tier.color === 'blue' ? 'bg-blue-50' :
                                                'bg-purple-50'
                                            }`}>
                                            <ClientLordIcon
                                                src={currentCategory.lordicon}
                                                trigger="hover"
                                                colors={currentCategory.lordiconColor}
                                                style={{ width: '36px', height: '36px' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Title & Short Description */}
                                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3">{tier.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6 min-h-[48px]">
                                        {tier.shortDesc}
                                    </p>

                                    {/* Price Section */}
                                    <div className="mb-6 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs text-gray-500 font-medium">Estimasi:</span>
                                            <span className="text-3xl font-black text-gray-900 tracking-tight">{tier.pricing}</span>
                                            <span className="text-xs text-gray-500 font-medium">{tier.pricingSubtext}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-gray-900 text-white">
                                                <Clock className="w-3 h-3 text-orange-400" />
                                                {tier.timeline}
                                            </span>
                                            <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-gray-200 text-gray-700">
                                                {tier.scopeType}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Scope & Deliverables Checklist */}
                                    <div className="space-y-3 mb-8 flex-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Scope & Deliverables</p>
                                        {tier.features.map((feature, fIdx) => (
                                            <div key={fIdx} className="flex items-start gap-2.5 text-sm text-gray-700 py-1.5 border-b border-gray-100 last:border-0">
                                                <span className={`font-mono font-bold text-base leading-none ${tier.color === 'orange' ? 'text-orange-500' :
                                                    tier.color === 'blue' ? 'text-blue-500' :
                                                        'text-purple-500'
                                                    }`}>+</span>
                                                <span className="leading-snug">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Free Support SLA Badge */}
                                    <div className={`flex items-center gap-3 p-3.5 rounded-xl mb-6 border ${tier.color === 'orange' ? 'bg-orange-50/60 border-orange-200/60 text-orange-950' :
                                        tier.color === 'blue' ? 'bg-blue-50/60 border-blue-200/60 text-blue-950' :
                                            'bg-purple-50/60 border-purple-200/60 text-purple-950'
                                        }`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tier.color === 'orange' ? 'bg-orange-100' :
                                            tier.color === 'blue' ? 'bg-blue-100' :
                                                'bg-purple-100'
                                            }`}>
                                            <ClientLordIcon
                                                src="https://cdn.lordicon.com/ssvybplt.json"
                                                trigger="hover"
                                                colors={
                                                    tier.color === 'orange' ? 'primary:#ea580c,secondary:#fbbf24' :
                                                        tier.color === 'blue' ? 'primary:#2563eb,secondary:#06b6d4' :
                                                            'primary:#9333ea,secondary:#ec4899'
                                                }
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                        </div>
                                        <div className="text-xs">
                                            <span className="font-bold block">Support: {tier.support.free}</span>
                                            <span className="text-gray-500">{tier.support.description}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => {
                                            setServiceType(tier.serviceId)
                                            setSelectedModel(tier.modelId)
                                            setIsChatModalOpen(true)
                                        }}
                                        className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${tier.isPopular
                                            ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02]'
                                            : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:scale-[1.01]'
                                            }`}
                                    >
                                        <span>{tier.ctaText}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )

                        return (
                            <div className="max-w-7xl mx-auto">
                                {/* Mobile View: Single Compact Card for Selected Model */}
                                <div className="block md:hidden max-w-md mx-auto">
                                    <motion.div
                                        key={`${activeCategory}-${mobileTier.id}`}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {renderTierCard(mobileTier, true)}
                                    </motion.div>
                                </div>

                                {/* Desktop View: 3 Columns Grid with Selected Model Highlighted */}
                                <div className="hidden md:grid md:grid-cols-3 gap-8 items-stretch">
                                    {currentCategory.tiers.map((tier, idx) => {
                                        const isSelectedTier = tier.modelId === selectedModel
                                        return (
                                            <motion.div
                                                key={tier.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                                                transition={{ duration: 0.5, delay: 0.1 * idx }}
                                                onClick={() => setSelectedModel(tier.modelId)}
                                                className={`flex flex-col group cursor-pointer transition-all duration-300 ${isSelectedTier ? 'scale-[1.02] z-10' : 'opacity-90 hover:opacity-100'}`}
                                            >
                                                {renderTierCard(tier, isSelectedTier)}
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })()}

                    {/* Bottom Guarantee Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.6 }}
                        className="mt-14 max-w-4xl mx-auto bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0">
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/fdxqrdfe.json"
                                    trigger="loop"
                                    delay="2000"
                                    colors="primary:#f97316,secondary:#fbbf24"
                                    style={{ width: '32px', height: '32px' }}
                                />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Butuh Kustomisasi Spesifik atau Konsultasi Dulu?</h4>
                                <p className="text-sm text-gray-300">Tim pengembang RSQUARE siap bantu memetakan kebutuhan & solusi biaya paling efisien.</p>
                            </div>
                        </div>
                        <button
                            onClick={scrollToForm}
                            className="flex-shrink-0 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Konsultasi Gratis
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Portfolio Section */}
            {portfolio.length > 0 && (
                <section ref={portfolioRef} className="py-8 md:py-12 relative">
                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="inline-block text-gray-900"
                                >
                                    Portfolio{' '}
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500"
                                >
                                    Custom Project
                                </motion.span>
                            </h2>
                            <motion.p
                                initial={{ opacity: 0, filter: "blur(5px)" }}
                                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="text-lg text-gray-600"
                            >
                                Hasil karya kami untuk berbagai klien
                            </motion.p>
                        </motion.div>

                        <PortfolioCardStack projects={portfolio} />

                        {portfolio.length > 6 && (
                            <motion.div
                                className="text-center mt-10"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
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
            <section ref={processRef} className="py-8 md:py-12 relative overflow-hidden">
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
                                                className={`w-20 h-20 rounded-2xl bg-white shadow-xl border-2 flex items-center justify-center mx-auto relative overflow-hidden ${idx === 0 ? 'border-orange-300' :
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
                                                    className={`absolute inset-0 opacity-20 ${idx === 0 ? 'bg-orange-400' :
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
                                                className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${idx === 0 ? 'bg-orange-500' :
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
                                                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${idx === 0 ? 'bg-orange-100 text-orange-600' :
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
                                        className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${idx === 0 ? 'bg-orange-100' :
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
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${idx === 0 ? 'bg-orange-500' :
                                                idx === 1 ? 'bg-amber-500' :
                                                    idx === 2 ? 'bg-pink-500' :
                                                        idx === 3 ? 'bg-purple-500' :
                                                            'bg-green-500'
                                                }`}>{step.number}</span>
                                            <h4 className="font-bold text-gray-900">{step.title}</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{step.desc}</p>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${idx === 0 ? 'bg-orange-100 text-orange-600' :
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
                <section ref={testimonialsRef} className="py-8 md:py-12 relative">
                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="inline-block text-gray-900"
                                >
                                    Apa Kata{' '}
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                                    whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500"
                                >
                                    Klien Kami
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="inline-block text-gray-900"
                                >
                                    ?
                                </motion.span>
                            </h2>
                            <motion.p
                                initial={{ opacity: 0, filter: "blur(5px)" }}
                                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                                viewport={{ once: true }}
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
                                    whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + idx * 0.15, type: "spring" }}
                                    className="h-full"
                                >
                                    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200 hover:shadow-xl hover:border-orange-200 hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 h-full">
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                    viewport={{ once: true }}
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
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}



            {/* FAQ */}
            <section ref={faqRef} className="py-8 md:py-12 relative">
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
            <section id="request-form" ref={formRef} className="py-8 md:py-12 relative overflow-hidden">
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
                        <div className="text-center mb-6">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2 flex-wrap">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={formInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="text-gray-900"
                                >
                                    Siap Mulai
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={formInView ? { opacity: 1, scale: 1 } : {}}
                                    transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500"
                                >
                                    Project Anda?
                                </motion.span>
                            </h2>
                            <motion.p
                                initial={{ opacity: 0, filter: "blur(5px)" }}
                                animate={formInView ? { opacity: 1, filter: "blur(0px)" } : {}}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="text-base md:text-lg text-gray-600"
                            >
                                Konsultasikan kebutuhan Anda secara interaktif atau gunakan form standar
                            </motion.p>
                        </div>

                        {/* Primary Interactive Chat Bot Form Trigger - Clean & Simple */}
                        {formMode === 'bot' ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={formInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-3xl p-8 md:p-10 border border-gray-200/90 shadow-xl shadow-gray-200/50 text-center max-w-xl mx-auto relative overflow-hidden group hover:border-orange-300 transition-all duration-300"
                            >
                                {/* Subtle background glow */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                                <div className="relative z-10 space-y-5">
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-600 text-xs font-extrabold uppercase tracking-wide">
                                        <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                                        <span>Interactive Assistant</span>
                                    </div>

                                    <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                                        Diskusi & Konsultasi Project
                                    </h3>

                                    <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                                        Mulai sesi percakapan interaktif dengan RSQUARE Assistant Bot untuk pemetaan fitur, estimasi budget, dan jadwal pengerjaan.
                                    </p>

                                    <div className="pt-2">
                                        <motion.button
                                            onClick={() => setIsChatModalOpen(true)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold text-base rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-3 transition-all mx-auto group active:scale-[0.98]"
                                        >
                                            <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                                            <span>Mulai Chat Diskusi (Interactive)</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 md:p-10"
                                initial={{ opacity: 0, y: 30 }}
                                animate={formInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.4 }}
                            >
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Service Selection Step 1: Core Service */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
                                                1. Pilih Layanan Utama
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                                                {[
                                                    { id: 'sheets', label: 'Google Sheets', lordicon: 'https://cdn.lordicon.com/wloilxuq.json' },
                                                    { id: 'webapp', label: 'Google Web Apps', lordicon: 'https://cdn.lordicon.com/gqdnbnwt.json' },
                                                    { id: 'fullstack', label: 'Full Stack', lordicon: 'https://cdn.lordicon.com/lupuorrc.json' },
                                                    { id: 'consultation', label: 'Konsultasi Gratis', lordicon: 'https://cdn.lordicon.com/fdxqrdfe.json' }
                                                ].map((opt) => (
                                                    <motion.button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => setServiceType(opt.id)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${serviceType === opt.id
                                                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                                                            : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                                                            }`}
                                                    >
                                                        <ClientLordIcon
                                                            src={opt.lordicon}
                                                            trigger="hover"
                                                            colors={serviceType === opt.id ? 'primary:#ea580c,secondary:#fbbf24' : 'primary:#6b7280,secondary:#9ca3af'}
                                                            style={{ width: '24px', height: '24px' }}
                                                        />
                                                        <span className="font-bold text-xs mt-1 text-center">{opt.label}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Service Selection Step 2: Model Kerjasama */}
                                        {serviceType !== 'consultation' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-800 mb-2.5">
                                                    2. Pilih Model Kerjasama
                                                </label>
                                                <div className="grid grid-cols-3 gap-2.5">
                                                    {[
                                                        { id: 'proyek', label: 'Model Proyek', desc: 'Fixed Scope' },
                                                        { id: 'tim-embed', label: 'Tim Embed', desc: 'Dedicated Squad' },
                                                        { id: 'retainer', label: 'Retainer', desc: 'Enterprise SLA' }
                                                    ].map((m) => (
                                                        <button
                                                            key={m.id}
                                                            type="button"
                                                            onClick={() => setSelectedModel(m.id as any)}
                                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all ${selectedModel === m.id
                                                                ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm font-bold'
                                                                : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white font-medium'
                                                                }`}
                                                        >
                                                            <span className="text-xs md:text-sm">{m.label}</span>
                                                            <span className="text-[10px] text-gray-500 font-normal">{m.desc}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
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
                        )}

                        {/* Option to switch to classic form */}
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => setFormMode(formMode === 'bot' ? 'classic' : 'bot')}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-orange-600 underline transition-colors"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                <span>{formMode === 'bot' ? 'Lebih suka form biasa? Klik di sini untuk tampilan form standar' : 'Kembali ke Mode Interactive Chat Bot'}</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Chat Bot Modal */}
            <ChatBotModal
                isOpen={isChatModalOpen}
                onClose={() => setIsChatModalOpen(false)}
                initialServiceType={serviceType}
                initialModel={selectedModel}
            />

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
                            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${dialog.type === 'success' ? 'bg-green-100' : 'bg-red-100'
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
