-- Create article_comments table
create table public.article_comments (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.articles(id) on delete cascade not null,
  name text not null,
  email text,
  content text not null,
  approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster lookups
create index article_comments_article_id_idx on public.article_comments (article_id);

-- Enable RLS
alter table public.article_comments enable row level security;

-- Policies

-- Anyone can view approved comments on published articles
create policy "Public can view approved comments"
  on public.article_comments for select
  using (
    approved = true 
    and article_id in (select id from public.articles where published = true)
  );

-- Admins can view all comments
create policy "Admins can view all comments"
  on public.article_comments for select
  using ( 
    auth.uid() in (
      select id from public.users where role in ('admin', 'superadmin')
    )
  );

-- Anyone can insert comments (will be approved by default, can change to false for moderation)
create policy "Anyone can add comments"
  on public.article_comments for insert
  with check (true);

-- Admins can update comments (for approval/moderation)
create policy "Admins can update comments"
  on public.article_comments for update
  using ( 
    auth.uid() in (
      select id from public.users where role in ('admin', 'superadmin')
    )
  );

-- Admins can delete comments
create policy "Admins can delete comments"
  on public.article_comments for delete
  using ( 
    auth.uid() in (
      select id from public.users where role in ('admin', 'superadmin')
    )
  );
