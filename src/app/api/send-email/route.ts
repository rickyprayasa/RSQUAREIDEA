import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

interface EmailData {
    to: string
    customerName: string
    orderNumber: string
    totalAmount: number
    downloadLinks: { title: string; url: string }[]
}

export async function POST(request: NextRequest) {
    try {
        const data: EmailData = await request.json()
        const { to, customerName, orderNumber, totalAmount, downloadLinks } = data

        if (!to || !orderNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get email settings from site_settings table
        const { data: settingsData } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from_name', 'smtp_from_email', 'email_subject_template', 'email_body_template'])

        if (!settingsData || settingsData.length === 0) {
            return NextResponse.json({ error: 'Email settings not configured' }, { status: 500 })
        }

        const settings: Record<string, string> = {}
        settingsData.forEach(s => {
            if (s.value) settings[s.key] = s.value
        })

        const smtpHost = settings.smtp_host
        const smtpPort = parseInt(settings.smtp_port || '587')
        const smtpUser = settings.smtp_user
        const smtpPassword = settings.smtp_password
        const fromName = settings.smtp_from_name || 'RSQUARE'
        const fromEmail = settings.smtp_from_email || smtpUser
        const subjectTemplate = settings.email_subject_template || 'Link Download Template - {{order_number}}'

        // Use custom HTML template if not provided in settings
        const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <!-- Header -->
        <div style="background-color: #ffffff; padding: 30px 40px; text-align: center; border-bottom: 1px solid #f3f4f6;">
            <img src="https://nagujrwbifmpcwhotzut.supabase.co/storage/v1/object/public/Logo%20RSQUARE/RSQUARE.png" alt="RSQUARE Logo" style="height: 100px; width: auto; display: block; margin: 0 auto;">
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
            <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 24px; text-align: center;">Terima Kasih!</h1>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Halo <strong>{{customer_name}}</strong>,
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Terima kasih telah melakukan pembelian di RSQUARE. Pesanan Kamu dengan nomor <strong style="color: #f97316;">{{order_number}}</strong> telah berhasil dikonfirmasi.
            </p>

            <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <h3 style="color: #9a3412; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Download Template Kamu</h3>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    {{download_links_html}}
                </div>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-bottom: 24px;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Total Pembayaran:</p>
                <p style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">Rp {{total_amount}}</p>
            </div>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
                Jika ada pertanyaan atau kendala, jangan ragu untuk menghubungi kami melalui email atau WhatsApp.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="color: #9ca3af; font-size: 14px; margin-bottom: 12px;">
                &copy; ${new Date().getFullYear()} RSQUARE. All rights reserved.
            </p>
            <div style="color: #9ca3af; font-size: 12px;">
                <p style="margin: 4px 0;">RSQUARE Solusi Digital & Otomatisasi Bisnis</p>
                <p style="margin: 4px 0;">Bumi Arum Regency Blok Akasia no.21, Rancaekek, Bandung</p>
            </div>
        </div>
    </div>
</body>
</html>
`

        if (!smtpHost || !smtpUser || !smtpPassword) {
            return NextResponse.json({ error: 'SMTP not configured' }, { status: 500 })
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPassword,
            },
        })

        // Format download links for HTML
        const downloadLinksHtml = downloadLinks
            .map(link => `
                <a href="${link.url}" style="display: block; background-color: #ffffff; border: 1px solid #fed7aa; padding: 12px 16px; border-radius: 8px; text-decoration: none; color: #ea580c; font-weight: 500; transition: all 0.2s;">
                    ⬇️ ${link.title}
                </a>
            `)
            .join('')

        // Format download links for Text
        const downloadLinksText = downloadLinks
            .map((link, index) => `${index + 1}. ${link.title}\n   ${link.url}`)
            .join('\n\n')

        // Replace variables in template
        const subject = replaceVariables(subjectTemplate, {
            customer_name: customerName,
            customer_email: to,
            order_number: orderNumber,
            total_amount: totalAmount.toLocaleString('id-ID'),
        })

        // Use custom HTML template
        const htmlBody = htmlTemplate
            .replace(/{{customer_name}}/g, customerName)
            .replace(/{{order_number}}/g, orderNumber)
            .replace(/{{total_amount}}/g, totalAmount.toLocaleString('id-ID'))
            .replace(/{{download_links_html}}/g, downloadLinksHtml)

        // Fallback text body
        const textBody = `Halo ${customerName},\n\nTerima kasih telah melakukan pembelian di RSQUARE!\n\nPesanan Kamu dengan nomor ${orderNumber} telah dikonfirmasi.\n\nBerikut adalah link download template yang Kamu beli:\n\n${downloadLinksText}\n\nTotal Pembayaran: Rp ${totalAmount.toLocaleString('id-ID')}\n\nSalam hangat,\nTim RSQUARE`

        // Send email
        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            text: textBody,
            html: htmlBody,
        })

        return NextResponse.json({ success: true, message: 'Email sent successfully' })
    } catch (error) {
        console.error('Error sending email:', error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
}

function replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return result
}
