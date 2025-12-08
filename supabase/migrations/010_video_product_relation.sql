-- Tambahkan kolom product_id ke video_tutorials untuk relasi dengan produk
-- NULL berarti video tutorial umum (ditampilkan di semua produk)
-- Jika ada product_id, video hanya ditampilkan di produk tersebut

ALTER TABLE video_tutorials ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id) ON DELETE SET NULL;

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_video_tutorials_product_id ON video_tutorials(product_id);
