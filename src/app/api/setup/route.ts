import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { email, password, name, secretKey } = await request.json()

        // Simple secret key protection
        if (secretKey !== 'rsquare-setup-2024') {
            return NextResponse.json({ error: 'Invalid secret key' }, { status: 403 })
        }

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 })
        }

        const cookieStore = await cookies()

        // Use service role key to create admin user
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // Ignore
                        }
                    },
                },
            }
        )

        // Check if any admin exists
        const { data: existingAdmins } = await supabase
            .from('users')
            .select('id')
            .in('role', ['admin', 'superadmin'])
            .limit(1)

        if (existingAdmins && existingAdmins.length > 0) {
            return NextResponse.json({ 
                error: 'Admin already exists. Use Supabase dashboard to manage users.' 
            }, { status: 400 })
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 500 })
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
        }

        // Create profile in users table
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                name,
                role: 'superadmin',
            })

        if (profileError) {
            // Rollback: delete auth user if profile creation fails
            await supabase.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: profileError.message }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Admin user created successfully',
            user: {
                id: authData.user.id,
                email: authData.user.email,
            }
        })
    } catch (error) {
        console.error('Setup error:', error)
        return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
    }
}

// GET to check if setup is needed
export async function GET() {
    try {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll() {},
                },
            }
        )

        const { data: existingAdmins } = await supabase
            .from('users')
            .select('id')
            .in('role', ['admin', 'superadmin'])
            .limit(1)

        return NextResponse.json({ 
            setupRequired: !existingAdmins || existingAdmins.length === 0 
        })
    } catch (error) {
        console.error('Check setup error:', error)
        return NextResponse.json({ error: 'Check failed' }, { status: 500 })
    }
}
