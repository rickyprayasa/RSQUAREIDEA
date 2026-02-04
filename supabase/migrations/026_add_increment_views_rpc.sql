-- Function to increment article views
create or replace function increment_article_views(article_slug text)
returns void
language plpgsql
security definer
as $$
begin
  update articles
  set views = coalesce(views, 0) + 1
  where slug = article_slug;
end;
$$;
