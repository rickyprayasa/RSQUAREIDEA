import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - List invoices (optional ?request_id=X filter)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const requestId = searchParams.get('request_id')

        let query = supabase
            .from('request_invoices')
            .select('*, template_requests(template_name, name, email)')
            .order('created_at', { ascending: false })

        if (requestId) {
            query = query.eq('request_id', parseInt(requestId))
        }

        const { data: invoices, error } = await query

        if (error) {
            console.error('Error fetching invoices:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ invoices: invoices || [] })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        // Generate invoice number: INV-YYYYMMDD-XXX
        const now = new Date()
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')

        // Get count of invoices today for sequential numbering
        const { count } = await supabase
            .from('request_invoices')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', now.toISOString().slice(0, 10) + 'T00:00:00')
            .lte('created_at', now.toISOString().slice(0, 10) + 'T23:59:59')

        const seq = String((count || 0) + 1).padStart(3, '0')
        const invoiceNumber = `INV-${dateStr}-${seq}`

        // Calculate totals
        const items = data.items || []
        const subtotal = items.reduce((sum: number, item: { qty: number; price: number }) =>
            sum + (item.qty * item.price), 0)
        const taxPercent = data.tax_percent || 0
        const taxAmount = subtotal * (taxPercent / 100)
        const discount = data.discount || 0
        const total = subtotal + taxAmount - discount

        let invoiceResult;

        if (data.id) {
            const { data: updatedInvoice, error } = await supabase
                .from('request_invoices')
                .update({
                    customer_name: data.customer_name,
                    customer_email: data.customer_email,
                    customer_phone: data.customer_phone || null,
                    description: data.description || null,
                    app_type: data.app_type || null,
                    items,
                    subtotal,
                    tax_percent: taxPercent,
                    tax_amount: taxAmount,
                    discount,
                    total,
                    due_date: data.due_date || null,
                    notes: data.notes || null,
                    terms_conditions: data.terms_conditions || null,
                })
                .eq('id', data.id)
                .select()
                .single()

            if (error) {
                console.error('Error updating invoice:', error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            invoiceResult = updatedInvoice;
        } else {
            const { data: newInvoice, error } = await supabase
                .from('request_invoices')
                .insert({
                    request_id: data.request_id,
                    invoice_number: invoiceNumber,
                    customer_name: data.customer_name,
                    customer_email: data.customer_email,
                    customer_phone: data.customer_phone || null,
                    description: data.description || null,
                    app_type: data.app_type || null,
                    items,
                    subtotal,
                    tax_percent: taxPercent,
                    tax_amount: taxAmount,
                    discount,
                    total,
                    due_date: data.due_date || null,
                    notes: data.notes || null,
                    terms_conditions: data.terms_conditions || null,
                    status: 'draft',
                })
                .select()
                .single()
            if (error) {
                console.error('Error creating invoice:', error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            invoiceResult = newInvoice;
        }

        return NextResponse.json({ invoice: invoiceResult })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
    }
}

// PATCH - Update invoice
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const { id, ...updateFields } = data

        if (!id) {
            return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
        }

        // Recalculate totals if items changed
        if (updateFields.items) {
            const items = updateFields.items
            updateFields.subtotal = items.reduce((sum: number, item: { qty: number; price: number }) =>
                sum + (item.qty * item.price), 0)
            if (updateFields.tax_percent !== undefined) {
                updateFields.tax_amount = updateFields.subtotal * (updateFields.tax_percent / 100)
            }
            const taxAmount = updateFields.tax_amount || 0
            const discount = updateFields.discount || 0
            updateFields.total = updateFields.subtotal + taxAmount - discount
        }

        // Handle status transitions
        if (updateFields.status === 'paid') {
            updateFields.paid_at = new Date().toISOString()
        }
        if (updateFields.status === 'sent') {
            updateFields.sent_at = new Date().toISOString()
        }

        const { error } = await supabase
            .from('request_invoices')
            .update(updateFields)
            .eq('id', id)

        if (error) {
            console.error('Error updating invoice:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }
}

// DELETE - Delete invoice
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('request_invoices')
            .delete()
            .eq('id', parseInt(id))

        if (error) {
            console.error('Error deleting invoice:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
    }
}
