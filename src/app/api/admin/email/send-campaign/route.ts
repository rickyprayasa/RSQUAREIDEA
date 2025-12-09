import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'
import nodemailer from 'nodemailer'

interface Customer {
    id: number
    name: string
    email: string
    products?: string[]
}

function generateVoucherCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'FEEDBACK-'
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

function getCampaignEmailHtml(customerName: string, feedbackUrl: string, products?: string[]): string {
    const productsHtml = products && products.length > 0 
        ? `
            <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h4 style="color: #1e40af; font-size: 14px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">📦 Template yang Kamu Beli:</h4>
                <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                    ${products.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
        `
        : ''

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback Request</title>
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
                Halo <strong>${customerName}</strong>,
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Terima kasih sudah mempercayai RSQUARE untuk kebutuhan template spreadsheet Kamu!
            </p>

            ${productsHtml}

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Kami ingin mendengar pengalaman Kamu. Sebagai apresiasi, kami akan memberikan <strong style="color: #f97316;">1 Template Google Sheets GRATIS</strong> setelah Kamu memberikan feedback!
            </p>

            <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
                <h3 style="color: #9a3412; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">🎁 Dapatkan Template Gratis!</h3>
                <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">
                    Berikan feedback Kamu dan dapatkan kode voucher untuk 1 template gratis (berlaku untuk semua template berbayar)
                </p>
                <a href="${feedbackUrl}" style="display: inline-block; background-color: #f97316; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Berikan Feedback Sekarang
                </a>
            </div>

            <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h4 style="color: #374151; font-size: 14px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">📝 Cara Mendapatkan Template Gratis:</h4>
                <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                    <li>Klik tombol "Berikan Feedback Sekarang"</li>
                    <li>Isi form feedback dengan rating dan ulasan Kamu</li>
                    <li>Kode voucher akan dikirim ke email ini</li>
                    <li>Gunakan kode voucher saat checkout</li>
                </ol>
            </div>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
                Terima kasih atas dukungan Kamu! 🙏
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

                // Generate HTML email with products
                const htmlEmail = getCampaignEmailHtml(customer.name, feedbackUrl, customer.products)
                
                // Plain text fallback with products
                const productsText = customer.products && customer.products.length > 0 
                    ? `\n\nTemplate yang Kamu beli:\n${customer.products.map(p => `- ${p}`).join('\n')}\n` 
                    : ''
                const textEmail = `Halo ${customer.name},\n\nTerima kasih sudah mempercayai RSQUARE!${productsText}\n\nKami ingin mendengar pengalaman Kamu. Sebagai apresiasi, kami akan memberikan 1 Template Google Sheets GRATIS setelah Kamu memberikan feedback!\n\nBerikan feedback di: ${feedbackUrl}\n\nSetelah mengisi feedback dengan rating bagus, kode voucher akan dikirim ke email Kamu.\n\nTerima kasih!\nTim RSQUARE`

                // Send email
                await transporter.sendMail({
                    from: smtpFrom,
                    to: customer.email,
                    subject: subject,
                    text: textEmail,
                    html: htmlEmail,
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
