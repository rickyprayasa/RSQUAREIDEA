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

        const { description, templateName, clientName, previousContent } = await req.json()

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
4. <h2>Tahapan Pengerjaan (Timeline)</h2>: Suggested timeline and milestones.
5. <h2>Kebutuhan Data & Integrasi</h2>: What needs to be provided by the client.
6. <h2>Penutup</h2>: A professional closing statement.`

        const userPrompt = `Tolong buatkan draf Proposal Proyek berdasarkan informasi berikut ini:

- **Nama Klien**: ${clientName || 'Klien'}
- **Nama Aplikasi / Project**: ${templateName || 'Tidak disebutkan'}

**Kebutuhan/Deskripsi Klien:**
"${description}"`

        let aiMessages: any[] = []
        if (previousContent) {
            aiMessages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
                { role: 'assistant', content: previousContent },
                { role: 'user', content: 'Lanjutkan dokumen tersebut persis dari kata terakhir yang terpotong. Jangan mengulang kalimat sebelumnya dan jangan menambahkan pengantar.' }
            ]
        }

        // Generate using fallback router
        const { result, usedModel } = await generateWithFallback({
            system: previousContent ? undefined : systemPrompt,
            prompt: previousContent ? undefined : userPrompt,
            messages: previousContent ? aiMessages : undefined,
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
