import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

interface ImportCustomer {
    name: string
    email: string
    phone?: string
    source?: string
    products?: string
    notes?: string
    amount?: string | number
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { customers } = body as { customers: ImportCustomer[] }

        if (!customers || !Array.isArray(customers) || customers.length === 0) {
            return NextResponse.json({ error: 'Data pelanggan tidak valid' }, { status: 400 })
        }

        const supabase = await createClient()

        let imported = 0
        let skipped = 0
        let errors: string[] = []

        for (const customer of customers) {
            try {
                if (!customer.name || !customer.email) {
                    skipped++
                    errors.push(`Baris dilewati: nama atau email kosong`)
                    continue
                }

                // Check if customer already exists
                const { data: existing } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('email', customer.email.trim().toLowerCase())
                    .single()

                if (existing) {
                    // Update existing customer
                    const updateData: Record<string, unknown> = {
                        name: customer.name.trim(),
                        last_activity_at: new Date().toISOString(),
                    }
                    
                    if (customer.phone) updateData.phone = customer.phone.trim()
                    if (customer.source) updateData.source = customer.source.trim()
                    if (customer.notes) updateData.notes = customer.notes.trim()
                    if (customer.products) {
                        updateData.purchased_products = customer.products.split(',').map(p => p.trim()).filter(Boolean)
                    }

                    await supabase
                        .from('customers')
                        .update(updateData)
                        .eq('id', existing.id)

                    // Add transaction if amount provided
                    if (customer.amount && Number(customer.amount) > 0) {
                        await supabase
                            .from('customer_transactions')
                            .insert({
                                customer_id: existing.id,
                                product_name: customer.products || 'Import',
                                amount: Number(customer.amount),
                                platform: customer.source || 'import',
                                purchase_date: new Date().toISOString().split('T')[0],
                                notes: 'Imported from CSV',
                            })
                    }

                    imported++
                } else {
                    // Create new customer
                    const { data: newCustomer, error: insertError } = await supabase
                        .from('customers')
                        .insert({
                            name: customer.name.trim(),
                            email: customer.email.trim().toLowerCase(),
                            phone: customer.phone?.trim() || null,
                            source: customer.source?.trim() || 'import',
                            notes: customer.notes?.trim() || null,
                            purchased_products: customer.products ? customer.products.split(',').map(p => p.trim()).filter(Boolean) : [],
                            total_orders: customer.amount ? 1 : 0,
                            total_spent: Number(customer.amount) || 0,
                            status: 'active',
                            last_activity_at: new Date().toISOString(),
                        })
                        .select()
                        .single()

                    if (insertError) throw insertError

                    // Add transaction if amount provided
                    if (newCustomer && customer.amount && Number(customer.amount) > 0) {
                        await supabase
                            .from('customer_transactions')
                            .insert({
                                customer_id: newCustomer.id,
                                product_name: customer.products || 'Import',
                                amount: Number(customer.amount),
                                platform: customer.source || 'import',
                                purchase_date: new Date().toISOString().split('T')[0],
                                notes: 'Imported from CSV',
                            })
                    }

                    imported++
                }
            } catch (err) {
                skipped++
                errors.push(`Error untuk ${customer.email}: ${err instanceof Error ? err.message : 'Unknown error'}`)
            }
        }

        return NextResponse.json({
            success: true,
            imported,
            skipped,
            total: customers.length,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined, // Only return first 5 errors
        })
    } catch (error) {
        console.error('Error importing customers:', error)
        return NextResponse.json({ error: 'Failed to import customers' }, { status: 500 })
    }
}
