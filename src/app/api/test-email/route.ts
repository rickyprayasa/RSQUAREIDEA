import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

interface TestEmailData {
    to: string
    subject: string
    body: string
    smtpConfig?: {
        host: string
        port: string
        user: string
        pass: string
        fromName: string
        fromEmail: string
    }
}

export async function POST(request: NextRequest) {
    try {
        const data: TestEmailData = await request.json()
        const { to, subject, body, smtpConfig } = data

        if (!to) {
            return NextResponse.json({ error: 'Email penerima tidak boleh kosong' }, { status: 400 })
        }

        let smtpHost, smtpPort, smtpUser, smtpPassword, fromName, fromEmail

        if (smtpConfig) {
            // Use provided config
            smtpHost = smtpConfig.host
            smtpPort = parseInt(smtpConfig.port || '587')
            smtpUser = smtpConfig.user
            smtpPassword = smtpConfig.pass
            fromName = smtpConfig.fromName || 'RSQUARE'
            fromEmail = smtpConfig.fromEmail || smtpUser
        } else {
            // Fetch from database
            const supabase = await createClient()

            const { data: settingsData } = await supabase
                .from('site_settings')
                .select('key, value')
                .in('key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from_name', 'smtp_from_email'])

            if (!settingsData || settingsData.length === 0) {
                return NextResponse.json({ error: 'Pengaturan email belum dikonfigurasi' }, { status: 500 })
            }

            const settings: Record<string, string> = {}
            settingsData.forEach(s => {
                if (s.value) settings[s.key] = s.value
            })

            smtpHost = settings.smtp_host
            smtpPort = parseInt(settings.smtp_port || '587')
            smtpUser = settings.smtp_user
            smtpPassword = settings.smtp_password
            fromName = settings.smtp_from_name || 'RSQUARE'
            fromEmail = settings.smtp_from_email || smtpUser
        }

        if (!smtpHost || !smtpUser || !smtpPassword) {
            return NextResponse.json({
                error: 'Konfigurasi SMTP belum lengkap. Harap isi SMTP Host, Username, dan Password.'
            }, { status: 400 })
        }

        console.log('Testing email with config:', { smtpHost, smtpPort, smtpUser, fromEmail })

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

        // Send test email
        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject: subject || 'Test Email dari RSQUARE',
            text: body || 'Ini adalah email test. Konfigurasi SMTP berhasil!',
            html: (body || 'Ini adalah email test. Konfigurasi SMTP berhasil!').replace(/\n/g, '<br>'),
        })

        console.log('Test email sent successfully to:', to)

        return NextResponse.json({ success: true, message: 'Email test berhasil dikirim!' })
    } catch (error) {
        console.error('Error sending test email:', error)
        const errorMessage = error instanceof Error ? error.message : 'Gagal mengirim email test'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}
