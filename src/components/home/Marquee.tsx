'use client'

import { motion } from 'framer-motion'
import { 
    BarChart3, 
    Calculator, 
    Calendar, 
    ClipboardList, 
    CreditCard, 
    FileSpreadsheet, 
    PieChart, 
    Receipt, 
    Target, 
    TrendingUp,
    Wallet,
    LineChart,
    ListTodo,
    BookOpen,
    Users
} from 'lucide-react'

const marqueeItems = [
    { icon: Wallet, label: 'Personal Budgeting', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Calculator, label: 'Kalkulator Pajak', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Calendar, label: 'Content Calendar', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: Receipt, label: 'Invoice Maker', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Target, label: 'Goal Planner', color: 'text-pink-500', bg: 'bg-pink-50' },
    { icon: ClipboardList, label: 'Tracking Lamaran', color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { icon: TrendingUp, label: 'Sales Tracker', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: PieChart, label: 'Budget Acara', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: FileSpreadsheet, label: 'Laporan Keuangan', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { icon: BarChart3, label: 'Dashboard Bisnis', color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: CreditCard, label: 'Expense Tracker', color: 'text-teal-500', bg: 'bg-teal-50' },
    { icon: LineChart, label: 'Investment Portfolio', color: 'text-violet-500', bg: 'bg-violet-50' },
    { icon: ListTodo, label: 'To-Do List', color: 'text-sky-500', bg: 'bg-sky-50' },
    { icon: BookOpen, label: 'Inventory Manager', color: 'text-lime-500', bg: 'bg-lime-50' },
    { icon: Users, label: 'HR Management', color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
]

function MarqueeRow({ direction = 'left' }: { direction?: 'left' | 'right' }) {
    const items = [...marqueeItems, ...marqueeItems]
    
    return (
        <div className="flex overflow-hidden">
            <div 
                className={`flex gap-4 py-4 ${direction === 'right' ? 'animate-marquee-reverse' : 'animate-marquee'}`}
            >
                {items.map((item, index) => (
                    <div
                        key={`${item.label}-${index}`}
                        className="flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300">
                            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center transition-transform duration-300 hover:scale-110`}>
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 whitespace-nowrap hover:text-gray-900 transition-colors">
                                {item.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <div 
                className={`flex gap-4 py-4 ${direction === 'right' ? 'animate-marquee-reverse' : 'animate-marquee'}`}
                aria-hidden="true"
            >
                {items.map((item, index) => (
                    <div
                        key={`${item.label}-duplicate-${index}`}
                        className="flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300">
                            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center transition-transform duration-300 hover:scale-110`}>
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 whitespace-nowrap hover:text-gray-900 transition-colors">
                                {item.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function Marquee() {
    return (
        <section className="relative py-16 overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>
            <div className="container mx-auto px-6 mb-10">
                <div className="text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm font-medium text-orange-600 mb-2"
                    >
                        Template Populer
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl md:text-3xl font-bold text-gray-900"
                    >
                        Berbagai Template untuk Semua Kebutuhan
                    </motion.h2>
                </div>
            </div>

            <div className="relative">
                {/* Gradient overlays */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

                {/* Row 1 - Left */}
                <MarqueeRow direction="left" />

                {/* Row 2 - Right */}
                <div className="mt-2">
                    <MarqueeRow direction="right" />
                </div>
            </div>


        </section>
    )
}
