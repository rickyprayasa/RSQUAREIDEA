import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const serviceType = request.nextUrl.searchParams.get('type')

        let query = supabase
            .from('products')
            .select('id, title, slug, description, price, discount_price, image, category, features, service_type, created_at')
            .eq('is_custom_showcase', true)
            .eq('is_active', true)

        if (serviceType && ['sheets', 'webapp', 'fullstack'].includes(serviceType)) {
            query = query.eq('service_type', serviceType)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching portfolio:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const portfolio = data?.map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description,
            price: p.price,
            discountPrice: p.discount_price,
            image: p.image,
            category: p.category,
            features: p.features || [],
            serviceType: p.service_type,
            createdAt: p.created_at
        })) || []

        return NextResponse.json({ portfolio })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
    }
}
