import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { data: payments, error } = await supabase
            .from('payment_settings')
            .select('*')
            .order('created_at', { ascending: false })

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
            createdAt: p.created_at,
            updatedAt: p.updated_at,
        }))

        return NextResponse.json({ payments: transformedPayments })
    } catch (error) {
        console.error('Error fetching payments:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const supabase = await createClient()
        
        const { data: payment, error } = await supabase
            .from('payment_settings')
            .insert({
                type: data.type,
                name: data.name,
                is_active: data.isActive ?? true,
                external_url: data.externalUrl,
                bank_name: data.bankName,
                account_number: data.accountNumber,
                account_name: data.accountName,
                qr_code_image: data.qrCodeImage,
                instructions: data.instructions,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating payment:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ payment })
    } catch (error) {
        console.error('Error creating payment:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
