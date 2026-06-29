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

        const { description, templateName, prdContent, previousContent } = await req.json()

        if (!description) {
            return NextResponse.json({ error: 'Deskripsi request tidak boleh kosong.' }, { status: 400 })
        }

        const systemPrompt = `You are a Prompt Engineer and UX Architect. Your job is to generate a comprehensive set of prompts that a Project Manager can copy and paste into ChatGPT (with DALL-E and Data Analysis enabled) to generate UI/UX wireframes, flowcharts, and architecture diagrams based on the project requirements.

Your output MUST be exclusively in standard HTML format. Use semantic tags like <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote>. 
Format the actual prompts inside <blockquote> or <pre> tags so they are easy to distinguish and copy.

The output should include:
1. <h1>ChatGPT Prompts untuk Desain & Diagram</h1>
2. <p>Brief introduction explaining how to use these prompts.</p>
3. <h2>1. Prompt untuk Wireframe / UI Design (DALL-E)</h2>: Write a highly detailed prompt instructing ChatGPT to use DALL-E to generate a UI mockup based on the project description.
4. <h2>2. Prompt untuk User Flow (Mermaid.js)</h2>: Write a prompt asking ChatGPT to generate a Mermaid.js code block for the user flow.
5. <h2>3. Prompt untuk Struktur Database (Mermaid.js ER Diagram)</h2>: Write a prompt asking ChatGPT to generate an Entity Relationship diagram.
6. <h2>4. Ringkasan Eksekutif (Project Context)</h2>: A well-structured summary of the project requirements that the user can feed to ChatGPT as context.`

        const userPrompt = `Tolong buatkan Prompt Generator berdasarkan informasi berikut ini:

- **Nama Aplikasi / Project**: ${templateName || 'Tidak disebutkan'}
- **Deskripsi Klien:** "${description}"
${prdContent ? `- **Konteks PRD Saat Ini:** ${prdContent.substring(0, 1000)}...` : ''}`

        let aiMessages: any[] = []
        if (previousContent) {
            aiMessages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
                { role: 'assistant', content: previousContent },
                { role: 'user', content: 'Lanjutkan dokumen tersebut persis dari kata terakhir yang terpotong. Jangan mengulang kalimat sebelumnya dan jangan menambahkan pengantar.' }
            ]
        }

        const { result, usedModel } = await generateWithFallback({
            system: previousContent ? undefined : systemPrompt,
            prompt: previousContent ? undefined : userPrompt,
            messages: previousContent ? aiMessages : undefined,
            temperature: 0.7,
            maxTokens: 3000,
            tier: 'high'
        })

        const generatedHtml = result.text.trim()
        const finalHtml = generatedHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '')

        return NextResponse.json({
            success: true,
            model: usedModel.id,
            promptContent: finalHtml,
        })

    } catch (error) {
        console.error('Error generating design prompt:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            success: false,
            error: message,
        }, { status: 500 })
    }
}
