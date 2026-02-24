/**
 * EMERGENCY PASSWORD RESET SCRIPT
 *
 * Gunakan script ini jika admin terkunci dan tidak bisa login
 *
 * CARA PAKAI:
 * 1. Set email admin di bawah
 * 2. Set password baru yang kuat
 * 3. Jalankan: npm run reset-password
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ============ KONFIGURASI ============
const ADMIN_EMAIL = 'admin@rsquareidea.my.id' // Email admin yang terdaftar
const NEW_PASSWORD = 'Rsquare@Admin2026!Kuat' // Password baru yang kuat
// =====================================

async function resetPassword() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('❌ Supabase credentials tidak ditemukan!')
        console.log('Pastikan .env.local berisi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY')
        process.exit(1)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        console.log('🔑 Mencari user dengan email:', ADMIN_EMAIL)

        // List all users
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
            throw new Error('Gagal mencari user: ' + listError.message)
        }

        // Find user by email
        const user = users.find(u => u.email === ADMIN_EMAIL)

        if (!user) {
            console.error('❌ User tidak ditemukan dengan email:', ADMIN_EMAIL)
            console.log('\nUser yang tersedia:')
            users.forEach(u => {
                console.log(`  - ${u.email} (ID: ${u.id})`)
            })
            process.exit(1)
        }

        console.log('✅ User ditemukan:', user.email)

        // Verify user is admin
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
            console.error('❌ User bukan admin!')
            console.log('Role:', profile?.role)
            process.exit(1)
        }

        console.log('✅ User terkonfirmasi sebagai admin')

        // Update password
        console.log('🔄 Mengubah password...')
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: NEW_PASSWORD }
        )

        if (updateError) {
            throw new Error('Gagal mengubah password: ' + updateError.message)
        }

        console.log('\n✅ PASSWORD BERHASIL DIUBAR!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`Email: ${ADMIN_EMAIL}`)
        console.log(`Password Baru: ${NEW_PASSWORD}`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('\n⚠️  SEGERA LOGIN DAN GANTI PASSWORD LAGI!')
        console.log('   Buka: http://localhost:3000/admin/login')
        console.log('   Setelah login, buka: http://localhost:3000/admin/change-password')

    } catch (error: any) {
        console.error('\n❌ Error:', error.message)
        process.exit(1)
    }
}

resetPassword()
