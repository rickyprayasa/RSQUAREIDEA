import { NextRequest, NextResponse } from 'next/server'
import { generateWithFallback } from '@/lib/ai-router'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { requestId, description, templateName, serviceType, email } = await request.json()

        if (!requestId || !description) {
            return NextResponse.json({ error: 'Request ID and Description are required' }, { status: 400 })
        }

        const systemPrompt = `Anda adalah seorang Konsultan IT dan Business Analyst senior di perusahaan RSQUARE (Solusi Digital & Otomatisasi Bisnis).
Tugas Anda adalah membalas permintaan kustom aplikasi/software dari klien dengan sebuah "Proposal Penawaran & Analisis Sistem" yang profesional, hangat, ramah, dan mudah dipahami oleh klien awam (business-friendly language).

Informasi Klien:
- Template/Jasa yang diminta: ${templateName}
- Jenis Aplikasi: ${serviceType}
- Email: ${email}
- Kebutuhan klien (mentah):
"""
${description}
"""

Buatlah proposal dalam format **HTML Murni** (tanpa backticks markdown \`\`\`, hanya tag HTML seperti <h2>, <ul>, <li>, <strong>, <p>) dengan struktur berikut:

1. **Pendahuluan**: Sapaan hangat, ucapan terima kasih atas ketertarikannya menggunakan layanan RSQUARE, dan ringkasan singkat bahwa Anda telah memahami kebutuhan mereka.
2. **Pemahaman Kebutuhan (Breakdown Fitur)**: Terjemahkan kebutuhan mentah klien menjadi poin-poin fitur/modul yang terstruktur dan mudah dipahami. Jelaskan alur kerja (flow) utamanya.
3. **Rekomendasi Modul Tambahan (Opsional tapi Disarankan)**: Berikan 1-3 ide fitur atau modul tambahan yang sangat relevan untuk membuat sistem mereka menjadi lebih sempurna (Upselling). Jelaskan benefitnya.
4. **Roadmap Pengembangan**: JANGAN GUNAKAN TAG <table>. Tuliskan roadmap dalam bentuk poin-poin bertingkat (nested list) menggunakan tag HTML <h3> untuk Fase Pengembangan (misal: <h3>Fase 1 - MVP</h3>), diikuti tag <ul> dan <li> untuk menjabarkan kategori serta daftar fiturnya agar mudah dibaca dan tidak rusak strukturnya di email.
5. **Estimasi Biaya & Waktu**:
   - Berikan estimasi harga (dalam format range, misal: Rp 1.500.000 - Rp 2.500.000).
   - ATURAN MUTLAK: Harga MINIMAL untuk pembuatan aplikasi adalah Rp 1.500.000. Sesuaikan harga di atas batas minimal ini tergantung dari kompleksitas fitur yang Anda analisis.
   - Berikan rincian estimasi waktu pengerjaan (misal: Analisis 3 Hari, Development 10 Hari, Total 13 Hari Kerja).
6. **Langkah Selanjutnya**: Call to action (CTA) yang mengarahkan klien untuk membalas email ini jika setuju untuk melanjutkan ke tahap pembuatan Invoice DP.

Gunakan bahasa Indonesia yang profesional namun santai (Business Casual), gunakan emoji secukupnya agar terkesan modern dan ramah.`

        const { result, usedModel } = await generateWithFallback({
            system: systemPrompt,
            prompt: `Tolong susunkan proposal penawarannya sekarang berdasarkan informasi di atas.`,
            temperature: 0.7,
            maxTokens: 4000,
            tier: 'high'
        })

        const generatedHtml = result.text.trim()

        // Save to database
        const { error: updateError } = await supabase
            .from('template_requests')
            .update({ proposal_content: generatedHtml })
            .eq('id', requestId)

        if (updateError) {
            console.error('Failed to save proposal to DB:', updateError)
            // We don't fail the request, just log it, so user still gets the content
        }

        return NextResponse.json({ proposal: generatedHtml, usedModel: usedModel.id })
    } catch (error) {
        console.error('Error generating proposal:', error)
        return NextResponse.json({
            error: 'Failed to generate proposal',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
