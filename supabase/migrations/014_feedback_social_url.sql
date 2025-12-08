-- Add social_media_url column to feedback table
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS social_media_url TEXT;

-- Enable delete for feedback table
DROP POLICY IF EXISTS "Anyone can delete feedback" ON feedback;
CREATE POLICY "Anyone can delete feedback" ON feedback FOR DELETE USING (true);
