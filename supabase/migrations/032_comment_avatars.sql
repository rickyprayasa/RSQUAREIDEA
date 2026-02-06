-- Add avatar_url and gender columns to article_comments for dynamic avatars
-- Existing comments will have NULL values and use default avatar

ALTER TABLE public.article_comments
ADD COLUMN avatar_url TEXT,
ADD COLUMN gender TEXT;
