-- Add CRM columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS feedback_email_sent_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS feedback_voucher_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS voucher_sent_at TIMESTAMPTZ;

-- Create index for source filtering
CREATE INDEX IF NOT EXISTS idx_customers_source ON customers(source);

-- Update existing customers to have 'website' as source
UPDATE customers SET source = 'website' WHERE source IS NULL;

-- Add email column to feedback table
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS email TEXT;
