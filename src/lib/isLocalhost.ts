import { headers } from 'next/headers'

export async function isLocalhost(): Promise<boolean> {
    const headersList = await headers()
    const host = headersList.get('host') || ''
    const xForwardedHost = headersList.get('x-forwarded-host') || ''
    
    const hostname = xForwardedHost || host
    
    return (
        hostname.includes('localhost') ||
        hostname.includes('127.0.0.1') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.includes('[::1]')
    )
}

export function isLocalhostSync(host: string): boolean {
    return (
        host.includes('localhost') ||
        host.includes('127.0.0.1') ||
        host.startsWith('192.168.') ||
        host.startsWith('10.') ||
        host.includes('[::1]')
    )
}
