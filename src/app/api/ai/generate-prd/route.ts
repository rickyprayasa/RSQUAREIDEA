import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/ai-router'

export const maxDuration = 60 // PRD generation might take a bit longer

export async function POST(req: Request) {
    try {
        // Auth check
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { requestId, template_name, templateName, description, budget, deadline, previousContent, frontendStack, cssFramework } = await req.json()
        
        const finalTemplateName = template_name || templateName || 'Tidak disebutkan'

        if (!description) {
            return NextResponse.json({ error: 'Deskripsi request tidak boleh kosong.' }, { status: 400 })
        }

        const finalJsStack = frontendStack || 'Vanilla JavaScript (atau minimal libraries via CDN)'
        const finalCssStack = cssFramework || 'Tailwind CSS via CDN atau CSS murni'

        // Define the prompt
        const systemPrompt = `You are an Expert Product Manager and Technical Architect. Your job is to analyze raw client requests and convert them into a professional, highly structured Product Requirements Document (PRD). This PRD must be detailed enough to be handed directly to an autonomous AI Coding Agent (like Cursor, Windsurf, Copilot, or OKEGAS) for implementation.

IMPORTANT TECH STACK CONSTRAINTS:
This application MUST be built as a Google Web App. 
- Backend: Google Apps Script (.gs files)
- Frontend Framework: HTML dan ${finalJsStack}.
- CSS Framework: ${finalCssStack}.
- Database: Google Sheets ONLY (no PostgreSQL, no Supabase).

Your output MUST be exclusively in standard HTML format (do not use markdown). Use semantic tags like <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <br>, <table>. Do NOT wrap the entire response in a markdown code block (\`\`\`html), just output raw HTML. Make sure the HTML is beautiful and properly spaced. Write the document in Indonesian or English, depending on the context of the prompt, but ensure technical terms are standard.

The PRD must include the following sections:
1. <h1>Executive Summary</h1>: Brief overview of the application and its core purpose.
2. <h2>User Stories / Core Features</h2>: Detailed breakdown of features for different user roles (e.g., Admin, User).
3. <h2>Suggested Database Schema (Google Sheets)</h2>: Provide clear column definitions and sheet names suitable for Google Sheets.
4. <h2>Suggested Server-Side Functions</h2>: List the main Google Apps Script functions (e.g., doGet, doPost, getData, saveData) needed.
5. <h2>UI/UX Requirements</h2>: Key views, state management needs (based on ${finalJsStack}), and UI styling specifications (using ${finalCssStack}).
6. <h2>Implementation Steps for AI Agent</h2>: A step-by-step checklist for the coding agent to follow to build this Google Web App systematically using the specified tech stack.

Remember to strictly enforce ${finalJsStack} and ${finalCssStack} throughout the document, especially in sections 5 and 6.`

        const userPrompt = `Tolong buatkan PRD (Product Requirements Document) berdasarkan request kustom klien berikut ini:

- **Jenis Aplikasi**: Google Web App (Google Apps Script + Google Sheets)
- **Tech Stack Frontend yang Wajib Dipakai**: ${finalJsStack} + ${finalCssStack}
- **Nama Aplikasi / Template**: ${finalTemplateName}
- **Estimasi Budget**: ${budget || 'Tidak disebutkan'}
- **Target Waktu**: ${deadline || 'Tidak disebutkan'}

**Deskripsi Mentah Klien:**
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
            maxTokens: 4000,
            tier: 'high'
        })

        const generatedHtml = result.text.trim()
        const finalHtml = generatedHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '')

        // Save to database ONLY if requestId exists (e.g. from Admin Dashboard)
        if (requestId) {
            const { error: updateError } = await supabase
                .from('template_requests')
                .update({ prd_content: finalHtml })
                .eq('id', requestId)

            if (updateError) {
                console.error('Failed to save PRD to DB:', updateError)
            }
        }

        return NextResponse.json({
            success: true,
            model: usedModel.id,
            prdContent: finalHtml,
        })

    } catch (error) {
        console.error('Error generating PRD:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            success: false,
            error: message,
        }, { status: 500 })
    }
}
