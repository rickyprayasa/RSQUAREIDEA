import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendTelegramMessage } from '@/lib/telegram'

// Internal API to send Telegram notifications
// Called by other API routes when events occur

interface DuitkuPaymentData {
    orderId: string
    customerName: string
    customerEmail: string
    amount: number
    productTitle: string
    paymentMethod: string
    downloadLinks: number
}

function formatDuitkuPaymentMessage(data: DuitkuPaymentData): string {
    return `💳 *PEMBAYARAN OTOMATIS BERHASIL*

📦 Order: \`${data.orderId}\`
👤 Customer: ${data.customerName}
📧 Email: ${data.customerEmail}
💰 Amount: Rp ${data.amount.toLocaleString('id-ID')}
🛍️ Product: ${data.productTitle}
💳 Method: ${data.paymentMethod}

✅ *Status: SELESAI OTOMATIS*
📧 Email dengan link download sudah dikirim (${data.downloadLinks} file)

_Tidak perlu konfirmasi manual_`
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { message, type, data } = body

        // Generate message based on type if not provided directly
        let finalMessage = message
        if (!finalMessage && type && data) {
            switch (type) {
                case 'duitku_payment':
                    finalMessage = formatDuitkuPaymentMessage(data as DuitkuPaymentData)
                    break
                default:
                    return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 })
            }
        }

        if (!finalMessage) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get Telegram config from settings
        const { data: settings } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['telegram_bot_token', 'telegram_chat_id', 'telegram_enabled'])

        const config: Record<string, string> = {}
        settings?.forEach(s => { config[s.key] = s.value || '' })

        // Check if Telegram is enabled
        if (config.telegram_enabled !== 'true') {
            return NextResponse.json({ success: false, message: 'Telegram notifications disabled' })
        }

        const result = await sendTelegramMessage(
            {
                botToken: config.telegram_bot_token,
                chatId: config.telegram_chat_id,
            },
            finalMessage
        )

        if (!result.success) {
            console.error('Telegram notification failed:', result.error)
            return NextResponse.json({ success: false, error: result.error }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Telegram API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
