-- Create request_invoices table for tracking invoices from template requests
CREATE TABLE IF NOT EXISTS request_invoices (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES template_requests(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    description TEXT,
    app_type VARCHAR(50) DEFAULT NULL,
    items JSONB DEFAULT '[]',
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_percent DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','cancelled')),
    due_date DATE,
    paid_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    notes TEXT,
    terms_conditions TEXT,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending','delivered')),
    delivery_url TEXT,
    delivery_file_url TEXT,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_request_invoices_request_id ON request_invoices(request_id);
CREATE INDEX IF NOT EXISTS idx_request_invoices_status ON request_invoices(status);
CREATE INDEX IF NOT EXISTS idx_request_invoices_invoice_number ON request_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_request_invoices_delivery_status ON request_invoices(delivery_status);

-- Enable RLS
ALTER TABLE request_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can insert request_invoices" ON request_invoices;
DROP POLICY IF EXISTS "Anyone can read request_invoices" ON request_invoices;
DROP POLICY IF EXISTS "Anyone can update request_invoices" ON request_invoices;
DROP POLICY IF EXISTS "Anyone can delete request_invoices" ON request_invoices;

CREATE POLICY "Anyone can insert request_invoices" ON request_invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read request_invoices" ON request_invoices FOR SELECT USING (true);
CREATE POLICY "Anyone can update request_invoices" ON request_invoices FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete request_invoices" ON request_invoices FOR DELETE USING (true);

-- Updated at trigger
CREATE TRIGGER update_request_invoices_updated_at 
    BEFORE UPDATE ON request_invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
