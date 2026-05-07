import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 15

const VALID_MODELS = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
]

export async function POST() {
    const startTime = Date.now()

    try {
        // Auth check
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check API key exists
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return NextResponse.json({
                success: false,
                error: 'API key tidak ditemukan. Pastikan GOOGLE_GENERATIVE_AI_API_KEY sudah diset di .env.local',
                duration: Date.now() - startTime,
            })
        }

        // Get model from settings
        let modelName = 'gemini-1.5-flash'
        try {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'ai_model')
                .single()
            if (data?.value && VALID_MODELS.includes(data.value)) {
                modelName = data.value
            }
        } catch {
            // Use default
        }

        // Test with a simple prompt
        const result = await generateText({
            model: google(modelName),
            prompt: 'Balas dengan tepat satu kalimat singkat dalam Bahasa Indonesia: "AI berhasil terhubung dan siap digunakan."',
            maxTokens: 50,
        })

        const duration = Date.now() - startTime

        return NextResponse.json({
            success: true,
            model: modelName,
            response: result.text.trim(),
            duration,
            tokensUsed: result.usage?.totalTokens || null,
        })

    } catch (error) {
        const duration = Date.now() - startTime
        const message = error instanceof Error ? error.message : 'Unknown error'
        
        // Provide helpful error messages
        let hint = ''
        if (message.includes('API_KEY') || message.includes('401') || message.includes('403')) {
            hint = 'API key tidak valid atau expired. Dapatkan key baru di aistudio.google.com/apikey'
        } else if (message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
            hint = 'Rate limit tercapai. Tunggu beberapa menit atau ganti ke model yang lebih ringan.'
        } else if (message.includes('404') || message.includes('not found')) {
            hint = 'Model tidak ditemukan. Coba ganti ke model lain di dropdown.'
        }

        return NextResponse.json({
            success: false,
            error: message,
            hint,
            duration,
        })
    }
}
