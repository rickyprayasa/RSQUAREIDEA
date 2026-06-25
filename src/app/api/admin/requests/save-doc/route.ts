import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { requestId, docType, content } = await request.json()

        if (!requestId || !docType || content === undefined) {
            return NextResponse.json({ error: 'Request ID, docType, and content are required' }, { status: 400 })
        }

        if (!['prd', 'proposal'].includes(docType)) {
            return NextResponse.json({ error: 'Invalid docType' }, { status: 400 })
        }

        const updateField = docType === 'prd' ? 'prd_content' : 'proposal_content'

        const { error: updateError } = await supabase
            .from('template_requests')
            .update({ [updateField]: content })
            .eq('id', requestId)

        if (updateError) {
            console.error(`Failed to save ${docType} draft to DB:`, updateError)
            return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving document:', error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 })
    }
}
