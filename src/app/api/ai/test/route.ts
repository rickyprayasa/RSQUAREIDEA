import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { google } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText } from 'ai'

export const maxDuration = 30

export async function POST() {
    const startTime = Date.now()

    try {
        // Auth check
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get keys
        const { data } = await supabase.from('site_settings').select('key, value').in('key', ['openrouter_api_key'])
        const openrouterKey = data?.find((s: any) => s.key === 'openrouter_api_key')?.value || ''
        const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''

        if (!googleKey && !openrouterKey) {
            throw new Error('Tidak ada API Key yang dikonfigurasi (Google / OpenRouter).')
        }

        const results = []

        // Test Google Gemini
        if (googleKey) {
            try {
                const res = await generateText({
                    model: google('gemini-2.5-flash'),
                    prompt: 'Balas dengan "Google Gemini berhasil terhubung!"',
                })
                results.push(`✅ Google (gemini-2.5-flash) OK!`)
            } catch (e: any) {
                results.push(`❌ Google Gagal: ${e.message}`)
            }
        }

        // Test OpenRouter
        if (openrouterKey) {
            try {
                const openrouterProvider = createOpenAICompatible({
                    name: 'openrouter',
                    apiKey: openrouterKey,
                    baseURL: 'https://openrouter.ai/api/v1',
                })
                // Use a fast free model for testing
                const res = await generateText({
                    model: openrouterProvider('deepseek/deepseek-r1:free'),
                    prompt: 'Balas dengan "OpenRouter berhasil terhubung!"',
                })
                results.push(`✅ OpenRouter (deepseek-r1:free) OK!`)
            } catch (e: any) {
                results.push(`❌ OpenRouter Gagal: ${e.message}`)
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
