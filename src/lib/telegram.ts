// Telegram Bot Notification Service

interface TelegramConfig {
    botToken: string
    chatId: string
}

interface InlineKeyboardButton {
    text: string
    callback_data: string
}

interface InlineKeyboardMarkup {
    inline_keyboard: InlineKeyboardButton[][]
}

interface SendMessageOptions {
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    disableWebPagePreview?: boolean
    replyMarkup?: InlineKeyboardMarkup
}

interface InlineKeyboardButton {
    text: string
    callback_data?: string
    url?: string
}

interface SendPhotoOptions {
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    inlineKeyboard?: InlineKeyboardButton[][]
}

export async function sendTelegramMessage(
    config: TelegramConfig,
    message: string,
    options: SendMessageOptions = {}
): Promise<{ success: boolean; error?: string }> {
    if (!config.botToken || !config.chatId) {
        return { success: false, error: 'Telegram not configured' }
    }

    try {
        const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`
        
        const body: any = {
            chat_id: config.chatId,
            text: message,
            parse_mode: options.parseMode || 'HTML',
            disable_web_page_preview: options.disableWebPagePreview ?? false, // Set to false to allow image previews
        }

        if (options.replyMarkup) {
            body.reply_markup = options.replyMarkup
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })

        const data = await response.json()
        
        if (!data.ok) {
            return { success: false, error: data.description || 'Failed to send message' }
        }

        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function sendTelegramPhoto(
    config: TelegramConfig,
    photoUrl: string,
    caption: string,
    options: SendPhotoOptions = {}
): Promise<{ success: boolean; error?: string }> {
    if (!config.botToken || !config.chatId) {
        return { success: false, error: 'Telegram not configured' }
    }

    try {
        const url = `https://api.telegram.org/bot${config.botToken}/sendPhoto`
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body: Record<string, any> = {
            chat_id: config.chatId,
            photo: photoUrl,
            caption: caption,
            parse_mode: options.parseMode || 'HTML',
        }

        if (options.inlineKeyboard) {
            body.reply_markup = {
                inline_keyboard: options.inlineKeyboard,
            }
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })

        const data = await response.json()
        
        if (!data.ok) {
            return { success: false, error: data.description || 'Failed to send photo' }
        }

        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function answerCallbackQuery(
    botToken: string,
    callbackQueryId: string,
    text?: string,
    showAlert?: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
        const url = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text: text,
                show_alert: showAlert ?? false,
            }),
        })

        const data = await response.json()
        
        if (!data.ok) {
            return { success: false, error: data.description || 'Failed to answer callback' }
        }

        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function editMessageCaption(
    config: TelegramConfig,
    messageId: number,
    caption: string,
    parseMode: string = 'HTML'
): Promise<{ success: boolean; error?: string }> {
    try {
        const url = `https://api.telegram.org/bot${config.botToken}/editMessageCaption`
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.chatId,
                message_id: messageId,
                caption: caption,
                parse_mode: parseMode,
            }),
        })

        const data = await response.json()
        
        if (!data.ok) {
            return { success: false, error: data.description || 'Failed to edit caption' }
        }

        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

// Notification message templates
export const notificationTemplates = {
    newOrder: (order: { id: number; customerName: string; email: string; productTitle: string; amount: number }) => `
🛒 <b>Pesanan Baru!</b>

📦 Produk: ${order.productTitle}
👤 Nama: ${order.customerName}
📧 Email: ${order.email}
💰 Total: Rp ${order.amount.toLocaleString('id-ID')}

🔗 <a href="https://rsquareidea.my.id/admin/orders">Lihat Detail</a>
`,

    manualConfirmation: (order: { id: number; customerName: string; email: string; productTitle: string; amount: number; imageUrl?: string }) => {
        let message = `
🔽 <b>KONFIRMASI MANUAL DIBUTUHKAN</b> 🔽
-----------------------------------------
🛒 <b>Pesanan Baru!</b>

📦 Produk: ${order.productTitle}
👤 Nama: ${order.customerName}
📧 Email: ${order.email}
💰 Total: Rp ${order.amount.toLocaleString('id-ID')}
`
        if (order.imageUrl) {
            message += `

📄 <a href="${order.imageUrl}">LIHAT BUKTI PEMBAYARAN</a>
`
        }

        message += `
-----------------------------------------
Mohon untuk segera dikonfirmasi.`

        const replyMarkup: InlineKeyboardMarkup = {
            inline_keyboard: [
                [
                    { text: '✅ Terima', callback_data: `{'''action''': '''accept_order''', '''order_id''': ${order.id}}` },
                    { text: '❌ Tolak', callback_data: `{'''action''': '''reject_order''', '''order_id''': ${order.id}}` }
                ]
            ]
        }
        return { message, replyMarkup }
    },

    paymentConfirmed: (payment: { orderId: number; customerName: string; amount: number; method: string }) => `
✅ <b>Pembayaran Dikonfirmasi!</b>

🧾 Order ID: #${payment.orderId}
👤 Nama: ${payment.customerName}
💰 Jumlah: Rp ${payment.amount.toLocaleString('id-ID')}
💳 Metode: ${payment.method}

🔗 <a href="https://rsquareidea.my.id/admin/payments">Lihat Detail</a>
`,

    newMessage: (msg: { name: string; email: string; subject: string; message: string }) => `
💬 <b>Pesan Baru!</b>

👤 Dari: ${msg.name}
📧 Email: ${msg.email}
📝 Subject: ${msg.subject}

💭 Pesan:
${msg.message.substring(0, 200)}${msg.message.length > 200 ? '...' : ''}

🔗 <a href="https://rsquareidea.my.id/admin/messages">Lihat Detail</a>
`,

    newFeedback: (feedback: { name: string; email: string; rating: number; message: string; productTitle?: string }) => `
⭐ <b>Feedback Baru!</b>

👤 Dari: ${feedback.name}
📧 Email: ${feedback.email}
${feedback.productTitle ? `📦 Produk: ${feedback.productTitle}\n` : ''}⭐ Rating: ${'⭐'.repeat(feedback.rating)}

💭 Feedback:
${feedback.message.substring(0, 200)}${feedback.message.length > 200 ? '...' : ''}

🔗 <a href="https://rsquareidea.my.id/admin/feedback">Lihat Detail</a>
`,

    newTemplateRequest: (request: { name: string; email: string; templateType: string; description: string }) => `
📋 <b>Request Template Baru!</b>

👤 Dari: ${request.name}
📧 Email: ${request.email}
📁 Tipe: ${request.templateType}

📝 Deskripsi:
${request.description.substring(0, 200)}${request.description.length > 200 ? '...' : ''}

🔗 <a href="https://rsquareidea.my.id/admin/requests">Lihat Detail</a>
`,

    qrisConfirmation: (data: { name: string; email: string; productTitle: string; amount: number }) => `
📱 <b>Konfirmasi QRIS Baru!</b>

👤 Nama: ${data.name}
📧 Email: ${data.email}
📦 Produk: ${data.productTitle}
💰 Jumlah: Rp ${data.amount.toLocaleString('id-ID')}

🔗 <a href="https://rsquareidea.my.id/admin/qris">Lihat Detail</a>
`,

    keepAlive: () => `
🤖 <b>Keep-alive Ping</b>

Database tetap aktif! ✅
Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
`,
}
