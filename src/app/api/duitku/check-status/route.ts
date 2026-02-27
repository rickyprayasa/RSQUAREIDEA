import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
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

        const supabase = await createAdminClient()

        // First, check order status from our database (updated by callback)
        const { data: order } = await supabase
            .from('orders')
            .select('id, status, amount, customer_name, customer_email')
            .eq('order_number', orderNumber)
            .single()

        // If order is already completed in our DB (callback already processed), return immediately
        if (order && order.status === 'completed') {
            // Fetch order items with download URLs
            const { data: orderItems } = await supabase
                .from('order_items')
                .select('product_id, product_title, price, products(title, download_url, image, slug)')
                .eq('order_id', order.id)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const items = orderItems?.map((item: any) => ({
                id: item.product_id,
                title: item.product_title || item.products?.title || 'Template',
                downloadUrl: item.products?.download_url || null,
                image: item.products?.image || null,
                price: item.price || 0,
            })) || []

            return NextResponse.json({
                success: true,
                status: 'completed',
                statusCode: '00',
                statusMessage: 'SUCCESS',
                amount: order.amount?.toString(),
                items,
            })
        }

        // If not completed in DB, check with Duitku API
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

        const status = statusMap[result.data?.statusCode || '01'] || 'pending'

        // If Duitku says completed but our DB hasn't been updated yet (rare race condition),
        // update DB and return items
        if (status === 'completed' && order) {
            await supabase
                .from('orders')
                .update({ status: 'completed' })
                .eq('order_number', orderNumber)

            const { data: orderItems } = await supabase
                .from('order_items')
                .select('product_id, product_title, price, products(title, download_url, image, slug)')
                .eq('order_id', order.id)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const items = orderItems?.map((item: any) => ({
                id: item.product_id,
                title: item.product_title || item.products?.title || 'Template',
                downloadUrl: item.products?.download_url || null,
                image: item.products?.image || null,
                price: item.price || 0,
            })) || []

            return NextResponse.json({
                success: true,
                status: 'completed',
                statusCode: result.data?.statusCode,
                statusMessage: result.data?.statusMessage,
                reference: result.data?.reference,
                amount: result.data?.amount,
                items,
            })
        }

        return NextResponse.json({
            success: true,
            status,
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
