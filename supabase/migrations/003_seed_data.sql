-- Seed categories
INSERT INTO categories (name, slug, icon, description) VALUES
    ('Budgeting', 'budgeting', 'wallet', 'Template untuk pengelolaan keuangan'),
    ('Business', 'business', 'briefcase', 'Template untuk bisnis dan usaha'),
    ('Productivity', 'productivity', 'zap', 'Template untuk produktivitas'),
    ('Lifestyle', 'lifestyle', 'heart', 'Template untuk gaya hidup')
ON CONFLICT (slug) DO NOTHING;

-- Seed site settings for video tutorial
INSERT INTO site_settings (key, value, type, label, description, "group") VALUES
    ('video_tutorial_title', 'Tutorial & Panduan', 'text', 'Judul Section Video', 'Judul yang ditampilkan di section video tutorial', 'video'),
    ('video_tutorial_description', 'Pelajari cara memaksimalkan penggunaan template kami dengan video tutorial langkah demi langkah.', 'text', 'Deskripsi Section Video', 'Deskripsi yang ditampilkan di section video tutorial', 'video'),
    ('video_tutorial_active', 'true', 'boolean', 'Aktifkan Video Tutorial', 'Tampilkan atau sembunyikan section video tutorial', 'video')
ON CONFLICT (key) DO NOTHING;

-- Seed sample payment settings
INSERT INTO payment_settings (type, name, is_active, bank_name, account_number, account_name, instructions) VALUES
    ('internal', 'Bank BCA', TRUE, 'BCA', '1234567890', 'RSQUARE', 'Transfer ke rekening di atas dan upload bukti pembayaran'),
    ('internal', 'Bank Mandiri', TRUE, 'Mandiri', '0987654321', 'RSQUARE', 'Transfer ke rekening di atas dan upload bukti pembayaran'),
    ('external', 'Saweria', TRUE, NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;
