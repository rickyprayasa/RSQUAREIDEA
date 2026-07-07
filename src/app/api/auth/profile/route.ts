import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const { name, avatar_url } = data

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 })
        }

        const supabase = await createAdminClient()

        // Update profile in users table
        const { error: dbError } = await supabase
            .from('users')
            .update({ name })
            .eq('id', session.id)

        if (dbError) {
            console.error('Error updating profile:', dbError)
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        if (avatar_url !== undefined) {
            const { error: authError } = await supabase.auth.admin.updateUserById(
                session.id,
                { user_metadata: { avatar_url } }
            )
            if (authError) {
                console.error('Error updating auth metadata:', authError)
                return NextResponse.json({ error: authError.message }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui' })
    } catch (error) {
        console.error('Server error updating profile:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
