import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()

        // Only admins can create users
        if (!session || !['admin', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { email, password, name, role } = await request.json()

        if (!email || !password || !name || !role) {
            return NextResponse.json(
                { error: 'Email, password, name, and role are required' },
                { status: 400 }
            )
        }

        // Validate domain
        if (!email.endsWith('@rsquareidea.my.id')) {
            return NextResponse.json(
                { error: 'Email harus menggunakan domain @rsquareidea.my.id' },
                { status: 400 }
            )
        }

        // Use standard @supabase/supabase-js to ensure Service Role Key is used purely without user session overriding it, bypassing RLS.
        const { createClient } = require('@supabase/supabase-js')
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Create auth user
        let userId: string

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        })

        if (authError) {
            if (authError.message.includes('already been registered')) {
                // If user exists, find their ID
                const { data: usersData } = await supabase.auth.admin.listUsers()
                const existingAuthUser = usersData?.users.find(u => u.email === email)

                if (existingAuthUser) {
                    userId = existingAuthUser.id
                    // Update auth password
                    await supabase.auth.admin.updateUserById(userId, { password })
                    
                    // Check if profile exists
                    const { data: existingProfile } = await supabase.from('users').select('id').eq('id', userId).single()
                    
                    if (existingProfile) {
                        const { error: updateError } = await supabase.from('users').update({ role, name }).eq('id', userId)
                        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })
                    } else {
                        const { error: insertError } = await supabase.from('users').insert({ id: userId, email, name, role })
                        if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })
                    }
                    
                    return NextResponse.json({ success: true, message: 'Akun berhasil diperbarui' })
                } else {
                    return NextResponse.json({ error: 'Email sudah terdaftar tapi data tidak ditemukan.' }, { status: 400 })
                }
            }
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Gagal membuat user' }, { status: 500 })
        }

        userId = authData.user.id

        // Create profile
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email,
                name,
                role,
            })

        if (profileError) {
            // Rollback auth user creation if profile fails
            await supabase.auth.admin.deleteUser(userId)
            return NextResponse.json({ error: profileError.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, user: authData.user })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()

        if (!session || !['admin', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { createClient } = require('@supabase/supabase-js')
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )
        
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, name, role, created_at')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, users })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
