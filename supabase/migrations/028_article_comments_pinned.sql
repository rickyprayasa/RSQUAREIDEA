-- Add pinned column to article_comments
alter table public.article_comments add column if not exists pinned boolean default false;

-- Create index for pinned comments
create index if not exists article_comments_pinned_idx on public.article_comments (pinned) where pinned = true;
