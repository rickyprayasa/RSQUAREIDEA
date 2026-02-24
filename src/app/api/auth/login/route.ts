import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'
import { logLoginAttempt, isAccountLocked } from '@/lib/login-attempts'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email dan password harus diisi' },
                { status: 400 }
            )
        }

        // Get client IP
        const ip = request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown'

        // Get user agent
        const userAgent = request.headers.get('user-agent') || undefined

        // Check rate limiting based on IP
        const ipRateLimit = checkRateLimit(`login:ip:${ip}`)

        if (ipRateLimit.blocked) {
            await logLoginAttempt({
                email,
                ipAddress: ip,
                userAgent,
                success: false,
                errorMessage: 'Rate limit exceeded',
            })
            return NextResponse.json(
                {
                    error: 'Terlalu banyak percobaan login. Silakan tunggu beberapa saat.',
                    blocked: true,
                    resetTime: ipRateLimit.resetTime,
                },
                { status: 429 }
            )
        }

        // Check rate limiting based on email
        const emailRateLimit = checkRateLimit(`login:email:${email}`)

        if (emailRateLimit.blocked) {
            await logLoginAttempt({
                email,
                ipAddress: ip,
                userAgent,
                success: false,
                errorMessage: 'Email rate limit exceeded',
            })
            return NextResponse.json(
                {
                    error: 'Terlalu banyak percobaan login untuk email ini. Silakan tunggu beberapa saat.',
                    blocked: true,
                    resetTime: emailRateLimit.resetTime,
                },
                { status: 429 }
            )
        }

        // Check if account is locked due to failed attempts
        const lockCheck = await isAccountLocked(email)

        if (lockCheck.locked) {
            await logLoginAttempt({
                email,
                ipAddress: ip,
                userAgent,
                success: false,
                errorMessage: 'Account locked',
            })
            return NextResponse.json(
                {
                    error: lockCheck.reason || 'Akun dikunci sementara karena terlalu banyak percobaan gagal.',
                    locked: true,
                    remainingTime: lockCheck.remainingTime,
                },
                { status: 429 }
            )
        }

        // Attempt login
        const result = await login(email, password)

        if (result.error) {
            // Log failed attempt
            await logLoginAttempt({
                email,
                ipAddress: ip,
                userAgent,
                success: false,
                errorMessage: result.error,
            })

            // Generic error message to prevent user enumeration
            return NextResponse.json(
                {
                    error: 'Email atau password salah.',
                    remaining: emailRateLimit.remaining,
                },
                { status: 401 }
            )
        }

        // Login successful - reset rate limits
        resetRateLimit(`login:ip:${ip}`)
        resetRateLimit(`login:email:${email}`)

        // Log successful attempt
        await logLoginAttempt({
            email,
            ipAddress: ip,
            userAgent,
            success: true,
        })

        return NextResponse.json({
            success: true,
            user: result.user,
        })
    } catch (error) {
        console.error('Login error:', error)

        const ip = request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown'

        const { email } = await request.json().catch(() => ({ email: 'unknown' }))

        // Log error attempt
        await logLoginAttempt({
            email,
            ipAddress: ip,
            success: false,
            errorMessage: 'Server error',
        })

        return NextResponse.json(
            { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
            { status: 500 }
        )
    }
}
