'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquareHeart, Star, Send } from 'lucide-react'

const templates = [
    'Personal Budgeting',
    'Perencanaan Anggaran Acara',
    'Goal Planner',
    'Tracking Lamaran Kerja',
    'Invoice Maker',
    'My To-Do List',
    'Content Calendar',
]

export default function FeedbackPage() {
    const [rating, setRating] = useState(5)

    return (
        <main className="min-h-screen relative">
            {/* Global Grid Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>

            {/* Hero Header */}
            <section className="relative py-16 md:py-20 overflow-hidden">
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-2xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600 ring-1 ring-inset ring-orange-200 mb-6">
                                <MessageSquareHeart className="w-4 h-4 mr-2" />
                                Masukan & Testimoni
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                                Bantu Kami{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                                    Berkembang
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Kami sangat menghargai waktu Kamu untuk membantu kami berkembang. Setiap masukan sangat berharga!
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-10">
                            <form className="space-y-8">
                                {/* Template Selection */}
                                <div>
                                    <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                                        Template RSQUARE mana yang Kamu gunakan?
                                    </label>
                                    <select
                                        id="template"
                                        name="template"
                                        required
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                    >
                                        <option value="">-- Pilih Template --</option>
                                        {templates.map((template) => (
                                            <option key={template} value={template}>{template}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Secara keseluruhan, seberapa puas kah Kamu?
                                    </label>
                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
                                        <span className="text-sm text-gray-500">Tidak Puas</span>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setRating(value)}
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold transition-all ${
                                                        rating === value
                                                            ? 'bg-orange-500 text-white shadow-md'
                                                            : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-orange-300'
                                                    }`}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">Sangat Puas</span>
                                    </div>
                                    <input type="hidden" name="rating" value={rating} />
                                </div>

                                {/* What do you like */}
                                <div>
                                    <label htmlFor="likes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Apa yang paling Kamu sukai dari template ini?
                                    </label>
                                    <textarea
                                        id="likes"
                                        name="likes"
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                                        placeholder="Ceritakan pengalaman positif Kamu..."
                                    />
                                </div>

                                {/* What needs improvement */}
                                <div>
                                    <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
                                        Adakah bagian yang bisa kami tingkatkan?
                                    </label>
                                    <textarea
                                        id="improvements"
                                        name="improvements"
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                                        placeholder="Berikan saran untuk perbaikan..."
                                    />
                                </div>

                                {/* Testimonial Permission */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Bolehkah kami mengutip masukan Kamu sebagai testimoni?
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <label className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 transition-colors">
                                            <input
                                                type="radio"
                                                name="permission"
                                                value="yes"
                                                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                                            />
                                            <span className="ml-3 text-gray-700">Ya, tentu saja!</span>
                                        </label>
                                        <label className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 transition-colors">
                                            <input
                                                type="radio"
                                                name="permission"
                                                value="no"
                                                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                                            />
                                            <span className="ml-3 text-gray-700">Tidak, terima kasih.</span>
                                        </label>
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full h-14 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg shadow-lg shadow-orange-200/50 flex items-center justify-center gap-2 group relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Send className="w-5 h-5" />
                                        Kirim Masukan
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}
