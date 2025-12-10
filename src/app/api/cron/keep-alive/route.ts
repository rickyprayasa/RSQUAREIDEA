import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendTelegramMessage, notificationTemplates } from '@/lib/telegram'

// Cron job to keep Supabase database active
// Prevents free tier from pausing after 7 days of inactivity
// Configure in vercel.json to run every 3 days

export async function GET(request: NextRequest) {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Allow if no CRON_SECRET is set (for testing) or if it matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const supabase = await createClient()

        // Simple query to keep database active
        const { data, error } = await supabase
            .from('site_settings')
            .select('key')
            .limit(1)

        if (error) {
            console.error('Keep-alive query failed:', error)
            return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
        }

        // Log the ping
        console.log('Keep-alive ping successful at', new Date().toISOString())

        // Optionally send Telegram notification (can be disabled)
        const { data: settings } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['telegram_bot_token', 'telegram_chat_id', 'telegram_enabled', 'telegram_keepalive_notify'])

        const config: Record<string, string> = {}
        settings?.forEach(s => { config[s.key] = s.value || '' })

        // Only send Telegram if enabled AND keepalive notify is enabled
        if (config.telegram_enabled === 'true' && config.telegram_keepalive_notify === 'true') {
            await sendTelegramMessage(
                {
                    botToken: config.telegram_bot_token,
                    chatId: config.telegram_chat_id,
                },
                notificationTemplates.keepAlive()
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Keep-alive ping successful',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Keep-alive error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
