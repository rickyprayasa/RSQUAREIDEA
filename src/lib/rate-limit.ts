// In-memory rate limiting store
// For production, consider using Redis or Upstash

interface RateLimitEntry {
    count: number
    resetTime: number
    blocked: boolean
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
    // Maximum requests allowed
    maxRequests: number
    // Window duration in milliseconds
    windowMs: number
    // Block duration in milliseconds (after exceeding limit)
    blockDurationMs: number
}

export interface RateLimitResult {
    success: boolean
    remaining: number
    resetTime: number
    blocked: boolean
}

const DEFAULT_CONFIG: RateLimitConfig = {
    maxRequests: 5,           // 5 attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
    blockDurationMs: 30 * 60 * 1000, // block for 30 minutes
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (email, IP, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = DEFAULT_CONFIG
): RateLimitResult {
    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    // No previous entry, create new one
    if (!entry) {
        const resetTime = now + config.windowMs
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime,
            blocked: false,
        })
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetTime,
            blocked: false,
        }
    }

    // Entry exists, check if window has expired
    if (now > entry.resetTime) {
        const resetTime = now + config.windowMs
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime,
            blocked: false,
        })
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetTime,
            blocked: false,
        }
    }

    // Check if currently blocked
    if (entry.blocked) {
        return {
            success: false,
            remaining: 0,
            resetTime: entry.resetTime,
            blocked: true,
        }
    }

    // Increment count
    const newCount = entry.count + 1
    const remaining = Math.max(0, config.maxRequests - newCount)

    // Check if limit exceeded
    if (newCount > config.maxRequests) {
        // Block the identifier
        const blockResetTime = now + config.blockDurationMs
        rateLimitStore.set(identifier, {
            count: newCount,
            resetTime: blockResetTime,
            blocked: true,
        })
        return {
            success: false,
            remaining: 0,
            resetTime: blockResetTime,
            blocked: true,
        }
    }

    // Update entry
    rateLimitStore.set(identifier, {
        count: newCount,
        resetTime: entry.resetTime,
        blocked: false,
    })

    return {
        success: true,
        remaining,
        resetTime: entry.resetTime,
        blocked: false,
    }
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
    rateLimitStore.delete(identifier)
}

/**
 * Get rate limit status without incrementing
 * @param identifier - Unique identifier
 * @returns Current rate limit status
 */
export function getRateLimitStatus(identifier: string): RateLimitResult | null {
    const entry = rateLimitStore.get(identifier)
    if (!entry) return null

    return {
        success: entry.count < DEFAULT_CONFIG.maxRequests,
        remaining: Math.max(0, DEFAULT_CONFIG.maxRequests - entry.count),
        resetTime: entry.resetTime,
        blocked: entry.blocked,
    }
}

/**
 * Get all rate limit entries (for admin monitoring)
 */
export function getAllRateLimits(): Map<string, RateLimitEntry> {
    return new Map(rateLimitStore)
}
