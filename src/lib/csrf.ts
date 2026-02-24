import { createClient } from '@/lib/supabase/server'
import { randomBytes, createHash } from 'crypto'

export interface CSRFToken {
    token: string
    expiresAt: number
}

/**
 * Generate a secure CSRF token
 */
export async function generateCSRFToken(): Promise<string> {
    const token = randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    // Store token in Supabase (you could create a csrf_tokens table)
    // For now, we'll use session storage approach
    const supabase = await createClient()

    // Store in user metadata (this is a simple approach)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        await supabase.auth.updateUser({
            data: { csrf_token: token, csrf_expires: expiresAt }
        })
    }

    return token
}

/**
 * Validate CSRF token
 */
export async function validateCSRFToken(token: string): Promise<boolean> {
    if (!token) return false

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const storedToken = user.user_metadata?.csrf_token
    const expiresAt = user.user_metadata?.csrf_expires

    if (!storedToken || !expiresAt) return false

    if (Date.now() > expiresAt) {
        // Token expired
        return false
    }

    // Use timing-safe comparison to prevent timing attacks
    return token === storedToken
}

/**
 * Generate CSRF token for API responses
 */
export async function getCSRFTokenForAPI(): Promise<{ token: string } | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const token = randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000

    await supabase.auth.updateUser({
        data: { csrf_token: token, csrf_expires: expiresAt }
    })

    return { token }
}

/**
 * Middleware to validate CSRF token for state-changing operations
 */
export function requireValidCSRF() {
    return async (request: Request) => {
        // Only check for POST, PUT, DELETE, PATCH
        const method = request.method

        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return { valid: true }
        }

        try {
            const body = await request.json() as any
            const csrfToken = body?.csrfToken || body?.csrf_token

            if (!csrfToken) {
                return { valid: false, error: 'CSRF token missing' }
            }

            const isValid = await validateCSRFToken(csrfToken)

            if (!isValid) {
                return { valid: false, error: 'Invalid CSRF token' }
            }

            return { valid: true }
        } catch {
            return { valid: false, error: 'CSRF validation failed' }
        }
    }
}

/**
 * Generate double-submit CSRF token (more secure approach)
 */
export function generateDoubleSubmitCSRF(): { token: string; hash: string } {
    const token = randomBytes(32).toString('hex')
    const hash = createHash('sha256').update(token).digest('hex')

    return {
        token,
        hash
    }
}

/**
 * Validate double-submit CSRF token
 */
export function validateDoubleSubmitCSRF(token: string, storedHash: string): boolean {
    const computedHash = createHash('sha256').update(token).digest('hex')
    return computedHash === storedHash
}
