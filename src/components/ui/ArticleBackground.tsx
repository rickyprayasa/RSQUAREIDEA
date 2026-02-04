'use client'

import { motion } from 'framer-motion'
import { BookOpen, PenTool, FileText, Feather, Search } from 'lucide-react'

export function ArticleBackground() {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
            {/* Base gradient specific for reading */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />

            {/* Standard Line Grid (matching GlobalBackground) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Floating Book - Top Right */}
            <motion.div
                className="absolute top-24 right-[10%] opacity-10 md:opacity-15 text-orange-400"
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
                <BookOpen className="w-16 h-16 md:w-24 md:h-24" strokeWidth={1} />
            </motion.div>

            {/* Floating Blur Circle - Top Left */}
            <motion.div
                className="absolute top-40 left-[8%] w-20 md:w-28 h-20 md:h-28 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-500/10 blur-xl"
                animate={{ y: [0, 25, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            {/* Floating Document - Mid Right */}
            <motion.div
                className="absolute top-[45%] right-[8%] opacity-10 md:opacity-15 text-amber-500"
                animate={{ y: [0, -18, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
                <FileText className="w-14 h-14 md:w-20 md:h-20" strokeWidth={1} />
            </motion.div>

            {/* Floating Pen - Mid Left */}
            <motion.div
                className="absolute top-1/2 left-[5%] opacity-10 md:opacity-15 text-orange-500"
                animate={{ y: [0, -20, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            >
                <PenTool className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1} />
            </motion.div>

            {/* Floating Search - Bottom Right */}
            <motion.div
                className="absolute bottom-40 right-[15%] opacity-10 md:opacity-15 text-amber-400"
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
                <Search className="w-10 h-10 md:w-14 md:h-14" strokeWidth={1.5} />
            </motion.div>

            {/* Floating Blur Circle - Bottom Left */}
            <motion.div
                className="absolute bottom-32 left-[12%] w-16 md:w-24 h-16 md:h-24 rounded-full bg-gradient-to-br from-orange-400/10 to-amber-500/10 blur-xl"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
        </div>
    )
}
