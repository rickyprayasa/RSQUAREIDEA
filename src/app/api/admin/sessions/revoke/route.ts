import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeAllOtherSessions } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // For now, we'll use a simple approach
        // In production, you would implement proper session management
        const result = await revokeAllOtherSessions()

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error revoking sessions:', error)
        return NextResponse.json(
            { error: 'Failed to revoke sessions', message: error.message },
            { status: 500 }
        )
    }
}
