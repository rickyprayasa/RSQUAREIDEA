-- Add views column to articles table
alter table public.articles 
add column if not exists views integer default 0;
