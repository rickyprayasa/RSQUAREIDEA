import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const supabase = await createClient()

        const { data: payment, error } = await supabase
            .from('payment_settings')
            .select('*')
            .eq('id', parseInt(id))
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        // Transform to camelCase
        const transformed = {
            id: payment.id,
            type: payment.type,
            name: payment.name,
            isActive: payment.is_active,
            externalUrl: payment.external_url,
            bankName: payment.bank_name,
            accountNumber: payment.account_number,
            accountName: payment.account_name,
            qrCodeImage: payment.qr_code_image,
            instructions: payment.instructions,
        }

        return NextResponse.json({ payment: transformed })
    } catch (error) {
        console.error('Error fetching payment:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await request.json()
        const supabase = await createClient()

        const { data: payment, error } = await supabase
            .from('payment_settings')
            .update({
                type: data.type,
                name: data.name,
                is_active: data.isActive,
                external_url: data.externalUrl,
                bank_name: data.bankName,
                account_number: data.accountNumber,
                account_name: data.accountName,
                qr_code_image: data.qrCodeImage,
                instructions: data.instructions,
            })
            .eq('id', parseInt(id))
            .select()
            .single()

        if (error) {
            console.error('Error updating payment:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ payment })
    } catch (error) {
        console.error('Error updating payment:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const supabase = await createClient()
        
        const { error } = await supabase
            .from('payment_settings')
            .delete()
            .eq('id', parseInt(id))

        if (error) {
            console.error('Error deleting payment:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting payment:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
