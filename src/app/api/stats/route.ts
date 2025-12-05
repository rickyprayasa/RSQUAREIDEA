import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Get active users count from site_settings
        const { data: settingsData } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'active_users_count')
            .single()

        // Get average rating from feedback
        const { data: feedbackData } = await supabase
            .from('feedback')
            .select('rating')

        let averageRating = 0
        if (feedbackData && feedbackData.length > 0) {
            const totalRating = feedbackData.reduce((sum, f) => sum + (f.rating || 0), 0)
            averageRating = totalRating / feedbackData.length
        }

        return NextResponse.json({
            activeUsers: settingsData?.value || '0',
            averageRating: averageRating > 0 ? averageRating.toFixed(1) : '0',
            totalFeedback: feedbackData?.length || 0,
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        return NextResponse.json({
            activeUsers: '0',
            averageRating: '0',
            totalFeedback: 0,
        })
    }
}
