'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const features = [
  {
    title: 'Desain Intuitif & Estetis',
    description: 'Tampilan visual yang bersih memanjakan mata, membuat pengelolaan data jadi menyenangkan.',
    iconSrc: 'https://cdn.lordicon.com/wloilxuq.json',
    color: 'bg-orange-100',
    iconColor: 'primary:#ea580c,secondary:#fbbf24',
    image: '/images/restorer-pana.png'
  },
  {
    title: 'Langsung Siap Pakai',
    description: 'Hemat puluhan jam. Download, buka, dan langsung gunakan tanpa setup rumit.',
    iconSrc: 'https://cdn.lordicon.com/akqsdstj.json',
    color: 'bg-blue-100',
    iconColor: 'primary:#2563eb,secondary:#60a5fa',
    image: '/images/rocket-pana.png'
  },
  {
    title: 'Otomatisasi Canggih',
    description: 'Ditenagai Google Apps Script untuk fitur ajaib yang tidak bisa dilakukan spreadsheet biasa.',
    iconSrc: 'https://cdn.lordicon.com/nocovwne.json',
    color: 'bg-purple-100',
    iconColor: 'primary:#9333ea,secondary:#c084fc',
    image: '/images/ai-pana.png'
  },
  {
    title: 'Panduan Video Lengkap',
    description: 'Setiap template dilengkapi dengan video tutorial langkah demi langkah agar Kamu tidak bingung.',
    iconSrc: 'https://cdn.lordicon.com/aklfruoc.json',
    color: 'bg-green-100',
    iconColor: 'primary:#16a34a,secondary:#4ade80',
    image: '/images/video-rafiki.png'
  },
]

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Grid Background with Floating Shapes */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Floating Pentagon */}
        <motion.div
          className="absolute top-32 right-[8%] w-16 h-16 opacity-15"
          animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-orange-400">
            <polygon points="50,5 95,35 80,90 20,90 5,35" />
          </svg>
        </motion.div>

        {/* Floating Blur Circle */}
        <motion.div
          className="absolute top-[20%] left-[5%] w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-2xl"
          animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Floating Plus/Cross */}
        <motion.div
          className="absolute top-[60%] right-[12%] w-10 h-10 opacity-12"
          animate={{ y: [0, -15, 0], rotate: [0, 90, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <svg viewBox="0 0 40 40" className="w-full h-full fill-purple-500">
            <rect x="16" y="4" width="8" height="32" rx="2" />
            <rect x="4" y="16" width="32" height="8" rx="2" />
          </svg>
        </motion.div>

        {/* Floating Diamond */}
        <motion.div
          className="absolute bottom-[25%] left-[10%] w-12 h-12 opacity-15"
          animate={{ y: [0, 20, 0], rotate: [45, 45, 45], scale: [1, 1.1, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg transform rotate-45" />
        </motion.div>

        {/* Floating Ring */}
        <motion.div
          className="absolute bottom-[40%] right-[20%] w-14 h-14 opacity-10"
          animate={{ y: [0, -18, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <div className="w-full h-full rounded-full border-4 border-green-500" />
        </motion.div>
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Keunggulan <span className="text-orange-600">RSQUARE</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kami merancang sistem produktivitas yang menggabungkan kekuatan database dengan kemudahan Google Sheets.
            </p>
          </motion.div>
        </div>

        <div className="space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className={cn(
                "flex flex-col gap-12 items-center",
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              )}
            >
              {/* Image Side with Illustration */}
              <motion.div
                variants={textVariants}
                className="flex-1 w-full relative group perspective-1000"
              >
                <div className={cn(
                  "absolute inset-0 rounded-full blur-3xl opacity-20 transform scale-75 transition-transform duration-700 group-hover:scale-100",
                  feature.color.replace('100', '300')
                )} />
                <motion.img
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  src={feature.image}
                  alt={feature.title}
                  className="relative z-10 w-full max-w-md mx-auto drop-shadow-2xl"
                />
              </motion.div>

              {/* Text Side */}
              <div className="flex-1 space-y-8">
                {/* Animated Icon Box */}
                <motion.div
                  variants={textVariants}
                  className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg relative overflow-hidden", feature.color)}
                >
                  {/* Pulsing Background Circle */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-white/30 rounded-full blur-md"
                  />

                  {/* Lordicon */}
                  <lord-icon
                    src={feature.iconSrc}
                    trigger="loop"
                    delay="2000"
                    colors={feature.iconColor}
                    style={{ width: '48px', height: '48px' }}
                  />
                </motion.div>

                <motion.div variants={textVariants}>
                  <h3 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
