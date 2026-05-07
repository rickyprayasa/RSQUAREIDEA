import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const templateName = searchParams.get('templateName')

        if (!templateName) {
            return NextResponse.json({ error: 'templateName is required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Fetch published reviews for this template
        const { data: reviews, error } = await supabase
            .from('feedback')
            .select('id, name, rating, likes, created_at')
            .eq('template_name', templateName)
            .eq('status', 'published')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching product reviews:', error)
            return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
        }

        // Calculate summary
        const totalReviews = reviews?.length || 0
        const averageRating = totalReviews > 0 
            ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews 
            : 0

        return NextResponse.json({
            success: true,
            summary: {
                totalReviews,
                averageRating: Number(averageRating.toFixed(1))
            },
            reviews: reviews || []
        })
    } catch (error) {
        console.error('Error in reviews API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
