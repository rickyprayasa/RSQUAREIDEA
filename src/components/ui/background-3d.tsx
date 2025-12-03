'use client'

import { motion } from 'framer-motion'

export function Background3D() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Gradient Mesh */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-50/50 to-white/20" />

            {/* Floating 3D Cube 1 */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotateX: [0, 10, 0],
                    rotateY: [0, 30, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-20 left-[10%] w-24 h-24 opacity-20"
                style={{ perspective: '1000px' }}
            >
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-xl transform rotate-45 shadow-2xl" />
            </motion.div>

            {/* Floating 3D Sphere */}
            <motion.div
                animate={{
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute top-40 right-[15%] w-32 h-32 rounded-full bg-gradient-to-tr from-blue-400/30 to-purple-500/30 blur-2xl"
            />

            {/* Floating 3D Cube 2 */}
            <motion.div
                animate={{
                    y: [0, -30, 0],
                    rotate: [0, -10, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute bottom-20 left-[20%] w-40 h-40 opacity-10"
            >
                <div className="w-full h-full border-4 border-orange-300 rounded-3xl transform -rotate-12" />
            </motion.div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
    )
}
