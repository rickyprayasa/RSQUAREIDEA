import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: settings, error } = await supabase
            .from('site_settings')
            .select('key, value')

        if (error) {
            console.error('Error fetching settings:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        const settingsObj: Record<string, string | null> = {}
        settings?.forEach(s => {
            settingsObj[s.key] = s.value
        })

        return NextResponse.json({ settings: settingsObj })
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
