import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const { code, totalAmount } = await request.json()
        
        if (!code) {
            return NextResponse.json({ error: 'Kode voucher harus diisi' }, { status: 400 })
        }

        const supabase = await createClient()

        // Find voucher by code
        const { data: voucher, error } = await supabase
            .from('vouchers')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .eq('is_active', true)
            .single()

        if (error || !voucher) {
            return NextResponse.json({ 
                valid: false, 
                error: 'Kode voucher tidak valid atau sudah tidak aktif' 
            }, { status: 404 })
        }

        // Check validity period
        const now = new Date()
        if (voucher.valid_from && new Date(voucher.valid_from) > now) {
            return NextResponse.json({ 
                valid: false, 
                error: 'Voucher belum dapat digunakan' 
            }, { status: 400 })
        }

        if (voucher.valid_until && new Date(voucher.valid_until) < now) {
            return NextResponse.json({ 
                valid: false, 
                error: 'Voucher sudah kadaluarsa' 
            }, { status: 400 })
        }

        // Check usage limit
        if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
            return NextResponse.json({ 
                valid: false, 
                error: 'Voucher sudah mencapai batas penggunaan' 
            }, { status: 400 })
        }

        // Check minimum purchase
        if (voucher.min_purchase && totalAmount < voucher.min_purchase) {
            return NextResponse.json({ 
                valid: false, 
                error: `Minimum pembelian Rp ${voucher.min_purchase.toLocaleString('id-ID')} untuk voucher ini` 
            }, { status: 400 })
        }

        // Calculate discount
        let discountAmount = 0
        if (voucher.discount_type === 'percentage') {
            discountAmount = (totalAmount * voucher.discount_value) / 100
            // Apply max discount cap if exists
            if (voucher.max_discount && discountAmount > voucher.max_discount) {
                discountAmount = voucher.max_discount
            }
        } else {
            // Fixed discount
            discountAmount = voucher.discount_value
        }

        // Ensure discount doesn't exceed total
        if (discountAmount > totalAmount) {
            discountAmount = totalAmount
        }

        return NextResponse.json({
            valid: true,
            voucher: {
                code: voucher.code,
                discountType: voucher.discount_type,
                discountValue: voucher.discount_value,
                maxDiscount: voucher.max_discount,
            },
            discountAmount: Math.round(discountAmount),
            finalAmount: Math.round(totalAmount - discountAmount),
        })

    } catch (error) {
        console.error('Error validating voucher:', error)
        return NextResponse.json({ error: 'Gagal memvalidasi voucher' }, { status: 500 })
    }
}
