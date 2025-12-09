import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()

        // Get Saweria reward settings
        const { data: settingsData } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['saweria_reward_enabled', 'saweria_reward_product_id', 'saweria_min_donation', 'saweria_reward_message'])

        if (!settingsData || settingsData.length === 0) {
            return NextResponse.json({ 
                enabled: false, 
                error: 'Saweria reward belum dikonfigurasi' 
            })
        }

        const settings: Record<string, string> = {}
        settingsData.forEach(s => { settings[s.key] = s.value })

        const enabled = settings.saweria_reward_enabled === 'true'
        const productId = settings.saweria_reward_product_id
        const minDonation = parseInt(settings.saweria_min_donation || '50000')
        const message = settings.saweria_reward_message || 'Terima kasih atas dukungannya!'

        if (!enabled || !productId) {
            return NextResponse.json({ 
                enabled: false, 
                error: 'Saweria reward tidak aktif' 
            })
        }

        // Get product details
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, title, description, image, download_url')
            .eq('id', parseInt(productId))
            .single()

        if (productError || !product) {
            return NextResponse.json({ 
                enabled: false, 
                error: 'Produk tidak ditemukan' 
            })
        }

        return NextResponse.json({
            enabled: true,
            minDonation,
            message,
            product: {
                id: product.id,
                title: product.title,
                description: product.description,
                image: product.image,
                downloadUrl: product.download_url
            }
        })
    } catch (error) {
        console.error('Error fetching Saweria reward:', error)
        return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 })
    }
}
