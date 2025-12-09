'use client'

import { cn } from '@/lib/utils'
import { ClientLordIcon } from '@/components/ui/lordicon'
import { motion, useAnimationControls } from 'framer-motion'
import { FlipWords } from '@/components/ui/flip-words'
import { useCallback, useEffect } from 'react'

const features = [
  {
    title: 'Desain Intuitif & Estetis',
    description: 'Tampilan visual yang bersih memanjakan mata, membuat pengelolaan data jadi menyenangkan.',
    lordicon: 'https://cdn.lordicon.com/wloilxuq.json', // edit/design icon
    color: 'bg-orange-100',
    lordiconColor: 'primary:#ea580c,secondary:#fbbf24',
    image: '/images/restorer-pana.png'
  },
  {
    title: 'Langsung Siap Pakai',
    description: 'Hemat puluhan jam. Download, buka, dan langsung gunakan tanpa setup rumit.',
    lordicon: 'https://cdn.lordicon.com/akqsdstj.json', // bolt/zap icon
    color: 'bg-blue-100',
    lordiconColor: 'primary:#2563eb,secondary:#60a5fa',
    image: '/images/rocket-pana.png'
  },
  {
    title: 'Otomatisasi Canggih',
    description: 'Ditenagai Google Apps Script untuk fitur ajaib yang tidak bisa dilakukan spreadsheet biasa.',
    lordicon: 'https://cdn.lordicon.com/nocovwne.json', // magic wand/automation icon
    color: 'bg-purple-100',
    lordiconColor: 'primary:#9333ea,secondary:#c084fc',
    image: '/images/ai-pana.png'
  },
  {
    title: 'Panduan Video Lengkap',
    description: 'Setiap template dilengkapi dengan video tutorial langkah demi langkah agar Kamu tidak bingung.',
    lordicon: 'https://cdn.lordicon.com/aklfruoc.json', // video/play icon
    color: 'bg-green-100',
    lordiconColor: 'primary:#16a34a,secondary:#4ade80',
    image: '/images/video-rafiki.png'
  },
]

export function Features() {
  const underlineControls = useAnimationControls()

  useEffect(() => {
    underlineControls.start({ scaleX: 1, opacity: 1 })
  }, [underlineControls])

  const handleWordChange = useCallback(() => {
    underlineControls.start({ 
      scaleX: [1, 0, 1], 
      opacity: [1, 0.3, 1],
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    })
  }, [underlineControls])

  return (
    <section id="features" className="py-16 md:py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            <span className="inline-block">Keunggulan </span>
            <span className="relative inline-block">
              <FlipWords 
                words={["RSQUARE", "Template Kami", "Produk Kami"]}
                duration={3000}
                className="text-orange-600"
                onAnimationStart={handleWordChange}
              />
              <motion.span 
                className="absolute -bottom-1 left-0 right-0 h-2 bg-orange-200/50 -z-10 origin-center"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={underlineControls}
              />
            </span>
          </h2>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            Kami merancang sistem produktivitas yang menggabungkan kekuatan database dengan kemudahan Google Sheets.
          </motion.p>
        </motion.div>

        <div className="space-y-20 md:space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.7, 
                ease: [0.4, 0, 0.2, 1],
                delay: 0.1
              }}
              className={cn(
                "flex flex-col gap-8 md:gap-12 items-center",
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              )}
            >
              {/* Image Side */}
              <motion.div 
                className="flex-1 w-full relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className={cn(
                  "absolute inset-0 rounded-full blur-3xl opacity-20 transform scale-75",
                  feature.color.replace('100', '300')
                )} />
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="relative z-10 w-full max-w-md mx-auto drop-shadow-xl"
                  loading="lazy"
                />
              </motion.div>

              {/* Text Side */}
              <div className="flex-1 space-y-6">
                {/* Icon Box */}
                <motion.div 
                  className={cn("w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg", feature.color)}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <ClientLordIcon
                    src={feature.lordicon}
                    trigger="loop"
                    delay="2000"
                    colors={feature.lordiconColor}
                    style={{ width: '40px', height: '40px' }}
                  />
                </motion.div>

                <div>
                  <motion.h3 
                    className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-3 md:mb-4"
                    initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="text-lg md:text-xl text-gray-600 leading-relaxed"
                    initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    {feature.description}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
