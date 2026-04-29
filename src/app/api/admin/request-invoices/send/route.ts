import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'
import { generateInvoicePDF } from '@/lib/invoice-pdf'

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

        // Fetch active payment methods for PDF
        const { data: payments } = await adminSupabase
            .from('payment_settings')
            .select('name, bank_name, account_number, account_name')
            .eq('is_active', true)
            .eq('type', 'internal')

        const paymentMethods = (payments || []).map(p => ({
            name: p.name,
            bankName: p.bank_name,
            accountNumber: p.account_number,
            accountName: p.account_name,
        }))

        // Generate PDF attachment
        const pdfBuffer = generateInvoicePDF(invoice, paymentMethods)

        // Build items table HTML
        const items = (invoice.items || []) as { name: string; qty: number; price: number }[]
        const itemsHtml = items.map((item, idx) => `
            <tr>
                <td style="padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; text-align: center; font-size: 13px;">${idx + 1}</td>
                <td style="padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500; font-size: 14px;">${item.name}</td>
                <td style="padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #4b5563; text-align: center; font-size: 13px;">${item.qty}</td>
                <td style="padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #4b5563; text-align: right; font-size: 13px;">Rp ${item.price.toLocaleString('id-ID')}</td>
                <td style="padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; text-align: right; font-size: 14px;">Rp ${(item.qty * item.price).toLocaleString('id-ID')}</td>
            </tr>
        `).join('')

        const dueDateStr = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'
        const createdDateStr = new Date(invoice.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 640px; margin: 0 auto; background-color: #f3f4f6;">
        <!-- Spacer -->
        <div style="height: 40px;"></div>

        <!-- Main Card -->
        <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 0 16px;">

            <!-- Top Geometric Bars (Matching PDF) -->
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
                                <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: 1px;">INVOICE</h1>
                                <div style="color: #ffffff; font-size: 14px; font-weight: 700; margin-top: 4px;">${invoice.invoice_number}</div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Dark Date Bar beneath the header -->
            <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="background-color: #1f2937; padding: 12px 40px; text-align: right; color: rgba(255,255,255,0.7); font-size: 12px;">
                        Tanggal: <strong style="color: #ffffff; margin-left: 4px;">${createdDateStr}</strong>
                    </td>
                </tr>
            </table>

            <!-- Content -->
            <div style="padding: 32px 40px 40px;">
                <!-- Greeting -->
                <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 8px;">
                    Halo <strong style="color: #111827;">${invoice.customer_name}</strong>,
                </p>
                <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 28px;">
                    Terima kasih atas kepercayaan Anda. Berikut adalah invoice untuk layanan yang telah kami sediakan. Invoice ini juga dilampirkan dalam format PDF untuk arsip Anda.
                </p>

                <!-- Customer & Invoice Info -->
                <table cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 28px;">
                    <tr>
                        <td style="width: 50%; vertical-align: top; padding-right: 16px;">
                            <p style="color: #9ca3af; font-size: 10px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Pelanggan</p>
                            <p style="color: #111827; font-size: 15px; font-weight: 600; margin: 0 0 4px;">${invoice.customer_name}</p>
                            <p style="color: #6b7280; font-size: 13px; margin: 0 0 2px;">${invoice.customer_email}</p>
                            ${invoice.customer_phone ? `<p style="color: #6b7280; font-size: 13px; margin: 0;">${invoice.customer_phone}</p>` : ''}
                        </td>
                        <td style="width: 50%; vertical-align: top; padding-left: 16px;">
                            <p style="color: #9ca3af; font-size: 10px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Detail Invoice</p>
                            <table cellpadding="0" cellspacing="0" style="width: 100%;">
                                <tr>
                                    <td style="color: #6b7280; font-size: 13px; padding: 2px 0;">Jatuh Tempo</td>
                                    <td style="color: #111827; font-size: 13px; padding: 2px 0; text-align: right; font-weight: 500;">${dueDateStr}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>


                <!-- Items Table -->
                <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 4px;">
                    <thead>
                        <tr style="background-color: #1f2937;">
                            <th style="padding: 14px 16px; text-align: center; color: #ffffff; font-size: 12px; font-weight: 600; border-radius: 8px 0 0 0; width: 40px;">#</th>
                            <th style="padding: 14px 16px; text-align: left; color: #ffffff; font-size: 12px; font-weight: 600;">Item</th>
                            <th style="padding: 14px 16px; text-align: center; color: #ffffff; font-size: 12px; font-weight: 600; width: 50px;">Qty</th>
                            <th style="padding: 14px 16px; text-align: right; color: #ffffff; font-size: 12px; font-weight: 600;">Harga</th>
                            <th style="padding: 14px 16px; text-align: right; color: #ffffff; font-size: 12px; font-weight: 600; border-radius: 0 8px 0 0;">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <!-- Totals -->
                <div style="border-top: 2px solid #e5e7eb; padding-top: 16px; margin-bottom: 28px;">
                    <table cellpadding="0" cellspacing="0" style="width: 50%; margin-left: auto;">
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                            <td style="padding: 6px 0; text-align: right; color: #111827; font-size: 14px; font-weight: 500;">Rp ${(invoice.subtotal || 0).toLocaleString('id-ID')}</td>
                        </tr>
                        ${invoice.tax_percent > 0 ? `
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Pajak (${invoice.tax_percent}%)</td>
                            <td style="padding: 6px 0; text-align: right; color: #111827; font-size: 14px;">Rp ${(invoice.tax_amount || 0).toLocaleString('id-ID')}</td>
                        </tr>
                        ` : ''}
                        ${invoice.discount > 0 ? `
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Diskon</td>
                            <td style="padding: 6px 0; text-align: right; color: #ef4444; font-size: 14px;">- Rp ${(invoice.discount || 0).toLocaleString('id-ID')}</td>
                        </tr>
                        ` : ''}
                        <tr>
                            <td colspan="2" style="padding: 8px 0 0;"><div style="border-top: 2px solid #111827;"></div></td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0 0; color: #111827; font-size: 18px; font-weight: 800;">TOTAL</td>
                            <td style="padding: 12px 0 0; text-align: right; color: #f97316; font-size: 20px; font-weight: 800;">Rp ${(invoice.total || 0).toLocaleString('id-ID')}</td>
                        </tr>
                    </table>
                </div>

                <!-- Payment Method -->
                <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <p style="color: #9a3412; font-size: 10px; font-weight: 700; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">💳 Metode Pembayaran</p>
                    <table cellpadding="0" cellspacing="0" style="width: 100%;">
                        <tr>
                            <td style="color: #92400e; font-size: 13px; padding: 3px 0; width: 120px;">Bank</td>
                            <td style="color: #78350f; font-size: 14px; padding: 3px 0; font-weight: 600;">Bank BCA</td>
                        </tr>
                        <tr>
                            <td style="color: #92400e; font-size: 13px; padding: 3px 0;">No. Rekening</td>
                            <td style="color: #78350f; font-size: 14px; padding: 3px 0; font-weight: 600;">7690434543</td>
                        </tr>
                        <tr>
                            <td style="color: #92400e; font-size: 13px; padding: 3px 0;">Atas Nama</td>
                            <td style="color: #78350f; font-size: 14px; padding: 3px 0; font-weight: 600;">Ricky Prayasa</td>
                        </tr>
                    </table>
                    <p style="color: #92400e; font-size: 12px; margin: 12px 0 0; font-style: italic;">Pembayaran juga dapat dilakukan melalui QRIS. Hubungi kami untuk detail lebih lanjut.</p>
                </div>

                <!-- Due Date Alert -->
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; text-align: center;">
                    <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 600;">
                        📅 Jatuh Tempo Pembayaran: <strong>${dueDateStr}</strong>
                    </p>
                </div>

                ${invoice.notes ? `
                <!-- Notes -->
                <div style="margin-bottom: 20px;">
                    <p style="color: #9ca3af; font-size: 10px; font-weight: 700; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 1px;">Catatan</p>
                    <p style="color: #4b5563; font-size: 13px; margin: 0; line-height: 1.6;">${invoice.notes}</p>
                </div>
                ` : ''}

                <!-- PDF Notice -->
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; text-align: center;">
                    <p style="color: #1e40af; font-size: 13px; margin: 0;">
                        📎 Invoice dalam format PDF telah dilampirkan di email ini untuk arsip Anda.
                    </p>
                </div>
            </div>

            <!-- Customer Care -->
            <div style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 10px; font-weight: 700; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Customer Care</p>
                <table cellpadding="0" cellspacing="0" style="width: 100%;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">📱 WhatsApp: <a href="https://wa.me/6285659674001" style="color: #f97316; text-decoration: none; font-weight: 500;">+62 856 5967 4001</a></p>
                            <p style="color: #6b7280; font-size: 13px; margin: 0;">📧 Email: <a href="mailto:info@rsquareidea.my.id" style="color: #f97316; text-decoration: none; font-weight: 500;">info@rsquareidea.my.id</a></p>
                        </td>
                        <td style="width: 50%; vertical-align: top; text-align: right;">
                            <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">🌐 <a href="https://www.rsquareidea.my.id" style="color: #f97316; text-decoration: none; font-weight: 500;">www.rsquareidea.my.id</a></p>
                            <p style="color: #6b7280; font-size: 13px; margin: 0;">🕐 Senin - Sabtu, 09:00 - 17:00 WIB</p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Footer -->
            <div style="background-color: #1f2937; padding: 20px 40px; text-align: center;">
                <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0 0 4px;">© ${new Date().getFullYear()} RSQUARE — Solusi Digital & Otomatisasi Bisnis</p>
                <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 0;">Bumi Arum Regency Blok Akasia no.21, Rancaekek, Bandung 40394</p>
            </div>
        </div>

        <!-- Spacer -->
        <div style="height: 40px;"></div>
    </div>
</body>
</html>`

        const textBody = `Invoice ${invoice.invoice_number}\n\nHalo ${invoice.customer_name},\n\nBerikut invoice untuk layanan yang Anda request.\n\nTotal: Rp ${(invoice.total || 0).toLocaleString('id-ID')}\nJatuh Tempo: ${dueDateStr}\n\nMetode Pembayaran:\nBank BCA\nNo. Rekening: 7690434543\nAtas Nama: Ricky Prayasa\n\nCustomer Care:\nWhatsApp: +62 856 5967 4001\nEmail: info@rsquareidea.my.id\n\nSalam,\nTim RSQUARE`

        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: invoice.customer_email,
            subject: `Invoice ${invoice.invoice_number} - RSQUARE`,
            text: textBody,
            html: htmlBody,
            attachments: [
                {
                    filename: `${invoice.invoice_number}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
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
