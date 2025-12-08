-- Add active_users_count setting
INSERT INTO site_settings (key, value, type, label, description, "group")
VALUES ('active_users_count', '0', 'number', 'Jumlah Pengguna Aktif', 'Jumlah pengguna aktif yang ditampilkan di halaman Tentang Kami', 'stats')
ON CONFLICT (key) DO NOTHING;
