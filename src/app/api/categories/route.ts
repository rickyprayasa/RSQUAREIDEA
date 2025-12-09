import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: categories, error } = await supabase
            .from('categories')
            .select('name, slug, icon')
            .order('name')

        if (error) {
            console.error('Error fetching categories:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ categories: categories || [] })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
