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

        const { invoiceId, deliveryUrl, deliveryFileUrl, message } = await request.json()

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
        }

        if (!deliveryUrl && !deliveryFileUrl) {
            return NextResponse.json({ error: 'Delivery URL or file required' }, { status: 400 })
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

        const linksHtml = []
        if (deliveryUrl) {
            linksHtml.push(`
                <a href="${deliveryUrl}" style="display: block; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; margin-bottom: 12px;">
                    🔗 Akses Aplikasi
                </a>
            `)
        }
        if (deliveryFileUrl) {
            linksHtml.push(`
                <a href="${deliveryFileUrl}" style="display: block; background-color: #1f2937; color: #ffffff; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center;">
                    ⬇️ Download File Aplikasi
                </a>
            `)
        }

        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px 40px; text-align: center;">
            <img src="https://nagujrwbifmpcwhotzut.supabase.co/storage/v1/object/public/Logo%20RSQUARE/RSQUARE.png" alt="RSQUARE" style="height: 60px; width: auto; margin-bottom: 16px;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 700;">🎉 Aplikasi Anda Sudah Siap!</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Halo <strong>${invoice.customer_name}</strong>,
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Terima kasih telah mempercayakan proyek Anda kepada RSQUARE! Kami dengan senang hati menginformasikan bahwa aplikasi Anda telah selesai dibuat dan siap untuk digunakan.
            </p>

            ${invoice.description ? `
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="color: #166534; font-size: 13px; margin: 0 0 4px; font-weight: 600;">Proyek:</p>
                <p style="color: #15803d; font-size: 15px; margin: 0;">${invoice.description}</p>
            </div>
            ` : ''}

            ${message ? `
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="color: #374151; font-size: 15px; margin: 0; line-height: 1.6;">${message}</p>
            </div>
            ` : ''}

            <!-- Download/Access Links -->
            <div style="margin: 32px 0;">
                <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin-bottom: 16px;">Akses Aplikasi Anda</h3>
                ${linksHtml.join('')}
            </div>

            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; margin-top: 24px;">
                <p style="color: #1e40af; font-size: 14px; margin: 0; font-weight: 500;">
                    💡 <strong>Tips:</strong> Simpan link di atas untuk akses di kemudian hari. Jika ada kendala atau pertanyaan, jangan ragu untuk menghubungi kami.
                </p>
            </div>

            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-top: 32px;">
                Terima kasih telah memilih RSQUARE! Kami berharap aplikasi ini bermanfaat untuk bisnis Anda.
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

        const textBody = `Halo ${invoice.customer_name},\n\nAplikasi Anda sudah siap!\n\n${deliveryUrl ? `Link Akses: ${deliveryUrl}\n` : ''}${deliveryFileUrl ? `Download: ${deliveryFileUrl}\n` : ''}\n${message || ''}\n\nSalam,\nTim RSQUARE`

        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: invoice.customer_email,
            subject: `🎉 Aplikasi Anda Sudah Siap - RSQUARE`,
            text: textBody,
            html: htmlBody,
        })

        // Update invoice delivery status
        await supabase
            .from('request_invoices')
            .update({
                delivery_status: 'delivered',
                delivery_url: deliveryUrl || invoice.delivery_url,
                delivery_file_url: deliveryFileUrl || invoice.delivery_file_url,
                delivered_at: new Date().toISOString(),
            })
            .eq('id', invoiceId)

        // Create notification
        await supabase.from('notifications').insert({
            type: 'delivery',
            title: '🚀 Aplikasi Terkirim',
            message: `Aplikasi untuk ${invoice.customer_name} berhasil dikirim ke ${invoice.customer_email}`,
            link: '/admin/invoices',
        })

        return NextResponse.json({ success: true, message: 'Application delivered successfully' })
    } catch (error) {
        console.error('Error delivering application:', error)
        return NextResponse.json({
            error: 'Failed to deliver application',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
