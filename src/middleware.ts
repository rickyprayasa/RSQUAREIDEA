import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export default async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/telegram/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
