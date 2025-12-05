import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: settingsData } = await supabase
            .from('settings')
            .select('key, value')
            .in('key', ['meta_pixel_id', 'google_analytics_id', 'google_tag_manager_id', 'tiktok_pixel_id'])

        const settings: Record<string, string> = {}
        settingsData?.forEach(s => {
            if (s.value) settings[s.key] = s.value
        })

        let script = ''

        // Meta Pixel
        if (settings.meta_pixel_id) {
            script += `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${settings.meta_pixel_id}');
fbq('track','PageView');
`
        }

        // Google Analytics
        if (settings.google_analytics_id) {
            script += `
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.google_analytics_id}');
`
        }

        // GTM
        if (settings.google_tag_manager_id) {
            script += `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${settings.google_tag_manager_id}');
`
        }

        // TikTok Pixel
        if (settings.tiktok_pixel_id) {
            script += `
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${settings.tiktok_pixel_id}');ttq.page();}(window,document,'ttq');
`
        }

        return new NextResponse(script, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=300', // Cache 5 menit
            },
        })
    } catch (error) {
        console.error('Tracking script error:', error)
        return new NextResponse('', {
            headers: { 'Content-Type': 'application/javascript' },
        })
    }
}
