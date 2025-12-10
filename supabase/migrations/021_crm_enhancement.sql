-- CRM Enhancement Migration
-- Adds customer transactions table, tags, status, and activity tracking

-- Create customer_transactions table for manual transaction input
CREATE TABLE IF NOT EXISTS customer_transactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    amount INTEGER DEFAULT 0,
    platform TEXT,
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_transactions_customer_id ON customer_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_transactions_platform ON customer_transactions(platform);
CREATE INDEX IF NOT EXISTS idx_customer_transactions_purchase_date ON customer_transactions(purchase_date);

-- Add new columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Create index for status and tags filtering
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_tags ON customers USING GIN(tags);

-- Enable RLS for customer_transactions
ALTER TABLE customer_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for customer_transactions
DROP POLICY IF EXISTS "Anyone can insert customer_transactions" ON customer_transactions;
DROP POLICY IF EXISTS "Anyone can read customer_transactions" ON customer_transactions;
DROP POLICY IF EXISTS "Anyone can update customer_transactions" ON customer_transactions;
DROP POLICY IF EXISTS "Anyone can delete customer_transactions" ON customer_transactions;

CREATE POLICY "Anyone can insert customer_transactions" ON customer_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read customer_transactions" ON customer_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can update customer_transactions" ON customer_transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete customer_transactions" ON customer_transactions FOR DELETE USING (true);

-- Update existing customers to have default status
UPDATE customers SET status = 'active' WHERE status IS NULL;
