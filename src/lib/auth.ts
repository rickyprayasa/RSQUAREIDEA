import { createClient } from '@/lib/supabase/server'

export async function getSession() {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
        return null
    }

    const { data: profile } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('id', user.id)
        .single()

    return profile
}

export async function login(email: string, password: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    if (!data.user) {
        return { error: 'Login gagal' }
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('id', data.user.id)
        .single()

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
        await supabase.auth.signOut()
        return { error: 'Akses ditolak. Anda bukan admin.' }
    }

    return { 
        success: true, 
        user: profile
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
}

export async function createAdminUser(email: string, password: string, name: string, role: 'admin' | 'superadmin' = 'admin') {
    const supabase = await createClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'Gagal membuat user' }
    }

    // Create profile
    const { error: profileError } = await supabase
        .from('users')
        .insert({
            id: authData.user.id,
            email,
            name,
            role,
        })

    if (profileError) {
        return { error: profileError.message }
    }

    return { success: true, user: authData.user }
}
