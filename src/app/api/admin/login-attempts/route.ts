import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecentFailedAttempts, getLoginStats } from '@/lib/login-attempts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // Verify admin session
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check user role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'stats' // 'stats' or 'attempts'

        if (type === 'stats') {
            const days = parseInt(searchParams.get('days') || '7')
            const stats = await getLoginStats(days)
            return NextResponse.json(stats)
        } else if (type === 'attempts') {
            const limit = parseInt(searchParams.get('limit') || '20')
            const attempts = await getRecentFailedAttempts(limit)
            return NextResponse.json({ attempts })
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    } catch (error: any) {
        console.error('Error getting login attempts:', error)
        return NextResponse.json(
            { error: 'Failed to get login attempts', message: error.message },
            { status: 500 }
        )
    }
}
