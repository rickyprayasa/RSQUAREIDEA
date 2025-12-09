'use client'

import { cn } from '@/lib/utils'
import { ClientLordIcon } from '@/components/ui/lordicon'

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
  return (
    <section id="features" className="py-16 md:py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            <span className="inline-block">Keunggulan </span>
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                RSQUARE
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-2 bg-orange-200/50 -z-10" />
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Kami merancang sistem produktivitas yang menggabungkan kekuatan database dengan kemudahan Google Sheets.
          </p>
        </div>

        <div className="space-y-20 md:space-y-32">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "flex flex-col gap-8 md:gap-12 items-center",
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              )}
            >
              {/* Image Side */}
              <div className="flex-1 w-full relative group">
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
              </div>

              {/* Text Side */}
              <div className="flex-1 space-y-6">
                {/* Icon Box */}
                <div className={cn("w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg", feature.color)}>
                  <ClientLordIcon
                    src={feature.lordicon}
                    trigger="loop"
                    delay="2000"
                    colors={feature.lordiconColor}
                    style={{ width: '40px', height: '40px' }}
                  />
                </div>

                <div>
                  <h3 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-3 md:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
