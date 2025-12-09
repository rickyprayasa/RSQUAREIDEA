-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2) DEFAULT NULL,
    usage_limit INTEGER DEFAULT NULL,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);

-- Add RLS policies
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Public can read active vouchers (for validation)
CREATE POLICY "Anyone can read active vouchers" ON vouchers
    FOR SELECT USING (is_active = true);

-- Only authenticated admins can manage vouchers
CREATE POLICY "Admins can manage vouchers" ON vouchers
    FOR ALL USING (true);

-- Add voucher_code column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- Insert sample voucher for testing
INSERT INTO vouchers (code, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_until, is_active)
VALUES 
    ('WELCOME10', 'percentage', 10, 50000, 50000, 100, NOW() + INTERVAL '1 year', true),
    ('DISKON20K', 'fixed', 20000, 100000, NULL, 50, NOW() + INTERVAL '6 months', true)
ON CONFLICT (code) DO NOTHING;
