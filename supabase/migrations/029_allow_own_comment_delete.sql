-- Create a new policy to allow users to delete their own comments
create policy "Users can delete own comments"
  on public.article_comments for delete
  using (
    auth.jwt() ->> 'email' = email
  );

-- Also allow users to update their own comments (for editing)
create policy "Users can update own comments"
  on public.article_comments for update
  using (
    auth.jwt() ->> 'email' = email
  );
