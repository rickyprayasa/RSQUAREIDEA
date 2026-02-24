import { NextRequest, NextResponse } from 'next/server'
import { getEndpointType, checkEndpointRateLimit, RATE_LIMITS } from '@/lib/api-rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Global rate limiting middleware for API routes
 * Apply this to API routes that need rate limiting
 */
export async function withRateLimit(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
) {
    const pathname = request.nextUrl.pathname
    const method = request.method

    // Get identifier from IP
    const ip = request.headers.get('x-forwarded-for') ||
              request.headers.get('x-real-ip') ||
              'unknown'

    // Get endpoint type
    const endpointType = getEndpointType(pathname, method)

    // Check rate limit
    const result = checkEndpointRateLimit(endpointType, ip)

    // Add rate limit headers to response
    const headers = new Headers()
    headers.set('X-RateLimit-Limit', RATE_LIMITS[endpointType].maxRequests.toString())
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

    if (!result.success || result.blocked) {
        return NextResponse.json(
            {
                error: 'Too many requests',
                message: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
                resetTime: result.resetTime,
            },
            {
                status: 429,
                headers,
            }
        )
    }

    // Proceed with the actual handler
    return handler(request)
}

/**
 * Wrapper function for easier use in API routes
 */
export function withRateLimitHandler(
    handler: (req: NextRequest) => Promise<NextResponse>
) {
    return (request: NextRequest) => withRateLimit(request, handler)
}
