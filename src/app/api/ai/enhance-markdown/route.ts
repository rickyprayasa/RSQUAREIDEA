import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

// Valid Gemini models
const VALID_MODELS = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
]

async function getAiModel(supabase: Awaited<ReturnType<typeof createClient>>) {
    try {
        const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'ai_model')
            .single()
        
        const model = data?.value || 'gemini-1.5-flash'
        return VALID_MODELS.includes(model) ? model : 'gemini-1.5-flash'
    } catch {
        return 'gemini-1.5-flash'
    }
}

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { markdownContent, mode } = await request.json()

        if (!markdownContent || typeof markdownContent !== 'string') {
            return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 })
        }

        if (markdownContent.length > 50000) {
            return NextResponse.json({ error: 'File terlalu besar (maks 50KB teks)' }, { status: 400 })
        }

        // Get AI model from settings
        const modelName = await getAiModel(supabase)

        const systemPrompt = `Kamu adalah asisten AI profesional untuk platform RSQUARE yang menjual template dan aplikasi web berbasis Google Sheets/Apps Script.

TUGAS: Analisis konten markdown berikut dan generate output JSON yang berisi deskripsi produk dan daftar fitur.

ATURAN OUTPUT:
1. "description" — Tulis deskripsi produk yang menarik, profesional, dan persuasif dalam Bahasa Indonesia. Maksimal 2-3 kalimat yang menjelaskan value utama produk.
   - Fokus pada MANFAAT bagi pengguna, bukan fitur teknis
   - Gunakan bahasa yang natural dan mudah dipahami
   - Jangan terlalu formal, tapi tetap profesional
   
2. "features" — Array string berisi daftar fitur utama produk.
   - Setiap fitur harus singkat (maks 8 kata)
   - Gunakan kata kerja aktif atau deskripsi langsung
   - Urutkan dari fitur paling penting ke kurang penting
   - Maksimal 12 fitur, minimal 3 fitur
   - Contoh format yang baik: "Dashboard analitik real-time", "Multi-device access", "Export laporan PDF"

3. "title" — Jika bisa, sarankan nama produk yang catchy dan profesional (opsional)

PENTING:
- Respond HANYA dalam format JSON valid, tanpa markdown code block, tanpa penjelasan.
- Format: {"description": "...", "features": ["...", "..."], "title": "..."}
- Jika konten markdown tidak jelas, tetap buat output terbaik berdasarkan informasi yang ada.`

        console.log(`AI Enhance: Using model ${modelName}`)

        const result = await generateText({
            model: google(modelName),
            system: systemPrompt,
            prompt: `Berikut konten markdown dari ringkasan aplikasi:\n\n${markdownContent}`,
        })

        // Parse AI response as JSON
        let parsed
        try {
            // Clean response - remove markdown code blocks if present
            let cleanText = result.text.trim()
            if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
            }
            parsed = JSON.parse(cleanText)
        } catch {
            console.error('Failed to parse AI response as JSON:', result.text)
            return NextResponse.json({
                error: 'AI response format tidak valid. Coba lagi.',
                rawResponse: result.text,
            }, { status: 500 })
        }

        return NextResponse.json({
            description: parsed.description || '',
            features: Array.isArray(parsed.features) ? parsed.features : [],
            title: parsed.title || '',
            model: modelName,
        })

    } catch (error) {
        console.error('AI Enhance Error:', error)
        const message = error instanceof Error ? error.message : 'Gagal memproses dengan AI'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
