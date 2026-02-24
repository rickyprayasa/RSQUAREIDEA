// Global API rate limiting for all public endpoints
// Extends the existing rate-limit.ts with more comprehensive features

import { checkRateLimit, resetRateLimit, type RateLimitConfig } from './rate-limit'

// Rate limit configurations for different endpoint types
export const RATE_LIMITS = {
    // Public APIs - Very strict
    public: {
        maxRequests: 10,
        windowMs: 15 * 60 * 1000, // 15 minutes
        blockDurationMs: 30 * 60 * 1000, // 30 minutes
    },
    // Authentication endpoints
    auth: {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000,
        blockDurationMs: 60 * 60 * 1000, // 1 hour
    },
    // Payment endpoints
    payment: {
        maxRequests: 3,
        windowMs: 15 * 60 * 1000,
        blockDurationMs: 60 * 60 * 1000, // 1 hour
    },
    // Standard API endpoints
    standard: {
        maxRequests: 30,
        windowMs: 15 * 60 * 1000,
        blockDurationMs: 15 * 60 * 1000, // 15 minutes
    },
    // Admin endpoints (authenticated)
    admin: {
        maxRequests: 100,
        windowMs: 15 * 60 * 1000,
        blockDurationMs: 30 * 60 * 1000,
    },
} as const

export type EndpointType = keyof typeof RATE_LIMITS

/**
 * Check rate limit for an endpoint
 */
export function checkEndpointRateLimit(
    endpointType: EndpointType,
    identifier: string
) {
    return checkRateLimit(
        `endpoint:${endpointType}:${identifier}`,
        RATE_LIMITS[endpointType]
    )
}

/**
 * Reset rate limit for an endpoint
 */
export function resetEndpointRateLimit(
    endpointType: EndpointType,
    identifier: string
) {
    return resetRateLimit(`endpoint:${endpointType}:${identifier}`)
}

/**
 * Determine endpoint type from request
 */
export function getEndpointType(pathname: string, method: string): EndpointType {
    // Authentication endpoints
    if (pathname.includes('/auth/') || pathname.includes('/login')) {
        return 'auth'
    }

    // Payment endpoints
    if (pathname.includes('/payment') || pathname.includes('/duitku') || pathname.includes('/qris')) {
        return 'payment'
    }

    // Admin endpoints (authenticated)
    if (pathname.startsWith('/api/admin/')) {
        return 'admin'
    }

    // Public APIs
    if (pathname.startsWith('/api/')) {
        return 'standard'
    }

    // Default to public
    return 'public'
}

/**
 * Express middleware for rate limiting
 */
export function rateLimitMiddleware(endpointType: EndpointType) {
    return async (req: any, res: any, next: any) => {
        // Get identifier from IP or user
        const identifier = req.ip || req.socket.remoteAddress || 'unknown'
        const result = checkEndpointRateLimit(endpointType, identifier)

        res.setHeader('X-RateLimit-Limit', RATE_LIMITS[endpointType].maxRequests.toString())
        res.setHeader('X-RateLimit-Remaining', result.remaining.toString())
        res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

        if (!result.success || result.blocked) {
            return res.status(429).json({
                error: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
                resetTime: result.resetTime,
            })
        }

        next()
    }
}

/**
 * Advanced rate limiting with user-specific limits
 */
export async function checkUserRateLimit(
    userId: string,
    endpointType: EndpointType
): Promise<boolean> {
    const result = checkRateLimit(
        `user:${endpointType}:${userId}`,
        RATE_LIMITS[endpointType]
    )
    return result.success && !result.blocked
}

/**
 * Get rate limit status for display
 */
export function getRateLimitStatus(
    endpointType: EndpointType,
    identifier: string
) {
    return checkRateLimit(
        `endpoint:${endpointType}:${identifier}`,
        RATE_LIMITS[endpointType]
    )
}

/**
 * Clear all rate limits (admin function)
 */
export function clearAllRateLimits() {
    // This would typically be done in a cleanup job
    // For now, rely on the automatic cleanup in rate-limit.ts
}

/**
 * Block an identifier immediately (admin function)
 */
export function blockIdentifier(
    identifier: string,
    durationMs: number = 60 * 60 * 1000 // 1 hour default
) {
    const blockUntil = Date.now() + durationMs
    // Store blocked status
    // This could use Redis or a database in production
    console.log(`Blocked ${identifier} until ${new Date(blockUntil).toISOString()}`)
}
