import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: settings } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['openrouter_api_key', 'openrouter_base_url'])

        const openrouterKey = settings?.find((s: any) => s.key === 'openrouter_api_key')?.value || ''
        const openrouterBaseUrl = settings?.find((s: any) => s.key === 'openrouter_base_url')?.value || 'https://openrouter.ai/api/v1'

        if (!openrouterKey && openrouterBaseUrl.includes('openrouter.ai')) {
            // If default openrouter and no key, we can still fetch models, but let's just return defaults
        }

        const url = `${openrouterBaseUrl.replace(/\/$/, '')}/models`
        
        const response = await fetch(url, {
            headers: openrouterKey ? { 'Authorization': `Bearer ${openrouterKey}` } : {}
        })

        if (!response.ok) {
            throw new Error(`Gagal mengambil model AI dari ${url} (Status: ${response.status})`)
        }

        const data = await response.json()
        
        let models = []
        if (data.data && Array.isArray(data.data)) {
            models = data.data.map((m: any) => ({
                id: m.id,
                name: m.name || m.id,
                provider: 'openrouter'
            }))
        } else if (Array.isArray(data)) {
            models = data.map((m: any) => ({
                id: m.id,
                name: m.name || m.id,
                provider: 'openrouter'
            }))
        }

        return NextResponse.json({ success: true, models })
    } catch (error) {
        console.error('Error fetching AI models:', error)
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}
