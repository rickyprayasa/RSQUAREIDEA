import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPaymentMethods } from '@/lib/duitku'

export async function POST(request: NextRequest) {
    try {
        const { amount } = await request.json()

        if (!amount || amount < 10000) {
            return NextResponse.json(
                { error: 'Minimum amount is Rp 10.000' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get Duitku config from settings
        const { data: settings } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['duitku_merchant_code', 'duitku_api_key', 'duitku_production'])

        const config: Record<string, string> = {}
        settings?.forEach(s => { config[s.key] = s.value || '' })

        if (!config.duitku_merchant_code || !config.duitku_api_key) {
            return NextResponse.json(
                { error: 'Duitku not configured' },
                { status: 500 }
            )
        }

        const result = await getPaymentMethods(
            {
                merchantCode: config.duitku_merchant_code,
                apiKey: config.duitku_api_key,
                isProduction: config.duitku_production === 'true',
            },
            amount
        )

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({ paymentMethods: result.paymentMethods })
    } catch (error) {
        console.error('Error getting payment methods:', error)
        return NextResponse.json(
            { error: 'Failed to get payment methods' },
            { status: 500 }
        )
    }
}
