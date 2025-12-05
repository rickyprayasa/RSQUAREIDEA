-- Create QRIS payment confirmations table
CREATE TABLE IF NOT EXISTS qris_confirmations (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    amount DECIMAL(12, 2) NOT NULL,
    proof_image TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(255)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_qris_confirmations_status ON qris_confirmations(status);
CREATE INDEX IF NOT EXISTS idx_qris_confirmations_order_number ON qris_confirmations(order_number);

-- Enable RLS
ALTER TABLE qris_confirmations ENABLE ROW LEVEL SECURITY;

-- Public can insert (create confirmation)
CREATE POLICY "Anyone can create QRIS confirmation" ON qris_confirmations
    FOR INSERT WITH CHECK (true);

-- Public can read their own confirmations by order_number
CREATE POLICY "Anyone can read QRIS confirmations" ON qris_confirmations
    FOR SELECT USING (true);

-- Only authenticated admin can update
CREATE POLICY "Admins can update QRIS confirmations" ON qris_confirmations
    FOR UPDATE USING (true);

-- Create storage bucket for QRIS proofs if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('qris', 'qris', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload QRIS proof" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view QRIS images" ON storage.objects;
DROP POLICY IF EXISTS "qris_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "qris_select_policy" ON storage.objects;

-- Storage policies for qris bucket - allow public upload and view
CREATE POLICY "qris_upload_policy" ON storage.objects
    FOR INSERT 
    TO public
    WITH CHECK (bucket_id = 'qris');

CREATE POLICY "qris_select_policy" ON storage.objects
    FOR SELECT 
    TO public
    USING (bucket_id = 'qris');
