-- Add parent_id to article_comments for nested replies
ALTER TABLE public.article_comments
ADD COLUMN parent_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE;

-- Create article_comment_likes table
CREATE TABLE public.article_comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.article_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL DEFAULT true, -- true = like, false = dislike
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.article_comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies for article_comment_likes

-- Everyone can view likes
CREATE POLICY "Everyone can view comment likes" 
ON public.article_comment_likes FOR SELECT 
USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Authenticated users can insert likes" 
ON public.article_comment_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own likes
CREATE POLICY "Authenticated users can update their own likes" 
ON public.article_comment_likes FOR UPDATE 
USING (auth.uid() = user_id);

-- Authenticated users can delete their own likes
CREATE POLICY "Authenticated users can delete their own likes" 
ON public.article_comment_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_article_comment_likes_comment_id ON public.article_comment_likes(comment_id);
CREATE INDEX idx_article_comment_likes_user_id ON public.article_comment_likes(user_id);
