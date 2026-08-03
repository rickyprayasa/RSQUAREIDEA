import { createClient } from '@supabase/supabase-js'

// A purely static client that doesn't use cookies() or next/headers
// This is used for public pages (ISR) to prevent Next.js from opting into dynamic rendering.
export function createStaticClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
