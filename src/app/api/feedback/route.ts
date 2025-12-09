import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function sendVoucherEmail(email: string, name: string, voucherCode: string) {
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = parseInt(process.env.SMTP_PORT || '465')
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM || smtpUser

    if (!smtpHost || !smtpUser || !smtpPass) {
        console.error('SMTP not configured')
        return false
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
    })

    const emailBody = `Halo ${name},

Terima kasih sudah memberikan feedback untuk RSQUARE!

Sebagai apresiasi, berikut adalah kode voucher untuk mendapatkan **1 Template Google Sheets GRATIS**:

🎁 Kode Voucher: ${voucherCode}

Cara menggunakan:
1. Pilih template yang Kamu inginkan di https://www.rsquareidea.my.id/templates
2. Klik "Beli Sekarang"
3. Masukkan kode voucher di halaman checkout
4. Nikmati template gratis Kamu!

Voucher ini berlaku untuk 1 template dan hanya bisa digunakan 1 kali.

Terima kasih atas dukungan Kamu!

Salam hangat,
Tim RSQUARE`

    try {
        await transporter.sendMail({
            from: smtpFrom,
            to: email,
            subject: 'Kode Voucher Template Gratis dari RSQUARE 🎁',
            text: emailBody,
            html: emailBody
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
        })
        return true
    } catch (err) {
        console.error('Failed to send voucher email:', err)
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

        // Check if customer has pending voucher and rating is good (4-5)
        let voucherSent = false
        if (data.email && data.rating >= 4) {
            const { data: customer } = await supabase
                .from('customers')
                .select('id, name, feedback_voucher_code, feedback_email_sent_at')
                .eq('email', data.email)
                .not('feedback_voucher_code', 'is', null)
                .single()

            if (customer?.feedback_voucher_code) {
                // Check if voucher email already sent (voucher_sent_at field)
                const { data: existingVoucher } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('email', data.email)
                    .not('voucher_sent_at', 'is', null)
                    .single()

                if (!existingVoucher) {
                    // Send voucher email
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
                    }
                }
            }
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

        return NextResponse.json({ feedback, success: true, voucherSent })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Gagal mengirim feedback. Silakan coba lagi.', success: false }, { status: 500 })
    }
}
