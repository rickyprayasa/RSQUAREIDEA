'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function incrementArticleViews(slug: string) {
    const supabase = await createAdminClient()

    // Fetch current views
    const { data: article } = await supabase
        .from('articles')
        .select('views')
        .eq('slug', slug)
        .single()

    if (article) {
        const currentViews = article.views || 0
        await supabase
            .from('articles')
            .update({ views: currentViews + 1 })
            .eq('slug', slug)
    }
}
