-- =====================================================
-- ADD THUMBNAIL FIELD TO PRODUCTS TABLE
-- Jalankan SQL ini di Supabase SQL Editor
-- =====================================================

-- Add thumbnail column to products table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'thumbnail') THEN
        ALTER TABLE products ADD COLUMN thumbnail VARCHAR(500);
    END IF;
END $$;

-- Add comment to explain the difference
COMMENT ON COLUMN products.image IS 'Gambar utama/cover untuk halaman detail produk';
COMMENT ON COLUMN products.thumbnail IS 'Gambar thumbnail kecil untuk card/list view (opsional, jika kosong pakai image)';

SELECT 'Thumbnail column added to products table!' as message;
