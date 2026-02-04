-- Add youtube_url column to articles table
alter table public.articles 
add column if not exists youtube_url text;
