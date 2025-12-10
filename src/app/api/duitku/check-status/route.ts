import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkTransactionStatus } from '@/lib/duitku'

export async function POST(request: NextRequest) {
    try {
        const { orderNumber } = await request.json()

        if (!orderNumber) {
            return NextResponse.json(
                { error: 'Order number is required' },
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

        const result = await checkTransactionStatus(
            {
                merchantCode: config.duitku_merchant_code,
                apiKey: config.duitku_api_key,
                isProduction: config.duitku_production === 'true',
            },
            orderNumber
        )

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        // Status codes: 00 = Success, 01 = Pending, 02 = Canceled/Expired
        const statusMap: Record<string, string> = {
            '00': 'completed',
            '01': 'pending',
            '02': 'cancelled',
        }

        return NextResponse.json({
            success: true,
            status: statusMap[result.data?.statusCode || '01'] || 'pending',
            statusCode: result.data?.statusCode,
            statusMessage: result.data?.statusMessage,
            reference: result.data?.reference,
            amount: result.data?.amount,
        })
    } catch (error) {
        console.error('Error checking Duitku status:', error)
        return NextResponse.json(
            { error: 'Failed to check transaction status' },
            { status: 500 }
        )
    }
}
