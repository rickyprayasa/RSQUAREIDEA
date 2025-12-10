// Unified notification helper
// Sends Telegram notifications when events occur

import { createClient } from '@/lib/supabase/server'
import { sendTelegramMessage, notificationTemplates } from './telegram'

interface TelegramConfig {
    enabled: boolean
    botToken: string
    chatId: string
}

async function getTelegramConfig(): Promise<TelegramConfig> {
    const supabase = await createClient()
    
    const { data: settings } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['telegram_enabled', 'telegram_bot_token', 'telegram_chat_id'])
    
    const config: Record<string, string> = {}
    settings?.forEach(s => { config[s.key] = s.value || '' })
    
    return {
        enabled: config.telegram_enabled === 'true',
        botToken: config.telegram_bot_token || '',
        chatId: config.telegram_chat_id || '',
    }
}

export async function notifyNewOrder(order: {
    id: number
    customerName: string
    email: string
    productTitle: string
    amount: number
}) {
    const config = await getTelegramConfig()
    if (!config.enabled) return
    
    await sendTelegramMessage(
        { botToken: config.botToken, chatId: config.chatId },
        notificationTemplates.newOrder(order)
    )
}

export async function notifyPaymentConfirmed(payment: {
    orderId: number
    customerName: string
    amount: number
    method: string
}) {
    const config = await getTelegramConfig()
    if (!config.enabled) return
    
    await sendTelegramMessage(
        { botToken: config.botToken, chatId: config.chatId },
        notificationTemplates.paymentConfirmed(payment)
    )
}

export async function notifyNewMessage(msg: {
    name: string
    email: string
    subject: string
    message: string
}) {
    const config = await getTelegramConfig()
    if (!config.enabled) return
    
    await sendTelegramMessage(
        { botToken: config.botToken, chatId: config.chatId },
        notificationTemplates.newMessage(msg)
    )
}

export async function notifyNewFeedback(feedback: {
    name: string
    email: string
    rating: number
    message: string
    productTitle?: string
}) {
    const config = await getTelegramConfig()
    if (!config.enabled) return
    
    await sendTelegramMessage(
        { botToken: config.botToken, chatId: config.chatId },
        notificationTemplates.newFeedback(feedback)
    )
}

export async function notifyNewTemplateRequest(request: {
    name: string
    email: string
    templateType: string
    description: string
}) {
    const config = await getTelegramConfig()
    if (!config.enabled) return
    
    await sendTelegramMessage(
        { botToken: config.botToken, chatId: config.chatId },
        notificationTemplates.newTemplateRequest(request)
    )
}

export async function notifyQrisConfirmation(data: {
    name: string
    email: string
    productTitle: string
    amount: number
}) {
    const config = await getTelegramConfig()
    if (!config.enabled) return
    
    await sendTelegramMessage(
        { botToken: config.botToken, chatId: config.chatId },
        notificationTemplates.qrisConfirmation(data)
    )
}
