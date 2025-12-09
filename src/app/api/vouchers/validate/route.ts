import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const { code, totalAmount } = await request.json()
        
        if (!code) {
            return NextResponse.json({ error: 'Kode voucher harus diisi' }, { status: 400 })
        }

        const supabase = await createClient()
        const inputCode = code.toUpperCase().trim()
        const now = new Date()

        // First, check site_settings voucher (from admin settings page)
        const { data: settingsData } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['voucher_code', 'voucher_discount', 'voucher_active', 'voucher_valid_from', 'voucher_valid_until'])

        if (settingsData && settingsData.length > 0) {
            const settings: Record<string, string> = {}
            settingsData.forEach(s => { settings[s.key] = s.value })

            const settingsVoucherCode = (settings.voucher_code || '').toUpperCase().trim()
            const settingsVoucherActive = settings.voucher_active === 'true'
            const settingsVoucherDiscount = parseFloat(settings.voucher_discount || '0')
            const settingsValidFrom = settings.voucher_valid_from ? new Date(settings.voucher_valid_from) : null
            const settingsValidUntil = settings.voucher_valid_until ? new Date(settings.voucher_valid_until) : null

            // Check if input matches site_settings voucher
            if (settingsVoucherCode && inputCode === settingsVoucherCode) {
                // Check if active
                if (!settingsVoucherActive) {
                    return NextResponse.json({ 
                        valid: false, 
                        error: 'Voucher tidak aktif' 
                    }, { status: 400 })
                }

                // Check validity period
                if (settingsValidFrom && settingsValidFrom > now) {
                    return NextResponse.json({ 
                        valid: false, 
                        error: 'Voucher belum dapat digunakan' 
                    }, { status: 400 })
                }

                if (settingsValidUntil && settingsValidUntil < now) {
                    return NextResponse.json({ 
                        valid: false, 
                        error: 'Voucher sudah kadaluarsa' 
                    }, { status: 400 })
                }

                // Calculate discount (percentage type)
                const discountAmount = Math.round((totalAmount * settingsVoucherDiscount) / 100)
                const finalAmount = Math.max(0, totalAmount - discountAmount)

                return NextResponse.json({
                    valid: true,
                    voucher: {
                        code: settingsVoucherCode,
                        discountType: 'percentage',
                        discountValue: settingsVoucherDiscount,
                        maxDiscount: null,
                    },
                    discountAmount,
                    finalAmount,
                })
            }
        }

        // If not found in site_settings, check vouchers table
        const { data: voucher, error } = await supabase
            .from('vouchers')
            .select('*')
            .eq('code', inputCode)
            .eq('is_active', true)
            .single()

        if (error || !voucher) {
            return NextResponse.json({ 
                valid: false, 
                error: 'Kode voucher tidak valid atau sudah tidak aktif' 
            }, { status: 404 })
        }

        // Check validity period
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
            if (voucher.max_discount && discountAmount > voucher.max_discount) {
                discountAmount = voucher.max_discount
            }
        } else {
            discountAmount = voucher.discount_value
        }

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
