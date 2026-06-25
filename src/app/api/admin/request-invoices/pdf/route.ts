import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoicePDF } from '@/lib/invoice-pdf'
import QRCode from 'qrcode'
import { generateDynamicQRIS } from '@/lib/qris-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const invoiceId = request.nextUrl.searchParams.get('id')

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
        }

        const { data: invoice, error: fetchError } = await supabase
            .from('request_invoices')
            .select('*')
            .eq('id', parseInt(invoiceId))
            .single()

        if (fetchError || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Fetch active payment methods
        const { data: payments } = await supabase
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

        // Fetch contact email and phone settings
        const { data: settingsData } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['contact_email', 'contact_phone', 'qris_enabled', 'qris_merchant_string'])

        const companySettings: Record<string, string> = {}
        settingsData?.forEach(s => { if (s.value) companySettings[s.key] = s.value })

        let dynamicQrisImage: string | undefined
        if (companySettings.qris_enabled === 'true' && companySettings.qris_merchant_string && invoice.total > 0) {
            try {
                const dynamicQrisStr = generateDynamicQRIS(companySettings.qris_merchant_string, invoice.total)
                dynamicQrisImage = await QRCode.toDataURL(dynamicQrisStr, {
                    width: 300,
                    margin: 2,
                    color: { dark: '#000000', light: '#FFFFFF' },
                    errorCorrectionLevel: 'M'
                })
            } catch (err) {
                console.error('Failed to generate dynamic QRIS for PDF', err)
            }
        }

        const pdfBuffer = generateInvoicePDF(invoice, paymentMethods, {
            phone: companySettings.contact_phone,
            email: companySettings.contact_email
        }, dynamicQrisImage)

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${invoice.invoice_number}.pdf"`,
                'Cache-Control': 'no-cache',
            },
        })
    } catch (error) {
        console.error('Error generating PDF:', error)
        return NextResponse.json({
            error: 'Failed to generate PDF',
            details: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 })
    }
}
