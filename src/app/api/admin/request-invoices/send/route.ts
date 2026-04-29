import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { invoiceId } = await request.json()

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
        }

        // Get invoice data
        const { data: invoice, error: fetchError } = await supabase
            .from('request_invoices')
            .select('*')
            .eq('id', invoiceId)
            .single()

        if (fetchError || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Get SMTP settings
        const adminSupabase = await createAdminClient()
        const { data: settingsData } = await adminSupabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from_name', 'smtp_from_email'])

        if (!settingsData || settingsData.length === 0) {
            return NextResponse.json({ error: 'Email settings not configured' }, { status: 500 })
        }

        const settings: Record<string, string> = {}
        settingsData.forEach(s => { if (s.value) settings[s.key] = s.value })

        const smtpHost = settings.smtp_host
        const smtpPort = parseInt(settings.smtp_port || '587')
        const smtpUser = settings.smtp_user
        const smtpPassword = settings.smtp_password
        const fromName = settings.smtp_from_name || 'RSQUARE'
        const fromEmail = settings.smtp_from_email || smtpUser

        if (!smtpHost || !smtpUser || !smtpPassword) {
            return NextResponse.json({ error: 'SMTP not configured' }, { status: 500 })
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPassword },
            tls: { rejectUnauthorized: false },
        })

        // Build items table HTML
        const items = (invoice.items || []) as { name: string; qty: number; price: number }[]
        const itemsHtml = items.map((item, idx) => `
            <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">${idx + 1}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${item.name}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #4b5563; text-align: center;">${item.qty}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #4b5563; text-align: right;">Rp ${item.price.toLocaleString('id-ID')}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; text-align: right;">Rp ${(item.qty * item.price).toLocaleString('id-ID')}</td>
            </tr>
        `).join('')

        const dueDateStr = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'

        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 640px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px 40px; text-align: center;">
            <img src="https://nagujrwbifmpcwhotzut.supabase.co/storage/v1/object/public/Logo%20RSQUARE/RSQUARE.png" alt="RSQUARE" style="height: 60px; width: auto; margin-bottom: 16px;">
            <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">INVOICE</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0;">${invoice.invoice_number}</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Halo <strong>${invoice.customer_name}</strong>,
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Berikut adalah invoice untuk layanan yang Anda request di RSQUARE.
            </p>

            ${invoice.description ? `
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Deskripsi Pekerjaan</p>
                <p style="color: #374151; font-size: 15px; margin: 0; line-height: 1.5;">${invoice.description}</p>
            </div>
            ` : ''}

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                    <tr style="background-color: #1f2937;">
                        <th style="padding: 12px 16px; text-align: left; color: #ffffff; font-size: 13px; font-weight: 600;">#</th>
                        <th style="padding: 12px 16px; text-align: left; color: #ffffff; font-size: 13px; font-weight: 600;">Item</th>
                        <th style="padding: 12px 16px; text-align: center; color: #ffffff; font-size: 13px; font-weight: 600;">Qty</th>
                        <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 13px; font-weight: 600;">Harga</th>
                        <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 13px; font-weight: 600;">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <!-- Totals -->
            <div style="border-top: 2px solid #e5e7eb; padding-top: 16px;">
                <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                    <span style="color: #6b7280;">Subtotal</span>
                    <span style="color: #111827; font-weight: 500;">Rp ${(invoice.subtotal || 0).toLocaleString('id-ID')}</span>
                </div>
                ${invoice.tax_percent > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                    <span style="color: #6b7280;">Pajak (${invoice.tax_percent}%)</span>
                    <span style="color: #111827;">Rp ${(invoice.tax_amount || 0).toLocaleString('id-ID')}</span>
                </div>
                ` : ''}
                ${invoice.discount > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                    <span style="color: #6b7280;">Diskon</span>
                    <span style="color: #ef4444;">- Rp ${(invoice.discount || 0).toLocaleString('id-ID')}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 8px; border-top: 2px solid #111827;">
                    <span style="color: #111827; font-size: 18px; font-weight: 700;">Total</span>
                    <span style="color: #f97316; font-size: 18px; font-weight: 700;">Rp ${(invoice.total || 0).toLocaleString('id-ID')}</span>
                </div>
            </div>

            <!-- Due Date -->
            <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px 20px; margin-top: 24px;">
                <p style="color: #9a3412; font-size: 14px; margin: 0; font-weight: 600;">
                    📅 Jatuh Tempo: ${dueDateStr}
                </p>
            </div>

            ${invoice.notes ? `
            <div style="margin-top: 24px;">
                <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Catatan:</p>
                <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.5;">${invoice.notes}</p>
            </div>
            ` : ''}

            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-top: 32px;">
                Jika ada pertanyaan, jangan ragu untuk menghubungi kami melalui email atau WhatsApp.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="color: #9ca3af; font-size: 14px; margin-bottom: 8px;">&copy; ${new Date().getFullYear()} RSQUARE. All rights reserved.</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 4px 0;">RSQUARE Solusi Digital & Otomatisasi Bisnis</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 4px 0;">Bumi Arum Regency Blok Akasia no.21, Rancaekek, Bandung</p>
        </div>
    </div>
</body>
</html>`

        const textBody = `Invoice ${invoice.invoice_number}\n\nHalo ${invoice.customer_name},\n\nBerikut invoice untuk layanan yang Anda request.\n\nTotal: Rp ${(invoice.total || 0).toLocaleString('id-ID')}\nJatuh Tempo: ${dueDateStr}\n\nSalam,\nTim RSQUARE`

        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: invoice.customer_email,
            subject: `Invoice ${invoice.invoice_number} - RSQUARE`,
            text: textBody,
            html: htmlBody,
        })

        // Update invoice status to 'sent'
        await supabase
            .from('request_invoices')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', invoiceId)

        // Create notification
        await supabase.from('notifications').insert({
            type: 'invoice',
            title: '📧 Invoice Terkirim',
            message: `Invoice ${invoice.invoice_number} berhasil dikirim ke ${invoice.customer_email}`,
            link: '/admin/invoices',
        })

        return NextResponse.json({ success: true, message: 'Invoice sent successfully' })
    } catch (error) {
        console.error('Error sending invoice:', error)
        return NextResponse.json({
            error: 'Failed to send invoice',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
