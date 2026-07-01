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

        // Check if customer with this email already exists
        const { data: existing } = await supabase
            .from('customers')
            .select('id, name')
            .eq('email', email)
            .single()

        if (existing) {
            // Update last_activity_at for returning user
            await supabase
                .from('customers')
                .update({ last_activity_at: new Date().toISOString() })
                .eq('id', existing.id)

            return NextResponse.json({
                success: true,
                message: 'Customer already exists, updated activity',
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
                total_orders: 0,
                total_spent: 0,
                last_activity_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating WLLT-e customer:', error)
            return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
        }

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

