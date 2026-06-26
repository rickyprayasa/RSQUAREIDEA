'use client'

import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'

export default function WorkspaceSettingsPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pengaturan Workspace</h1>
            <p className="text-gray-500 mt-1">Konfigurasi preferensi ruang kerja Project Management Anda.</p>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mt-8"
            >
                <div className="inline-flex h-20 w-20 bg-gray-50 rounded-full items-center justify-center mb-4 border border-dashed border-gray-300">
                    <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Segera Hadir</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    Pengaturan modul Project Management (seperti kustomisasi status Kanban) sedang dalam tahap pengembangan.
                </p>
            </motion.div>
        </div>
    )
}
