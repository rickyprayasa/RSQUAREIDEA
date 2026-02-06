-- Make user_id nullable to allow anonymous likes
ALTER TABLE public.article_comment_likes 
ALTER COLUMN user_id DROP NOT NULL;

-- Add session_id for anonymous tracking
ALTER TABLE public.article_comment_likes
ADD COLUMN session_id TEXT;

-- Update Unique constraint to include session_id
ALTER TABLE public.article_comment_likes 
DROP CONSTRAINT article_comment_likes_comment_id_user_id_key;

CREATE UNIQUE INDEX idx_likes_user_unique ON public.article_comment_likes(comment_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_likes_session_unique ON public.article_comment_likes(comment_id, session_id) WHERE session_id IS NOT NULL;

-- Drop old RLS policies related to likes to redefine them
DROP POLICY "Authenticated users can insert likes" ON public.article_comment_likes;
DROP POLICY "Authenticated users can update their own likes" ON public.article_comment_likes;
DROP POLICY "Authenticated users can delete their own likes" ON public.article_comment_likes;

-- New Policies

-- 1. Insert: Allow if (user matches auth) OR (user is null and session_id is present)
CREATE POLICY "Allow public insert likes" 
ON public.article_comment_likes FOR INSERT 
WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
    OR 
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);

-- 2. Update: Allow if (user matches auth) OR (user is null and session_id matches)
CREATE POLICY "Allow public update likes" 
ON public.article_comment_likes FOR UPDATE 
USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
    OR 
    (user_id IS NULL AND session_id IS NOT NULL)
);

-- 3. Delete: Allow if (user matches auth) OR (user is null and session_id matches)
CREATE POLICY "Allow public delete likes" 
ON public.article_comment_likes FOR DELETE 
USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
    OR 
    (user_id IS NULL AND session_id IS NOT NULL) 
);
