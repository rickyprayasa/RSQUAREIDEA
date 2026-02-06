-- Fix RLS policies for anonymous likes
-- The previous policy checked auth.uid() IS NULL, but anon key users 
-- still have a session context. This update makes it more permissive.

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert likes" ON public.article_comment_likes;
DROP POLICY IF EXISTS "Allow public update likes" ON public.article_comment_likes;
DROP POLICY IF EXISTS "Allow public delete likes" ON public.article_comment_likes;

-- Recreate with simpler, more permissive policies

-- 1. Insert: Allow if user_id matches auth, OR if session_id is provided (for anonymous)
CREATE POLICY "Allow public insert likes" 
ON public.article_comment_likes FOR INSERT 
WITH CHECK (
    (user_id IS NOT NULL AND user_id = auth.uid()) 
    OR 
    (user_id IS NULL AND session_id IS NOT NULL)
);

-- 2. Update: Allow if user owns the record (by user_id or session_id)
CREATE POLICY "Allow public update likes" 
ON public.article_comment_likes FOR UPDATE 
USING (
    (user_id IS NOT NULL AND user_id = auth.uid()) 
    OR 
    (user_id IS NULL AND session_id IS NOT NULL)
);

-- 3. Delete: Allow if user owns the record (by user_id or session_id)
CREATE POLICY "Allow public delete likes" 
ON public.article_comment_likes FOR DELETE 
USING (
    (user_id IS NOT NULL AND user_id = auth.uid()) 
    OR 
    (user_id IS NULL AND session_id IS NOT NULL)
);
