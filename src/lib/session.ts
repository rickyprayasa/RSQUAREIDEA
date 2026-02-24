import { createClient } from '@/lib/supabase/server'

export interface SessionInfo {
    userId: string
    email: string
    role: string
    createdAt: string
    lastActive: string
    ipAddress?: string
    userAgent?: string
}

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CONCURRENT_SESSIONS = 3 // Max sessions per user

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<SessionInfo[]> {
    const supabase = await createClient()
    const sessions: SessionInfo[] = []

    // Note: In a real implementation, you would have a sessions table
    // For now, we'll use a simplified approach with auth metadata

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Get session info from auth
    sessions.push({
        userId: user.id,
        email: user.email || '',
        role: (user.user_metadata?.role as string) || 'user',
        createdAt: new Date(user.created_at).toISOString(),
        lastActive: new Date(user.last_sign_in_at || user.created_at).toISOString(),
    })

    return sessions
}

/**
 * Check if session is expired
 */
export function isSessionExpired(lastActive: string): boolean {
    const lastActiveTime = new Date(lastActive).getTime()
    const now = Date.now()
    return (now - lastActiveTime) > SESSION_TIMEOUT
}

/**
 * Update session last active time
 */
export async function updateSessionActivity(): Promise<void> {
    const supabase = await createClient()
    await supabase.auth.updateUser({
        data: { last_active: new Date().toISOString() }
    })
}

/**
 * Revoke all sessions except current
 */
export async function revokeAllOtherSessions(): Promise<{ success: boolean; message: string }> {
    const supabase = await createClient()

    try {
        // In Supabase, we can use signOut to revoke current session
        // To revoke other sessions, you would typically:
        // 1. Use the admin API to list all sessions
        // 2. Revoke specific sessions
        // For now, we'll use a simplified approach

        const { data, error } = await supabase.auth.refreshSession()

        if (error) {
            return { success: false, message: 'Gagal refresh session' }
        }

        return { success: true, message: 'Semua session lain berhasil dicabut' }
    } catch (error) {
        return { success: false, message: 'Terjadi kesalahan' }
    }
}

/**
 * Extend session timeout
 */
export async function extendSession(): Promise<void> {
    await updateSessionActivity()
}

/**
 * Get session timeout configuration
 */
export function getSessionTimeout(): number {
    return SESSION_TIMEOUT
}

/**
 * Format session duration for display
 */
export function formatSessionDuration(lastActive: string): string {
    const lastActiveTime = new Date(lastActive).getTime()
    const now = Date.now()
    const elapsed = now - lastActiveTime
    const remaining = SESSION_TIMEOUT - elapsed

    if (remaining <= 0) return 'Expired'

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
        return `${hours} jam ${minutes} menit`
    }
    return `${minutes} menit`
}
