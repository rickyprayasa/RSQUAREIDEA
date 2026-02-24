import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Emergency password reset endpoint
 * This should only be used when admin is locked out
 * Requires a special reset token or service role access
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface EmergencyResetRequest {
    email: string
    newPassword: string
    resetToken?: string // Optional additional security
}

export async function POST(request: NextRequest) {
    try {
        // SECURITY: In production, this should have additional verification
        // For example: a reset token from email, or IP whitelist
        const body = await request.json() as EmergencyResetRequest
        const { email, newPassword, resetToken } = body

        if (!email || !newPassword) {
            return NextResponse.json(
                { error: 'Email dan password baru harus diisi' },
                { status: 400 }
            )
        }

        // Check if this is an authorized reset request
        // In production, verify resetToken or check IP whitelist
        const authorizedReset = resetToken === process.env.EMERGENCY_RESET_TOKEN

        if (!authorizedReset) {
            // For security, log this unauthorized attempt
            console.error('Unauthorized password reset attempt for:', email)
            return NextResponse.json(
                { error: 'Unauthorized. Gunakan fitur reset password yang proper atau hubungi developer.' },
                { status: 401 }
            )
        }

        // Find user by email
        const adminClient = await createAdminClient()
        const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()

        if (listError) {
            return NextResponse.json(
                { error: 'Gagal mencari user' },
                { status: 500 }
            )
        }

        const user = users.find(u => u.email === email)

        if (!user) {
            // Generic error for security
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            )
        }

        // Check if user is admin
        // Note: We can't directly check roles from auth.admin.listUsers()
        // So we need to query the users table
        const { data: profile } = await adminClient
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
            return NextResponse.json(
                { error: 'Unauthorized. Bukan admin user.' },
                { status: 403 }
            )
        }

        // Update password
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        )

        if (updateError) {
            console.error('Password update error:', updateError)
            return NextResponse.json(
                { error: 'Gagal mengubah password' },
                { status: 500 }
            )
        }

        // Log the password change
        const ip = request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown'

        await adminClient
            .from('login_attempts')
            .insert({
                email,
                ip_address: ip,
                success: true,
                error_message: 'Emergency password reset',
            })

        return NextResponse.json({
            success: true,
            message: 'Password berhasil direset. Silakan login dengan password baru.'
        })
    } catch (error: any) {
        console.error('Emergency reset error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
