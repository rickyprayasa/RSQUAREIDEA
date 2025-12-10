import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTransaction } from '@/lib/duitku'
import { notifyNewOrder } from '@/lib/notifications'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        const {
            orderNumber,
            paymentMethod,
            totalAmount,
            customerName,
            customerEmail,
            customerPhone,
            items,
        } = data

        if (!orderNumber || !paymentMethod || !totalAmount || !customerName || !customerEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
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

        // Get base URL for callback and return
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rsquareidea.my.id'

        // Create transaction with Duitku
        const result = await createTransaction(
            {
                merchantCode: config.duitku_merchant_code,
                apiKey: config.duitku_api_key,
                isProduction: config.duitku_production === 'true',
            },
            {
                merchantOrderId: orderNumber,
                paymentAmount: totalAmount,
                paymentMethod: paymentMethod,
                productDetails: items?.map((i: { productTitle: string }) => i.productTitle).join(', ') || 'Template RSQUARE',
                customerName: customerName,
                email: customerEmail,
                phoneNumber: customerPhone,
                callbackUrl: `${baseUrl}/api/duitku/callback`,
                returnUrl: `${baseUrl}/checkout?status=check&order=${orderNumber}`,
                expiryPeriod: 1440, // 24 hours
                itemDetails: items?.map((i: { productTitle: string; price: number }) => ({
                    name: i.productTitle,
                    price: i.price,
                    quantity: 1,
                })),
            }
        )

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        // Save order to database
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                customer_email: customerEmail,
                customer_name: customerName,
                customer_phone: customerPhone || null,
                product_id: items?.[0]?.productId ? parseInt(items[0].productId) : null,
                product_title: items?.map((i: { productTitle: string }) => i.productTitle).join(', '),
                amount: totalAmount,
                payment_method: `duitku_${paymentMethod}`,
                status: 'pending',
                notes: JSON.stringify({
                    items,
                    duitku_reference: result.data?.reference,
                    payment_url: result.data?.paymentUrl,
                    va_number: result.data?.vaNumber,
                }),
            })
            .select()
            .single()

        if (orderError) {
            console.error('Error saving order:', orderError)
        }

        // Insert order items
        if (order && items && items.length > 0) {
            const orderItems = items.map((item: { productId: string; productTitle: string; price: number }) => ({
                order_id: order.id,
                product_id: parseInt(item.productId),
                product_title: item.productTitle,
                price: item.price,
            }))

            await supabase.from('order_items').insert(orderItems)
        }

        // Send Telegram notification
        notifyNewOrder({
            id: order?.id || 0,
            customerName: customerName,
            email: customerEmail,
            productTitle: items?.map((i: { productTitle: string }) => i.productTitle).join(', ') || 'Template',
            amount: totalAmount,
        }).catch(console.error)

        return NextResponse.json({
            success: true,
            paymentUrl: result.data?.paymentUrl,
            reference: result.data?.reference,
            vaNumber: result.data?.vaNumber,
            qrString: result.data?.qrString,
        })
    } catch (error) {
        console.error('Error creating Duitku transaction:', error)
        return NextResponse.json(
            { error: 'Failed to create transaction' },
            { status: 500 }
        )
    }
}
