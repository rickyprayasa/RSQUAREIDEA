import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: payments, error } = await supabase
            .from('payment_settings')
            .select('*')
            .eq('is_active', true)

        if (error) {
            console.error('Error fetching payments:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Transform snake_case to camelCase
        const transformedPayments = payments?.map(p => ({
            id: p.id,
            type: p.type,
            name: p.name,
            isActive: p.is_active,
            externalUrl: p.external_url,
            bankName: p.bank_name,
            accountNumber: p.account_number,
            accountName: p.account_name,
            qrCodeImage: p.qr_code_image,
            instructions: p.instructions,
        }))

        return NextResponse.json({ payments: transformedPayments })
    } catch (error) {
        console.error('Error fetching payments:', error)
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }
}
