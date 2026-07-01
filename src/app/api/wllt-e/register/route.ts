import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

// Handle CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

// Public API endpoint for WLLT-e app registration
// No auth required — uses service role key to write to customers table
export async function POST(request: NextRequest) {
    try {
        // Simple origin/key validation
        const apiKey = request.headers.get('x-api-key')
        if (apiKey !== 'wllt-e-rsquare-2026') {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 403, headers: corsHeaders })
        }

        const data = await request.json()
        const { username, email } = data

        if (!username || !email) {
            return NextResponse.json({ error: 'Username dan email wajib diisi' }, { status: 400, headers: corsHeaders })
        }

        const supabase = await createAdminClient()
        const PRODUCT_TITLE = 'WLLT-e Smart Financial Dashboard'
        const PRODUCT_ID = 4 // As seen in WLLT-e Smart Financial Dashboard order ID if needed, but we can leave it null if unknown

        // Create Order Function
        const createFreeOrder = async (customerName: string, customerEmail: string) => {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
            const orderNumber = `RSQ-${dateStr}-${randomStr}`

            await supabase.from('orders').insert({
                order_number: orderNumber,
                customer_email: customerEmail,
                customer_name: customerName,
                product_title: PRODUCT_TITLE,
                amount: 0,
                payment_method: 'free',
                status: 'selesai',
                notes: JSON.stringify([{ productTitle: PRODUCT_TITLE, price: 0 }])
            })
        }

        // Check if customer with this email already exists
        const { data: existing } = await supabase
            .from('customers')
            .select('id, name, purchased_products, total_orders')
            .eq('email', email)
            .single()

        if (existing) {
            // Check if they already have this product
            const currentProducts = existing.purchased_products || []
            const hasProduct = currentProducts.includes(PRODUCT_TITLE)

            if (!hasProduct) {
                await supabase
                    .from('customers')
                    .update({ 
                        last_activity_at: new Date().toISOString(),
                        purchased_products: [...currentProducts, PRODUCT_TITLE],
                        total_orders: (existing.total_orders || 0) + 1
                    })
                    .eq('id', existing.id)
                
                await createFreeOrder(existing.name || username, email)
            } else {
                await supabase
                    .from('customers')
                    .update({ last_activity_at: new Date().toISOString() })
                    .eq('id', existing.id)
            }

            return NextResponse.json({
                success: true,
                message: 'Customer already exists, updated activity and products',
                customerId: existing.id,
                isExisting: true,
            }, { headers: corsHeaders })
        }

        // Create new customer entry
        const { data: customer, error } = await supabase
            .from('customers')
            .insert({
                name: username,
                email: email,
                phone: null,
                source: 'wllt_e_app',
                notes: `Registered via WLLT-e Capacitor App`,
                tags: ['new_customer'],
                status: 'active',
                purchased_products: [PRODUCT_TITLE],
                total_orders: 1,
                total_spent: 0,
                last_activity_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating WLLT-e customer:', error)
            return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
        }

        // Create order for new customer
        await createFreeOrder(username, email)

        return NextResponse.json({
            success: true,
            message: 'Customer registered successfully',
            customerId: customer.id,
            isExisting: false,
        }, { headers: corsHeaders })
    } catch (error) {
        console.error('WLLT-e register error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
    }
}

