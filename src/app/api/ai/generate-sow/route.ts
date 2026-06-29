import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/ai-router'

export const maxDuration = 60

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { description, templateName, clientName } = await req.json()

        if (!description) {
            return NextResponse.json({ error: 'Deskripsi request tidak boleh kosong.' }, { status: 400 })
        }

        const systemPrompt = `You are a Legal Counsel and Project Manager for a Professional IT Agency in Indonesia. 
Your job is to generate a comprehensive Statement of Work (SOW) / Kontrak Kesepakatan Kerja based on the project description.

Your output MUST be exclusively in standard HTML format (do not use markdown). Use semantic tags like <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <br>, <table>. Do NOT wrap the response in markdown code blocks (\`\`\`html), just output raw HTML. Make sure the HTML is beautiful and properly spaced.

The SOW must include the following sections:
1. <h1>Surat Kesepakatan Kerja (SOW)</h1>
2. <p>Informasi Pihak Pertama (Agensi) dan Pihak Kedua (Klien).</p>
3. <h2>Pasal 1: Ruang Lingkup Pekerjaan</h2>: Detailed features based on the description.
4. <h2>Pasal 2: Jangka Waktu</h2>: Timeline information.
5. <h2>Pasal 3: Biaya & Termin Pembayaran</h2>: Must include 3 Terms: DP (40%), UAT/Beta (40%), Pelunasan (20%).
6. <h2>Pasal 4: Batasan Revisi</h2>: Maximum 3 minor revisions. Major revisions require a Change Request.
7. <h2>Pasal 5: Hak Kekayaan Intelektual (HAKI)</h2>: Source code is handed over ONLY after 100% payment is cleared.
8. <h2>Pasal 6: Keterlambatan Feedback Klien</h2>: If the client does not respond for 14 working days, the project is considered complete and DP is non-refundable.
9. <h2>Penutup & Tanda Tangan</h2>: Space for signatures (Pihak Pertama & Pihak Kedua).`

        const userPrompt = `Tolong buatkan draf SOW / Kontrak Kerja berdasarkan informasi berikut ini:

- **Nama Klien (Pihak Kedua)**: ${clientName || 'Klien'}
- **Nama Aplikasi / Project**: ${templateName || 'Tidak disebutkan'}

**Kebutuhan/Deskripsi Klien:**
"${description}"`

        const { result, usedModel } = await generateWithFallback({
            system: systemPrompt,
            prompt: userPrompt,
            temperature: 0.5,
            maxTokens: 3500,
            tier: 'high'
        })

        const generatedHtml = result.text.trim()
        const finalHtml = generatedHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '')

        return NextResponse.json({
            success: true,
            model: usedModel.id,
            sowContent: finalHtml,
        })

    } catch (error) {
        console.error('Error generating SOW:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            success: false,
            error: message,
        }, { status: 500 })
    }
}
