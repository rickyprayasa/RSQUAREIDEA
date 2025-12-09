import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getVoucherEmailHtml(name: string, voucherCode: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Voucher</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <!-- Header -->
        <div style="background-color: #ffffff; padding: 30px 40px; text-align: center; border-bottom: 1px solid #f3f4f6;">
            <img src="https://nagujrwbifmpcwhotzut.supabase.co/storage/v1/object/public/Logo%20RSQUARE/RSQUARE.png" alt="RSQUARE Logo" style="height: 100px; width: auto; display: block; margin: 0 auto;">
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
            <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 24px; text-align: center;">Terima Kasih! 🎉</h1>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Halo <strong>${name}</strong>,
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Terima kasih sudah memberikan feedback untuk RSQUARE! Kami sangat menghargai waktu dan masukan Kamu.
            </p>

            <div style="background-color: #ecfdf5; border: 2px dashed #10b981; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
                <h3 style="color: #065f46; font-size: 16px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">🎁 Kode Voucher Template Gratis</h3>
                <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                    <p style="color: #111827; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: 2px;">${voucherCode}</p>
                </div>
                <p style="color: #047857; font-size: 14px; margin: 0;">
                    Berlaku untuk 1 template berbayar manapun
                </p>
            </div>

            <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h4 style="color: #374151; font-size: 14px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">📝 Cara Menggunakan Voucher:</h4>
                <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                    <li>Pilih template yang Kamu inginkan di website kami</li>
                    <li>Klik "Beli Sekarang"</li>
                    <li>Masukkan kode voucher di halaman checkout</li>
                    <li>Nikmati template gratis Kamu!</li>
                </ol>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://www.rsquareidea.my.id/templates" style="display: inline-block; background-color: #f97316; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Lihat Template Sekarang
                </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 0; text-align: center;">
                Voucher ini hanya bisa digunakan 1 kali dan berlaku selama 90 hari.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="color: #9ca3af; font-size: 14px; margin-bottom: 12px;">
                &copy; ${new Date().getFullYear()} RSQUARE. All rights reserved.
            </p>
            <div style="color: #9ca3af; font-size: 12px;">
                <p style="margin: 4px 0;">RSQUARE Solusi Digital & Otomatisasi Bisnis</p>
            </div>
        </div>
    </div>
</body>
</html>
`
}

async function sendVoucherEmail(email: string, name: string, voucherCode: string) {
    console.log('=== SENDING VOUCHER EMAIL ===')
    console.log('To:', email)
    console.log('Name:', name)
    console.log('Voucher:', voucherCode)
    
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = parseInt(process.env.SMTP_PORT || '465')
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM || smtpUser

    console.log('SMTP Config - Host:', smtpHost, 'Port:', smtpPort, 'User:', smtpUser, 'From:', smtpFrom)

    if (!smtpHost || !smtpUser || !smtpPass) {
        console.error('SMTP not configured - missing:', { host: !smtpHost, user: !smtpUser, pass: !smtpPass })
        return false
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
    })

    const htmlEmail = getVoucherEmailHtml(name, voucherCode)
    const textEmail = `Halo ${name},\n\nTerima kasih sudah memberikan feedback untuk RSQUARE!\n\nSebagai apresiasi, berikut adalah kode voucher untuk mendapatkan 1 Template Google Sheets GRATIS:\n\n🎁 Kode Voucher: ${voucherCode}\n\nCara menggunakan:\n1. Pilih template di https://www.rsquareidea.my.id/templates\n2. Klik "Beli Sekarang"\n3. Masukkan kode voucher di halaman checkout\n\nVoucher berlaku untuk 1 template dan hanya bisa digunakan 1 kali.\n\nTerima kasih!\nTim RSQUARE`

    try {
        console.log('Attempting to send email...')
        
        // Verify SMTP connection first
        await transporter.verify()
        console.log('SMTP connection verified')
        
        const result = await transporter.sendMail({
            from: smtpFrom,
            to: email,
            subject: 'Kode Voucher Template Gratis dari RSQUARE 🎁',
            text: textEmail,
            html: htmlEmail,
        })
        console.log('Email sent successfully! MessageId:', result.messageId)
        return true
    } catch (err) {
        console.error('Failed to send voucher email:', err)
        if (err instanceof Error) {
            console.error('SMTP Error:', err.message)
            // Log more details for debugging
            const errorDetails = {
                message: err.message,
                name: err.name,
                host: smtpHost,
                port: smtpPort,
                user: smtpUser,
                from: smtpFrom,
            }
            console.error('Error details:', JSON.stringify(errorDetails))
        }
        return false
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        
        // Use service role to bypass RLS
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Insert feedback
        const { data: feedback, error } = await supabase
            .from('feedback')
            .insert({
                name: data.name || null,
                email: data.email || null,
                social_media: data.socialMedia || null,
                social_media_url: data.socialMediaUrl || null,
                template_name: data.templateName || null,
                rating: data.rating,
                likes: data.likes || null,
                improvements: data.improvements || null,
                testimonial_permission: data.testimonialPermission || false,
                status: 'new',
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating feedback:', error)
            return NextResponse.json({ error: error.message, success: false }, { status: 500 })
        }

        // Check if this is an invited customer (has invite token)
        let voucherSent = false
        let voucherDebug = ''
        const isInvited = !!data.inviteToken
        
        if (isInvited && data.rating >= 4) {
            console.log('=== VOUCHER CHECK START (INVITED USER) ===')
            console.log('Invite token:', data.inviteToken)
            console.log('Email from form:', data.email)
            console.log('Rating:', data.rating)
            
            // Find customer by invite token
            const { data: customer, error: customerError } = await supabase
                .from('customers')
                .select('id, name, email, feedback_voucher_code, voucher_sent_at, feedback_invite_token')
                .eq('feedback_invite_token', data.inviteToken)
                .maybeSingle()

            console.log('Customer lookup by token result:', customer)
            console.log('Customer lookup error:', customerError)

            if (customer) {
                // Check if email matches
                const emailMatches = customer.email.toLowerCase() === data.email.trim().toLowerCase()
                console.log('Email match check:', customer.email, 'vs', data.email, '=', emailMatches)
                
                if (!emailMatches) {
                    voucherDebug = 'email_mismatch'
                    console.log('Email does not match! Expected:', customer.email, 'Got:', data.email)
                } else if (!customer.feedback_voucher_code) {
                    voucherDebug = 'no_voucher_code'
                    console.log('No voucher code for this customer')
                } else if (customer.voucher_sent_at) {
                    voucherDebug = 'already_sent'
                    console.log('Voucher already sent at:', customer.voucher_sent_at)
                } else {
                    // Send voucher email
                    console.log('Sending voucher email with code:', customer.feedback_voucher_code)
                    const sent = await sendVoucherEmail(
                        data.email,
                        data.name || customer.name,
                        customer.feedback_voucher_code
                    )

                    if (sent) {
                        // Mark voucher as sent
                        await supabase
                            .from('customers')
                            .update({ voucher_sent_at: new Date().toISOString() })
                            .eq('id', customer.id)
                        voucherSent = true
                        voucherDebug = 'sent'
                        console.log('Voucher email sent successfully!')
                    } else {
                        voucherDebug = 'send_failed'
                        console.log('Failed to send voucher email')
                    }
                }
            } else {
                voucherDebug = 'invalid_token'
                console.log('Customer NOT found with invite token:', data.inviteToken)
            }
            console.log('=== VOUCHER CHECK END === Result:', voucherDebug || 'sent')
        } else if (isInvited && data.rating < 4) {
            voucherDebug = 'low_rating'
            console.log('Invited user but low rating:', data.rating)
        } else if (!isInvited) {
            // Regular visitor - no voucher expectation
            voucherDebug = 'not_invited'
            console.log('Regular visitor feedback - no invite token')
        }

        // Create notification (ignore errors)
        try {
            await supabase.from('notifications').insert({
                type: 'feedback',
                title: 'Feedback Baru',
                message: `${data.name ? data.name + ' - ' : ''}Rating ${data.rating}/5 untuk ${data.templateName || 'Template'}`,
                link: '/admin/feedback',
            })
        } catch {
            // Ignore notification errors
        }

        return NextResponse.json({ feedback, success: true, voucherSent, voucherDebug, isInvited })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Gagal mengirim feedback. Silakan coba lagi.', success: false }, { status: 500 })
    }
}
