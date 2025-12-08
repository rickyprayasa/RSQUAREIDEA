-- Tambah kolom external_links untuk menyimpan link pembelian eksternal
-- Format: JSON array of objects [{name: "Tokopedia", url: "https://..."}, ...]

ALTER TABLE products ADD COLUMN IF NOT EXISTS external_links JSONB DEFAULT '[]'::jsonb;

-- Contoh update produk dengan external links:
-- UPDATE products SET external_links = '[{"name": "Tokopedia", "url": "https://tokopedia.com/..."}, {"name": "Shopee", "url": "https://shopee.co.id/..."}]' WHERE id = 1;
