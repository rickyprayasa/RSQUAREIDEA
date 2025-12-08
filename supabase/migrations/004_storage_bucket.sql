-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'products',
    'products',
    TRUE,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for payment QR codes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payments',
    'payments',
    TRUE,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for video thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'thumbnails',
    'thumbnails',
    TRUE,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for products bucket
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'products' AND
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'products' AND
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'products' AND
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'superadmin'))
);

-- Storage policies for payments bucket
CREATE POLICY "Public can view payment images"
ON storage.objects FOR SELECT
USING (bucket_id = 'payments');

CREATE POLICY "Admins can manage payment images"
ON storage.objects FOR ALL
USING (
    bucket_id = 'payments' AND
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'superadmin'))
);

-- Storage policies for thumbnails bucket
CREATE POLICY "Public can view thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Admins can manage thumbnails"
ON storage.objects FOR ALL
USING (
    bucket_id = 'thumbnails' AND
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'superadmin'))
);
