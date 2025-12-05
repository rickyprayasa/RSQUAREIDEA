'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface TrackingSettings {
    meta_pixel_id?: string
    google_analytics_id?: string
    google_tag_manager_id?: string
    tiktok_pixel_id?: string
    custom_head_script?: string
}

export function TrackingScripts() {
    const [settings, setSettings] = useState<TrackingSettings>({})
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) {
                    setSettings(data.settings)
                    setIsLoaded(true)
                }
            })
            .catch(console.error)
    }, [])

    // Manually inject Meta Pixel when settings are loaded
    useEffect(() => {
        if (isLoaded && settings.meta_pixel_id && typeof window !== 'undefined') {
            // Check if fbq is already initialized
            if (!(window as any).fbq) {
                // Create and inject the Meta Pixel script
                const script = document.createElement('script')
                script.innerHTML = `
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${settings.meta_pixel_id}');
                    fbq('track', 'PageView');
                `
                document.head.appendChild(script)

                // Add noscript fallback
                const noscript = document.createElement('noscript')
                const img = document.createElement('img')
                img.height = 1
                img.width = 1
                img.style.display = 'none'
                img.src = `https://www.facebook.com/tr?id=${settings.meta_pixel_id}&ev=PageView&noscript=1`
                noscript.appendChild(img)
                document.body.appendChild(noscript)
            }
        }
    }, [isLoaded, settings.meta_pixel_id])

    return (
        <>
            {/* Google Tag Manager */}
            {settings.google_tag_manager_id && (
                <>
                    <Script
                        id="gtm-script"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                                })(window,document,'script','dataLayer','${settings.google_tag_manager_id}');
                            `,
                        }}
                    />
                </>
            )}

            {/* Google Analytics 4 */}
            {settings.google_analytics_id && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`}
                        strategy="afterInteractive"
                    />
                    <Script
                        id="ga4-script"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${settings.google_analytics_id}');
                            `,
                        }}
                    />
                </>
            )}

            {/* TikTok Pixel */}
            {settings.tiktok_pixel_id && (
                <Script
                    id="tiktok-pixel"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            !function (w, d, t) {
                                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                                ttq.load('${settings.tiktok_pixel_id}');
                                ttq.page();
                            }(window, document, 'ttq');
                        `,
                    }}
                />
            )}

            {/* Custom Script */}
            {settings.custom_head_script && (
                <Script
                    id="custom-script"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: settings.custom_head_script,
                    }}
                />
            )}
        </>
    )
}

// Event tracking functions for use throughout the app
export const trackEvent = {
    // Meta Pixel events
    metaPageView: () => {
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'PageView')
        }
    },
    metaViewContent: (data: { content_name?: string; content_category?: string; value?: number }) => {
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'ViewContent', data)
        }
    },
    metaAddToCart: (data: { content_name?: string; value?: number; currency?: string }) => {
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'AddToCart', { ...data, currency: data.currency || 'IDR' })
        }
    },
    metaPurchase: (data: { value: number; currency?: string }) => {
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'Purchase', { ...data, currency: data.currency || 'IDR' })
        }
    },
    metaInitiateCheckout: (data?: { value?: number }) => {
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'InitiateCheckout', data)
        }
    },

    // Google Analytics events
    gaEvent: (eventName: string, params?: Record<string, any>) => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', eventName, params)
        }
    },
    gaPurchase: (data: { transaction_id: string; value: number; items: any[] }) => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'purchase', {
                ...data,
                currency: 'IDR',
            })
        }
    },
    gaAddToCart: (data: { item_name: string; value: number }) => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'add_to_cart', {
                currency: 'IDR',
                items: [{ item_name: data.item_name, price: data.value }],
            })
        }
    },

    // TikTok Pixel events
    tiktokViewContent: (data?: { content_name?: string; value?: number }) => {
        if (typeof window !== 'undefined' && (window as any).ttq) {
            (window as any).ttq.track('ViewContent', data)
        }
    },
    tiktokAddToCart: (data?: { content_name?: string; value?: number }) => {
        if (typeof window !== 'undefined' && (window as any).ttq) {
            (window as any).ttq.track('AddToCart', { ...data, currency: 'IDR' })
        }
    },
    tiktokInitiateCheckout: (data?: { value?: number }) => {
        if (typeof window !== 'undefined' && (window as any).ttq) {
            (window as any).ttq.track('InitiateCheckout', { ...data, currency: 'IDR' })
        }
    },
    tiktokCompletePayment: (data?: { value?: number }) => {
        if (typeof window !== 'undefined' && (window as any).ttq) {
            (window as any).ttq.track('CompletePayment', { ...data, currency: 'IDR' })
        }
    },
}
