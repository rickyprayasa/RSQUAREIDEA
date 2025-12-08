-- Fix RLS policies untuk memungkinkan admin menghapus data
-- Drop ALL existing policies first

-- Products policies
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admin full access to products" ON products;

-- Video tutorials policies
DROP POLICY IF EXISTS "Admins can delete video tutorials" ON video_tutorials;
DROP POLICY IF EXISTS "Admins can insert video tutorials" ON video_tutorials;
DROP POLICY IF EXISTS "Admins can update video tutorials" ON video_tutorials;
DROP POLICY IF EXISTS "Admins can manage video tutorials" ON video_tutorials;
DROP POLICY IF EXISTS "Admin full access to video_tutorials" ON video_tutorials;

-- Recreate policies for products
CREATE POLICY "Admin full access to products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Recreate policies for video_tutorials
CREATE POLICY "Admin full access to video_tutorials" ON video_tutorials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );
