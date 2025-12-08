'use client'

import { motion } from 'framer-motion'

export function GlobalBackground() {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20" />
            {/* Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Floating Hexagon - Top Right */}
            <motion.div
                className="absolute top-24 right-[10%] w-10 md:w-16 h-10 md:h-16 opacity-10 md:opacity-15"
                animate={{ y: [0, -20, 0], rotate: [0, 30, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full fill-orange-400">
                    <polygon points="50,5 93,25 93,75 50,95 7,75 7,25" />
                </svg>
            </motion.div>

            {/* Floating Blur Circle - Top Left */}
            <motion.div
                className="absolute top-40 left-[8%] w-20 md:w-28 h-20 md:h-28 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-xl"
                animate={{ y: [0, 25, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            {/* Floating Diamond - Mid Right (hidden on mobile) */}
            <motion.div
                className="absolute top-[45%] right-[8%] w-12 h-12 opacity-0 md:opacity-15"
                animate={{ y: [0, -18, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 rounded-sm transform rotate-45" />
            </motion.div>

            {/* Floating Ring - Mid Left (hidden on mobile) */}
            <motion.div
                className="absolute top-1/2 left-[5%] w-20 h-20 opacity-0 md:opacity-10"
                animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            >
                <div className="w-full h-full border-4 border-amber-400 rounded-full" />
            </motion.div>

            {/* Floating Plus - Bottom Right (hidden on mobile) */}
            <motion.div
                className="absolute bottom-40 right-[15%] w-14 h-14 opacity-0 md:opacity-10"
                animate={{ y: [0, 15, 0], rotate: [0, 90, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full fill-orange-500">
                    <rect x="40" y="10" width="20" height="80" />
                    <rect x="10" y="40" width="80" height="20" />
                </svg>
            </motion.div>

            {/* Floating Blur Circle - Bottom Left */}
            <motion.div
                className="absolute bottom-32 left-[12%] w-16 md:w-24 h-16 md:h-24 rounded-full bg-gradient-to-br from-purple-400/15 to-violet-500/15 blur-xl"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            {/* Large Hexagon - Bottom Right (hidden on mobile) */}
            <motion.div
                className="absolute bottom-[20%] right-[5%] w-20 h-20 opacity-0 md:opacity-10"
                animate={{ y: [0, 18, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full fill-purple-400">
                    <polygon points="50,5 93,25 93,75 50,95 7,75 7,25" />
                </svg>
            </motion.div>

            {/* Floating Triangle - Bottom Left (hidden on mobile) */}
            <motion.div
                className="absolute bottom-[25%] left-[6%] w-14 h-14 opacity-0 md:opacity-10"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-500" fill="none" strokeWidth="6">
                    <polygon points="50,15 90,85 10,85" />
                </svg>
            </motion.div>
        </div>
    )
}
