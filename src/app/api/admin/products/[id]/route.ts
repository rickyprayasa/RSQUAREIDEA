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
        
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', parseInt(id))
            .single()

        if (error) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        return NextResponse.json({ product })
    } catch (error) {
        console.error('Error fetching product:', error)
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

        const { data: product, error } = await supabase
            .from('products')
            .update({
                title: data.title,
                slug: data.slug,
                description: data.description,
                price: data.price,
                discount_price: data.discountPrice,
                category: data.category,
                image: data.thumbnail || data.image,
                thumbnail: data.thumbnail || null,
                images: data.images,
                demo_url: data.demoUrl,
                download_url: data.downloadUrl,
                video_tutorial_url: data.videoTutorialUrl || null,
                is_featured: data.isFeatured,
                is_free: data.isFree,
                is_active: data.isActive,
                is_custom_showcase: data.isCustomShowcase || false,
                service_type: data.serviceType || null,
                features: data.features,
                external_links: data.externalLinks,
            })
            .eq('id', parseInt(id))
            .select()
            .single()

        if (error) {
            console.error('Error updating product:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ product })
    } catch (error) {
        console.error('Error updating product:', error)
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
            .from('products')
            .delete()
            .eq('id', parseInt(id))

        if (error) {
            console.error('Error deleting product:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
