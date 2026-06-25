import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const { requestId, proposalContent, recipientEmail, recipientName } = await request.json()

        if (!proposalContent || !recipientEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = await createAdminClient()

        // Get SMTP settings
        const { data: settingsData } = await supabase
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

        // Use the proposal content directly as it is now generated and edited in HTML
        const formattedHtmlContent = proposalContent

        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposal Penawaran RSQUARE</title>
    <style>
        /* General HTML styling to make the injected content look clean */
        .proposal-content h1, .proposal-content h2, .proposal-content h3 { color: #111827; margin-top: 24px; margin-bottom: 12px; font-weight: 700; }
        .proposal-content h1 { font-size: 22px; border-bottom: 2px solid #ea580c; padding-bottom: 8px; display: inline-block;}
        .proposal-content h2 { font-size: 18px; color: #1f2937; }
        .proposal-content h3 { font-size: 16px; color: #374151; }
        .proposal-content p { color: #4b5563; line-height: 1.6; margin-bottom: 16px; }
        .proposal-content ul, .proposal-content ol { color: #4b5563; line-height: 1.6; margin-bottom: 16px; padding-left: 20px; }
        .proposal-content li { margin-bottom: 8px; }
        .proposal-content table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
        .proposal-content th { background-color: #f3f4f6; color: #374151; font-weight: 600; text-align: left; padding: 12px 16px; border: 1px solid #e5e7eb; }
        .proposal-content td { padding: 12px 16px; border: 1px solid #e5e7eb; color: #4b5563; vertical-align: top; }
        .proposal-content strong { color: #111827; font-weight: 600; }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <div style="height: 40px;"></div>
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 40px;">
        
        <!-- Top Geometric Bars (Matching Invoice) -->
        <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="width: 60%; background-color: #ea580c; height: 6px;"></td>
                <td style="width: 40%; background-color: #1f2937; height: 6px;"></td>
            </tr>
            <tr>
                <td style="width: 60%; background-color: #1f2937; height: 3px;"></td>
                <td style="width: 40%; background-color: #ffffff; height: 3px;"></td>
            </tr>
        </table>

        <!-- Header Area with Diagonal Graphic -->
        <div style="background-color: #ffffff;">
            <table cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                    <!-- Left Logo (White BG) -->
                    <td style="width: 50%; padding: 24px 10px 24px 40px; vertical-align: middle;">
                        <img src="https://nagujrwbifmpcwhotzut.supabase.co/storage/v1/object/public/Logo%20RSQUARE/RSQUARE.png" alt="RSQUARE" style="height: 48px; width: auto;">
                        <div style="color: #6b7280; font-size: 10px; margin-top: 6px; font-weight: 600; letter-spacing: 0.5px;">SOLUSI DIGITAL & OTOMATISASI BISNIS</div>
                    </td>

                    <!-- Right Title (Diagonal simulation + Orange Background) -->
                    <td style="width: 50%; vertical-align: middle; padding: 0; background-color: #ea580c; background: linear-gradient(110deg, #ffffff 15%, #1f2937 15%, #1f2937 25%, #ea580c 25%);">
                        <div style="padding: 24px 40px 24px 20px; text-align: right;">
                            <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: 1px;">PROPOSAL</h1>
                            <div style="color: #ffffff; font-size: 11px; font-weight: 700; margin-top: 4px; text-transform: uppercase;">PENAWARAN SISTEM</div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Content -->
        <div style="padding: 40px; color: #374151; font-size: 15px; line-height: 1.6;" class="proposal-content">
            ${formattedHtmlContent}
            
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px dashed #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                    Salam Hangat,<br>
                    <strong style="color: #111827; font-size: 16px;">Tim RSQUARE</strong><br>
                    Solusi Digital & Otomatisasi Bisnis
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; padding: 24px 40px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px; font-weight: 500;">
                © ${new Date().getFullYear()} RSQUARE. All rights reserved.
            </p>
            <p style="color: #d1d5db; font-size: 11px; margin: 0;">
                Bumi Arum Regency Blok Akasia no.21, Rancaekek, Bandung
            </p>
        </div>
    </div>
</body>
</html>
        `

        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: recipientEmail,
            subject: `Proposal Penawaran Aplikasi - RSQUARE`,
            html: htmlBody,
        })

        // Update request status to indicate proposal was sent? Optional.
        if (requestId) {
            await supabase
                .from('requests')
                .update({ 
                    status: 'in_progress' // Or just leave it as is if 'in_progress' is standard for dealing.
                })
                .eq('id', requestId)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error sending proposal:', error)
        return NextResponse.json({
            error: 'Failed to send proposal email',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
