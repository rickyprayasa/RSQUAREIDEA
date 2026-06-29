'use client'

import React from 'react'
import { FileText, ClipboardList, PenTool, CheckCircle2, ChevronRight, AlertTriangle, Play, FileCheck } from 'lucide-react'

export default function ProjectSOP({ project, onNavigate }: { project: any, onNavigate: (tab: 'board' | 'documents' | 'settings') => void }) {
    
    return (
        <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar pb-24">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <ClipboardList className="h-6 w-6 text-orange-500" />
                    Alur Kerja (SOP) Project Management
                </h2>
                <p className="text-gray-600">Panduan langkah demi langkah untuk menyelesaikan proyek sesuai standar RSQUARE.</p>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[28px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                
                {/* Phase 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Fase 1</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Inisiasi & Discovery</h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Lakukan *meeting* awal dengan klien untuk menggali kebutuhan spesifik. Setelah itu, buat <strong>Product Requirements Document (PRD)</strong> sebagai acuan *developer*.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => onNavigate('documents')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                            >
                                <Play className="h-3.5 w-3.5" /> Buat / Buka PRD
                            </button>
                        </div>
                    </div>
                </div>

                {/* Phase 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-white bg-amber-100 text-amber-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <PenTool className="h-6 w-6" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Fase 2</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Penawaran & Kontrak</h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Buat <strong>Proposal Penawaran</strong> berdasarkan PRD. Jika klien setuju, segera buat <strong>Kontrak (SOW)</strong> yang mencantumkan batasan revisi dan kewajiban termin pembayaran.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => onNavigate('documents')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors"
                            >
                                <Play className="h-3.5 w-3.5" /> Buat / Buka Proposal
                            </button>
                            <button 
                                onClick={() => onNavigate('documents')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-semibold transition-colors border border-orange-200"
                            >
                                <PenTool className="h-3.5 w-3.5" /> Buka AI SOW Generator
                            </button>
                        </div>
                    </div>
                </div>

                {/* Phase 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Fase 3</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Pembayaran DP & Development</h3>
                        <div className="mb-4 bg-white p-3 rounded-xl border border-indigo-100 flex gap-3 items-start">
                            <AlertTriangle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700 font-medium">Jangan memulai penulisan kode (Development) sebelum klien membayar Down Payment (DP) sebesar 30%-50%.</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Setelah DP dilunasi, pecah PRD menjadi *task-task* kecil dan berikan *update* mingguan agar klien merasa tenang.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => onNavigate('board')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                            >
                                <Play className="h-3.5 w-3.5" /> Kelola Task (Kanban)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Phase 4 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-white bg-emerald-100 text-emerald-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Fase 4</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">UAT, Pelunasan & Handover</h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Lakukan *User Acceptance Testing* (UAT) dan selesaikan revisi maksimal sesuai kontrak. <br/><br/>
                            <strong className="text-emerald-700">Aturan Emas:</strong> Jangan pernah memberikan *Source Code* asli atau meng-online-kan aplikasi ke domain klien sebelum pembayaran LUNAS 100%.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
