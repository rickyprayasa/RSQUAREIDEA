import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import Script from 'next/script'

import './globals.css'
import { CartProvider } from '@/contexts/CartContext'
import { TrackingScripts } from '@/components/TrackingScripts'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f97316',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://rsquareidea.my.id'),
  title: {
    default: 'RSQUARE - Template Premium Google Sheets Indonesia',
    template: '%s | RSQUARE'
  },
  description: 'Koleksi template Google Sheets premium untuk bisnis dan personal. Budget tracker, invoice, inventory, dan lainnya. Hemat waktu, tingkatkan produktivitas.',
  keywords: ['template google sheets', 'spreadsheet indonesia', 'budget tracker', 'invoice template', 'inventory management', 'template gratis', 'template premium'],
  authors: [{ name: 'RSQUARE', url: 'https://rsquareidea.my.id' }],
  creator: 'RSQUARE',
  publisher: 'RSQUARE',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://rsquareidea.my.id',
    siteName: 'RSQUARE',
    title: 'RSQUARE - Template Premium Google Sheets Indonesia',
    description: 'Koleksi template Google Sheets premium untuk bisnis dan personal. Budget tracker, invoice, inventory, dan lainnya.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RSQUARE - Template Google Sheets Premium',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RSQUARE - Template Premium Google Sheets',
    description: 'Koleksi template Google Sheets premium untuk bisnis dan personal.',
    images: ['/images/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RSQUARE',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        {/* Lordicon script for animated icons */}
        <script src="https://cdn.lordicon.com/lordicon.js" async />
        {/* Tracking pixels - load early for proper detection */}
        <Script src="/api/tracking-script" strategy="beforeInteractive" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased bg-gray-50 text-gray-900`} suppressHydrationWarning>
        <TrackingScripts />
        <CartProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </CartProvider>
      </body>
    </html>
  )
}
