import { createAdminClient } from '@/lib/supabase/server'

export interface LoginAttemptData {
    email: string
    ipAddress: string
    userAgent?: string
    success: boolean
    errorMessage?: string
}

/**
 * Log a login attempt to the database
 */
export async function logLoginAttempt(data: LoginAttemptData): Promise<void> {
    try {
        const supabase = await createAdminClient()

        await supabase.from('login_attempts').insert({
            email: data.email,
            ip_address: data.ipAddress,
            user_agent: data.userAgent || null,
            success: data.success,
            error_message: data.errorMessage || null,
        })
    } catch (error) {
        // Don't throw error to prevent login issues
        console.error('Failed to log login attempt:', error)
    }
}

/**
 * Check if an email has too many recent failed attempts
 * Returns true if account should be temporarily locked
 */
export async function isAccountLocked(
    email: string,
    maxAttempts: number = 5,
    lockoutMinutes: number = 30
): Promise<{ locked: boolean; reason?: string; remainingTime?: number }> {
    try {
        const supabase = await createAdminClient()

        const cutoffTime = new Date()
        cutoffTime.setMinutes(cutoffTime.getMinutes() - lockoutMinutes)

        const { data: attempts, error } = await supabase
            .from('login_attempts')
            .select('created_at, success')
            .eq('email', email)
            .eq('success', false)
            .gte('created_at', cutoffTime.toISOString())
            .order('created_at', { ascending: false })
            .limit(maxAttempts)

        if (error || !attempts) {
            return { locked: false }
        }

        // Check if account should be locked
        if (attempts.length >= maxAttempts) {
            const lastAttempt = new Date(attempts[0].created_at)
            const unlockTime = new Date(lastAttempt)
            unlockTime.setMinutes(unlockTime.getMinutes() + lockoutMinutes)

            const now = new Date()
            const remainingMs = unlockTime.getTime() - now.getTime()

            if (remainingMs > 0) {
                return {
                    locked: true,
                    reason: `Terlalu banyak percobaan login gagal. Akun dikunci sementara.`,
                    remainingTime: remainingMs,
                }
            }
        }

        return { locked: false }
    } catch (error) {
        console.error('Error checking account lock:', error)
        return { locked: false }
    }
}

/**
 * Get recent failed login attempts for monitoring
 */
export async function getRecentFailedAttempts(limit: number = 10) {
    try {
        const supabase = await createAdminClient()

        const { data, error } = await supabase
            .from('login_attempts')
            .select('*')
            .eq('success', false)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) return []

        return data
    } catch (error) {
        console.error('Error getting failed attempts:', error)
        return []
    }
}

/**
 * Get login statistics for the dashboard
 */
export async function getLoginStats(days: number = 7) {
    try {
        const supabase = await createAdminClient()

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const { data, error } = await supabase
            .from('login_attempts')
            .select('success, created_at')
            .gte('created_at', cutoffDate.toISOString())

        if (error || !data) {
            return {
                total: 0,
                successful: 0,
                failed: 0,
                successRate: 0,
            }
        }

        const successful = data.filter(a => a.success).length
        const failed = data.length - successful

        return {
            total: data.length,
            successful,
            failed,
            successRate: data.length > 0 ? (successful / data.length) * 100 : 0,
        }
    } catch (error) {
        console.error('Error getting login stats:', error)
        return {
            total: 0,
            successful: 0,
            failed: 0,
            successRate: 0,
        }
    }
}
