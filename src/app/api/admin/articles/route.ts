import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import slugify from 'slugify'

export async function GET() {
    try {
        const supabase = await createAdminClient()

        // Fetch articles with views
        const { data: articles, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching articles:', error)
            return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
        }

        // Fetch comment counts for each article
        const articleIds = articles?.map(a => a.id) || []

        const { data: commentCounts, error: countError } = await supabase
            .from('article_comments')
            .select('article_id')
            .in('article_id', articleIds)
            .eq('approved', true)

        // Count comments per article
        const commentCountMap: Record<string, number> = {}
        commentCounts?.forEach(c => {
            commentCountMap[c.article_id] = (commentCountMap[c.article_id] || 0) + 1
        })

        // Add comment counts to articles
        const articlesWithStats = articles?.map(article => ({
            ...article,
            comment_count: commentCountMap[article.id] || 0
        }))

        return NextResponse.json({ articles: articlesWithStats })
    } catch (error) {
        console.error('Error in articles API:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createAdminClient()
        const body = await request.json()

        const { title } = body

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        // Generate slug from title
        let slug = slugify(title, { lower: true, strict: true })

        // Ensure slug uniqueness (simple check)
        const { data: existing } = await supabase
            .from('articles')
            .select('slug')
            .eq('slug', slug)
            .single()

        if (existing) {
            slug = `${slug}-${Date.now()}`
        }

        const { data: article, error } = await supabase
            .from('articles')
            .insert({
                title,
                slug,
                excerpt: body.excerpt,
                content: body.content,
                thumbnail_url: body.thumbnail_url,
                youtube_url: body.youtube_url,
                published: body.published || false, // Use body published or default to draft
                author_id: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating article:', error)
            return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
        }

        return NextResponse.json({ article })

    } catch (error) {
        console.error('Error creating article:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
