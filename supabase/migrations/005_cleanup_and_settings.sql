-- Hapus data dummy jika ada
DELETE FROM video_tutorials;
DELETE FROM orders;
DELETE FROM products;

-- Reset sequence untuk ID
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE video_tutorials_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;

-- Tambah settings baru untuk homepage limits
INSERT INTO site_settings (key, value, type, label, description, "group") VALUES
    ('homepage_free_limit', '4', 'number', 'Jumlah Template Gratis', 'Jumlah template gratis yang ditampilkan di beranda', 'homepage'),
    ('homepage_featured_limit', '4', 'number', 'Jumlah Template Unggulan', 'Jumlah template unggulan yang ditampilkan di beranda', 'homepage')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Hapus settings lama yang tidak digunakan
DELETE FROM site_settings WHERE key IN ('homepage_free_product_ids', 'homepage_featured_product_ids');
