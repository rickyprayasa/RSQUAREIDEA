import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        await supabase.auth.signOut()

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: true }) // Always success for logout
    }
}

// Also support GET for convenience
export async function GET(request: NextRequest) {
    return POST(request)
}
