import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { data: settings, error } = await supabase
            .from('site_settings')
            .select('*')

        if (error) {
            console.error('Error fetching settings:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        // Convert to key-value object
        const settingsObj: Record<string, string | null> = {}
        settings?.forEach(s => {
            settingsObj[s.key] = s.value
        })

        return NextResponse.json({ settings: settingsObj, raw: settings })
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const supabase = await createClient()

        // Upsert each setting
        for (const [key, value] of Object.entries(data)) {
            const { data: existing } = await supabase
                .from('site_settings')
                .select('id')
                .eq('key', key)
                .single()

            if (existing) {
                await supabase
                    .from('site_settings')
                    .update({ value: value as string })
                    .eq('key', key)
            } else {
                await supabase
                    .from('site_settings')
                    .insert({ key, value: value as string })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
