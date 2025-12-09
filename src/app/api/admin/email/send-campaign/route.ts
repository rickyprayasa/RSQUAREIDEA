import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'
import nodemailer from 'nodemailer'

interface Customer {
    id: number
    name: string
    email: string
}

function generateVoucherCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'FEEDBACK-'
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { customers, subject, template } = await request.json()

        if (!customers || customers.length === 0) {
            return NextResponse.json({ error: 'Tidak ada pelanggan yang dipilih' }, { status: 400 })
        }

        // Check SMTP configuration
        const smtpHost = process.env.SMTP_HOST
        const smtpPort = parseInt(process.env.SMTP_PORT || '465')
        const smtpUser = process.env.SMTP_USER
        const smtpPass = process.env.SMTP_PASS
        const smtpFrom = process.env.SMTP_FROM || smtpUser

        if (!smtpHost || !smtpUser || !smtpPass) {
            return NextResponse.json({ 
                error: 'Konfigurasi SMTP belum lengkap. Tambahkan SMTP_HOST, SMTP_USER, SMTP_PASS di .env.local' 
            }, { status: 500 })
        }

        const supabase = await createClient()
        const feedbackUrl = process.env.NEXT_PUBLIC_SITE_URL 
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/feedback` 
            : 'https://www.rsquareidea.my.id/feedback'

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        })

        let sentCount = 0
        const errors: string[] = []

        for (const customer of customers as Customer[]) {
            try {
                // Generate unique voucher code
                const voucherCode = generateVoucherCode()

                // Create voucher in database (100% discount, 1 use)
                const { error: voucherError } = await supabase
                    .from('vouchers')
                    .insert({
                        code: voucherCode,
                        discount_type: 'percentage',
                        discount_value: 100,
                        min_purchase: 0,
                        max_discount: null,
                        usage_limit: 1,
                        used_count: 0,
                        valid_from: new Date().toISOString(),
                        valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
                        is_active: true,
                    })

                if (voucherError) {
                    console.error('Error creating voucher:', voucherError)
                    errors.push(`Gagal membuat voucher untuk ${customer.email}`)
                    continue
                }

                // Replace template variables (voucher code NOT included - sent after feedback)
                const emailBody = template
                    .replace(/{nama}/g, customer.name)
                    .replace(/{feedback_url}/g, feedbackUrl)

                // Send email
                await transporter.sendMail({
                    from: smtpFrom,
                    to: customer.email,
                    subject: subject,
                    text: emailBody,
                    html: emailBody
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                })

                // Update customer record
                await supabase
                    .from('customers')
                    .update({
                        feedback_email_sent_at: new Date().toISOString(),
                        feedback_voucher_code: voucherCode,
                    })
                    .eq('id', customer.id)

                sentCount++
            } catch (err) {
                console.error(`Error sending to ${customer.email}:`, err)
                errors.push(`Gagal mengirim ke ${customer.email}`)
            }
        }

        return NextResponse.json({ 
            sent: sentCount, 
            total: customers.length,
            errors: errors.length > 0 ? errors : undefined,
        })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
    }
}
