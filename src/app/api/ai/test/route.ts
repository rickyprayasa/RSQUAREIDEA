import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText, streamText } from 'ai'
import { getAvailableModels } from '@/lib/ai-router'

export const maxDuration = 30

export async function POST(req: Request) {
    const startTime = Date.now()

    try {
        // Auth check
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json().catch(() => ({}))
        
        // Get keys (from body, fallback to DB)
        const { data } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', [
                'openrouter_api_key', 'openrouter_api_key_2', 'openrouter_api_key_3',
                'google_api_key_1', 'google_api_key_2', 'google_api_key_3',
                'openrouter_base_url', 'primary_ai_model'
            ])
            
        const getValue = (key: string) => data?.find((s: any) => s.key === key)?.value?.trim() || ''

        const dbOpenRouterKeys = [
            getValue('openrouter_api_key'),
            getValue('openrouter_api_key_2'),
            getValue('openrouter_api_key_3')
        ].filter(Boolean).join(',')

        const dbGoogleKeys = [
            getValue('google_api_key_1'),
            getValue('google_api_key_2'),
            getValue('google_api_key_3')
        ].filter(Boolean).join(',')

        // API Key Rotation Logic
        const getRotatedKey = (keyString: string) => {
            const keys = keyString.split(',').map(k => k.trim()).filter(Boolean)
            if (keys.length === 0) return ''
            return keys[Math.floor(Math.random() * keys.length)]
        }

        // Body can contain the joined keys if sent from frontend
        const finalOpenRouterKeys = body.openrouter_api_key || dbOpenRouterKeys
        const finalGoogleKeys = body.google_api_key || dbGoogleKeys || process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
        
        let openrouterKey = getRotatedKey(finalOpenRouterKeys)
        let openrouterBaseUrl = body.openrouter_base_url || getValue('openrouter_base_url') || 'https://openrouter.ai/api/v1'
        let primaryAiModel = body.primary_ai_model || getValue('primary_ai_model')
        
        openrouterBaseUrl = openrouterBaseUrl.trim() || 'https://openrouter.ai/api/v1'
        primaryAiModel = primaryAiModel.trim()

        const googleKey = getRotatedKey(finalGoogleKeys)
        const googleProvider = createGoogleGenerativeAI({ apiKey: googleKey })

        if (!googleKey && !openrouterKey) {
            throw new Error('Tidak ada API Key yang dikonfigurasi (Google / OpenRouter).')
        }

        const results = []

        // Test Google Gemini
        if (googleKey) {
            try {
                const res = await generateText({
                    model: googleProvider('gemini-2.5-flash'),
                    prompt: 'Balas dengan "Google Gemini berhasil terhubung!"',
                })
                results.push(`✅ Google (gemini-2.5-flash) OK!`)
            } catch (e: any) {
                results.push(`❌ Google Gagal: ${e.message}`)
            }
        }

        // Test OpenRouter
        if (openrouterKey) {
            let orModels = []
            if (primaryAiModel) {
                orModels.push({ provider: 'openrouter', id: primaryAiModel, name: primaryAiModel })
            } else {
                const availableModels = await getAvailableModels()
                orModels = availableModels.filter(m => m.provider === 'openrouter').slice(0, 5)
                if (orModels.length === 0) {
                    orModels.push({ provider: 'openrouter', id: 'openrouter/free', name: 'OpenRouter Free Auto' })
                }
            }

            let success = false
            let lastErrorMsg = ''

            for (const m of orModels) {
                try {
                    const response = await fetch(`${openrouterBaseUrl.replace(/\/$/, '')}/chat/completions`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${openrouterKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://rsquareidea.com',
                            'X-Title': 'RSQUARE IDEA',
                        },
                        body: JSON.stringify({
                            model: m.id,
                            messages: [{ role: 'user', content: 'Balas dengan "OpenRouter berhasil terhubung!"' }]
                        })
                    })

                    const text = await response.text()

                    if (response.ok) {
                        results.push(`✅ OpenRouter (${m.id}) OK!`)
                        success = true
                        break
                    } else {
                        // Parse error if possible
                        let errorDetail = text
                        try {
                            const json = JSON.parse(text)
                            errorDetail = json.error?.message || json.error || text
                        } catch (e) {
                            // If it's HTML (Cloudflare block), just show a snippet
                            if (text.includes('<html')) {
                                errorDetail = 'Cloudflare Block / HTML Error (Model Down atau IP diblokir)'
                            } else {
                                errorDetail = text.substring(0, 100)
                            }
                        }
                        
                        lastErrorMsg = `HTTP ${response.status}: ${errorDetail}`
                        console.warn(`[Test] OpenRouter model ${m.id} failed:`, lastErrorMsg)
                    }
                } catch (e: any) {
                    lastErrorMsg = e.message
                    console.warn(`[Test] OpenRouter model ${m.id} fetch failed:`, lastErrorMsg)
                }
            }

            if (!success) {
                results.push(`❌ OpenRouter Gagal: ${lastErrorMsg || 'Semua model gratis sedang limit/tidak tersedia.'}`)
            }
        }

        const duration = Date.now() - startTime
        
        const allSuccess = results.some(r => r.includes('✅'))

        if (allSuccess) {
            return NextResponse.json({
                success: true,
                model: 'Dual Router (Gemini + OpenRouter)',
                response: results.join(' | '),
                duration,
                tokensUsed: null,
            })
        } else {
             throw new Error(results.join(' | '))
        }

    } catch (error) {
        const duration = Date.now() - startTime
        const message = error instanceof Error ? error.message : 'Unknown error'
        
        let hint = 'Pastikan API Key sudah benar.'
        if (message.includes('401') || message.includes('403')) {
            hint = 'API key tidak valid atau expired. Periksa kembali.'
        } else if (message.includes('429')) {
            hint = 'Rate limit tercapai. Silakan coba beberapa saat lagi.'
        }

        return NextResponse.json({
            success: false,
            error: message,
            hint,
            duration,
        })
    }
}
