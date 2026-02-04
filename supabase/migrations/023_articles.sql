-- Create articles table
create table public.articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null,
  excerpt text,
  content text,
  thumbnail_url text,
  published boolean default false,
  author_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create unique index on slug
create unique index articles_slug_key on public.articles (slug);

-- Enable RLS
alter table public.articles enable row level security;

-- Policies
create policy "Public articles are viewable by everyone"
  on public.articles for select
  using ( published = true );

create policy "Admins can view all articles"
  on public.articles for select
  using ( 
    auth.uid() in (
      select id from public.users where role in ('admin', 'superadmin')
    )
  );

create policy "Admins can insert articles"
  on public.articles for insert
  with check ( 
    auth.uid() in (
      select id from public.users where role in ('admin', 'superadmin')
    )
  );

create policy "Admins can update articles"
  on public.articles for update
  using ( 
    auth.uid() in (
      select id from public.users where role in ('admin', 'superadmin')
    )
  );

create policy "Admins can delete articles"
  on public.articles for delete
  using ( 
    auth.uid() in (
      select id from public.users where role in ('admin', 'superadmin')
    )
  );

-- Function to update updated_at
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.articles
  for each row execute procedure moddatetime (updated_at);
