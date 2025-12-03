-- =====================================================
-- FIX ALL TABLES AND RLS POLICIES
-- Jalankan SQL ini di Supabase SQL Editor
-- =====================================================

-- 1. Create categories table if not exists
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create video_tutorials table if not exists
CREATE TABLE IF NOT EXISTS video_tutorials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    youtube_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration VARCHAR(20),
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add external_links column to products if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'external_links') THEN
        ALTER TABLE products ADD COLUMN external_links JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 4. Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tutorials ENABLE ROW LEVEL SECURITY;

-- 5. Fix categories policies
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Admin full access to categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- 6. Fix video_tutorials policies
DROP POLICY IF EXISTS "Active video tutorials are viewable by everyone" ON video_tutorials;
DROP POLICY IF EXISTS "Admin full access to video_tutorials" ON video_tutorials;
DROP POLICY IF EXISTS "Admins can manage video tutorials" ON video_tutorials;
DROP POLICY IF EXISTS "Admins can delete video tutorials" ON video_tutorials;
DROP POLICY IF EXISTS "Admins can insert video tutorials" ON video_tutorials;
DROP POLICY IF EXISTS "Admins can update video tutorials" ON video_tutorials;

CREATE POLICY "Public can view active videos" ON video_tutorials
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access to video_tutorials" ON video_tutorials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- 7. Fix products policies (just in case)
DROP POLICY IF EXISTS "Admin full access to products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;

CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access to products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Done!
SELECT 'All tables and policies have been fixed!' as message;
