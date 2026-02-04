import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createAdminClient()

        const { data: article, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching article:', error)
            return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
        }

        return NextResponse.json({ article })
    } catch (error) {
        console.error('Error in article API:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createAdminClient()
        const body = await request.json()

        // Clean up body (remove id, created_at, etc if present)
        const { id: _id, created_at, updated_at, ...updates } = body

        const { data: article, error } = await supabase
            .from('articles')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating article:', error)
            return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
        }

        return NextResponse.json({ article })
    } catch (error) {
        console.error('Error updating article:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createAdminClient()

        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting article:', error)
            return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting article:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
