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

        const { requestId, template_name, description, budget, deadline } = await req.json()

        if (!requestId || !description) {
            return NextResponse.json({ error: 'Request ID and Deskripsi request tidak boleh kosong.' }, { status: 400 })
        }

        // Define the prompt
        const systemPrompt = `You are an Expert Product Manager and Technical Architect. Your job is to analyze raw client requests and convert them into a professional, highly structured Product Requirements Document (PRD). This PRD must be detailed enough to be handed directly to an autonomous AI Coding Agent (like Cursor, Windsurf, or Copilot) for implementation.

IMPORTANT TECH STACK CONSTRAINTS:
This application MUST be built as a Google Web App. 
- Backend: Google Apps Script (.gs files)
- Frontend: HTML, CSS, Vanilla JavaScript (or minimal libraries that work via CDN).
- Database: Google Sheets ONLY (no PostgreSQL, no Supabase).

Your output MUST be exclusively in standard Markdown format. Use clear headings, bullet points, and code blocks where necessary. Do NOT wrap the entire response in a markdown code block, just output raw markdown. Write the document in Indonesian or English, depending on the context of the prompt, but ensure technical terms are standard.

The PRD must include the following sections:
1. **Executive Summary**: Brief overview of the application and its core purpose.
2. **User Stories / Core Features**: Detailed breakdown of features for different user roles (e.g., Admin, User).
3. **Suggested Database Schema (Google Sheets)**: Provide clear column definitions and sheet names suitable for Google Sheets.
4. **Suggested Server-Side Functions**: List the main Google Apps Script functions (e.g., doGet, doPost, getData, saveData) needed.
5. **UI/UX Requirements**: Key views, state management needs (Vanilla JS), and UI styling suggestions (e.g., Tailwind CSS via CDN or Bootstrap).
6. **Implementation Steps for AI Agent**: A step-by-step checklist for the coding agent to follow to build this Google Web App systematically.`

        const userPrompt = `Tolong buatkan PRD (Product Requirements Document) berdasarkan request kustom klien berikut ini:

- **Jenis Aplikasi**: Google Web App (Google Apps Script + Google Sheets)
- **Nama Aplikasi / Template**: ${template_name || 'Tidak disebutkan'}
- **Estimasi Budget**: ${budget || 'Tidak disebutkan'}
- **Target Waktu**: ${deadline || 'Tidak disebutkan'}

**Deskripsi Mentah Klien:**
"${description}"`

        // Generate using fallback router
        const { result, usedModel } = await generateWithFallback({
            system: systemPrompt,
            prompt: userPrompt,
            temperature: 0.7,
            maxTokens: 4000,
            tier: 'high'
        })

        const generatedMd = result.text.trim()

        // Save to database
        const { error: updateError } = await supabase
            .from('template_requests')
            .update({ prd_content: generatedMd })
            .eq('id', requestId)

        if (updateError) {
            console.error('Failed to save PRD to DB:', updateError)
        }

        return NextResponse.json({
            success: true,
            model: usedModel.id,
            prd: generatedMd,
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
