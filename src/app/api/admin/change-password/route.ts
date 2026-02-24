import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { validatePasswordRequirements } from '@/lib/password-strength'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}

export async function POST(request: NextRequest) {
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
            .select('role, email')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json() as ChangePasswordRequest
        const { currentPassword, newPassword } = body

        // Validate input
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Password saat ini dan password baru harus diisi' },
                { status: 400 }
            )
        }

        // Validate new password requirements
        const passwordValidation = validatePasswordRequirements(newPassword)
        if (!passwordValidation.valid) {
            return NextResponse.json(
                {
                    error: 'Password baru tidak memenuhi persyaratan',
                    errors: passwordValidation.errors
                },
                { status: 400 }
            )
        }

        // Check if new password is same as current
        if (currentPassword === newPassword) {
            return NextResponse.json(
                { error: 'Password baru tidak boleh sama dengan password saat ini' },
                { status: 400 }
            )
        }

        // Verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: profile.email,
            password: currentPassword,
        })

        if (signInError) {
            return NextResponse.json(
                { error: 'Password saat ini salah' },
                { status: 401 }
            )
        }

        // Update password using Supabase Admin
        const adminClient = await createAdminClient()
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        )

        if (updateError) {
            console.error('Password update error:', updateError)
            return NextResponse.json(
                { error: 'Gagal mengubah password. Silakan coba lagi.' },
                { status: 500 }
            )
        }

        // Log password change for security
        const ip = request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown'

        await adminClient
            .from('login_attempts')
            .insert({
                email: profile.email,
                ip_address: ip,
                success: true,
                error_message: 'Password changed successfully',
            })

        return NextResponse.json({
            success: true,
            message: 'Password berhasil diubah. Silakan login kembali dengan password baru.'
        })
    } catch (error: any) {
        console.error('Change password error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
            { status: 500 }
        )
    }
}
