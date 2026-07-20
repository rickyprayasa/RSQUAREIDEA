import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/ai-router'

export const maxDuration = 60

export async function POST(req: Request) {
    try {
        // Auth check
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { description, templateName, clientName, previousContent, manualContext } = await req.json()

        if (!description) {
            return NextResponse.json({ error: 'Deskripsi request tidak boleh kosong.' }, { status: 400 })
        }

        // Define the prompt
        const systemPrompt = `You are an Expert Business Consultant and Sales Manager for an IT Agency. Your job is to analyze client requirements and convert them into a professional, persuasive, and comprehensive Business Proposal in Indonesian.

Your output MUST be exclusively in standard HTML format (do not use markdown). Use semantic tags like <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <br>. Do NOT wrap the response in markdown code blocks (\`\`\`html), just output raw HTML. Make sure the HTML is beautiful and properly spaced.

The Proposal must include the following sections:
1. <h1>Proposal Penawaran: [Nama Project]</h1>
2. <p><strong>Latar Belakang & Tujuan:</strong> Brief persuasive introduction.</p>
3. <h2>Ruang Lingkup Pekerjaan (Scope of Work)</h2>: Detailed breakdown of what will be built.
4. <h2>Metodologi & Workflow (Tahapan Kerja)</h2>: Explain the development phases (e.g., Requirement, Design, Development, Testing, Deployment).
5. <h2>Kebutuhan Data & Integrasi</h2>: What needs to be provided by the client.
6. <h2>Estimasi Waktu (Timeline)</h2>: Suggested timeline and milestones.
7. <h2>Rincian Investasi (Pricing) & Termin Pembayaran</h2>: Create a placeholder table for pricing and list payment terms (e.g., DP 30%, dll).
8. <h2>Maintenance & Support</h2>: Post-launch support terms.
9. <h2>Penutup</h2>: A professional closing statement.`

        // Extract image URLs if any
        const imageUrls: string[] = []
        if (manualContext) {
            const imgRegex = /<img[^>]+src="([^">]+)"/g
            let match
            while ((match = imgRegex.exec(manualContext)) !== null) {
                imageUrls.push(match[1])
            }
        }

        const cleanManualContext = manualContext ? manualContext.replace(/<[^>]+>/g, '').trim() : ''

        const userPrompt = `Tolong buatkan draf Proposal Proyek berdasarkan informasi berikut ini:

- **Nama Klien**: ${clientName || 'Klien'}
- **Nama Aplikasi / Project**: ${templateName || 'Tidak disebutkan'}

**Kebutuhan/Deskripsi Klien:**
"${description}"
${cleanManualContext ? `\n**Konteks Tambahan (Hasil Follow-up Manual Klien):**\n"${cleanManualContext}"` : ''}`

        // Construct user content array for Multimodal
        const userContent: any[] = [{ type: 'text', text: userPrompt }]
        for (const url of imageUrls) {
            userContent.push({ type: 'image', image: url })
        }

        let aiMessages: any[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ]

        if (previousContent) {
            aiMessages.push({ role: 'assistant', content: previousContent })
            aiMessages.push({ role: 'user', content: 'Lanjutkan dokumen tersebut persis dari kata terakhir yang terpotong. Jangan mengulang kalimat sebelumnya dan jangan menambahkan pengantar.' })
        }

        // Generate using fallback router
        const { result, usedModel } = await generateWithFallback({
            messages: aiMessages,
            temperature: 0.7,
            maxTokens: 3000,
            tier: 'high'
        })

        const generatedHtml = result.text.trim()
        // clean up if AI insists on returning ```html
        const finalHtml = generatedHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '')

        return NextResponse.json({
            success: true,
            model: usedModel.id,
            proposalContent: finalHtml,
        })

    } catch (error) {
        console.error('Error generating Proposal:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            success: false,
            error: message,
        }, { status: 500 })
    }
}
