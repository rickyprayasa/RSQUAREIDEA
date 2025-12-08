-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    last_order_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    social_media VARCHAR(255),
    template_name VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    likes TEXT,
    improvements TEXT,
    testimonial_permission BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- Add name and social_media columns if table already exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'feedback' AND column_name = 'name') THEN
        ALTER TABLE feedback ADD COLUMN name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'feedback' AND column_name = 'social_media') THEN
        ALTER TABLE feedback ADD COLUMN social_media VARCHAR(255);
    END IF;
END $$;

-- Create template_requests table
CREATE TABLE IF NOT EXISTS template_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    budget VARCHAR(100),
    deadline VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_requests_status ON template_requests(status);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Add payment_type to qris_confirmations if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'qris_confirmations' AND column_name = 'payment_type') THEN
        ALTER TABLE qris_confirmations ADD COLUMN payment_type VARCHAR(20) DEFAULT 'qris';
    END IF;
END $$;

-- Create payment_confirmations as a view or separate table if needed
CREATE TABLE IF NOT EXISTS payment_confirmations (
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
    payment_type VARCHAR(20) DEFAULT 'bank_transfer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_payment_confirmations_status ON payment_confirmations(status);

ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert payment_confirmations" ON payment_confirmations;
DROP POLICY IF EXISTS "Anyone can read payment_confirmations" ON payment_confirmations;
DROP POLICY IF EXISTS "Anyone can update payment_confirmations" ON payment_confirmations;

CREATE POLICY "Anyone can insert payment_confirmations" ON payment_confirmations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read payment_confirmations" ON payment_confirmations FOR SELECT USING (true);
CREATE POLICY "Anyone can update payment_confirmations" ON payment_confirmations FOR UPDATE USING (true);

-- Enable RLS for all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Public can insert customers" ON customers;
DROP POLICY IF EXISTS "Anyone can read customers" ON customers;
DROP POLICY IF EXISTS "Anyone can update customers" ON customers;
DROP POLICY IF EXISTS "Public can insert messages" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can read messages" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON contact_messages;
DROP POLICY IF EXISTS "Public can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can read feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can update feedback" ON feedback;
DROP POLICY IF EXISTS "Public can insert requests" ON template_requests;
DROP POLICY IF EXISTS "Anyone can read requests" ON template_requests;
DROP POLICY IF EXISTS "Anyone can update requests" ON template_requests;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can read notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can delete notifications" ON notifications;

-- Policies for customers
CREATE POLICY "Public can insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Anyone can update customers" ON customers FOR UPDATE USING (true);

-- Policies for contact_messages
CREATE POLICY "Public can insert messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read messages" ON contact_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can update messages" ON contact_messages FOR UPDATE USING (true);

-- Policies for feedback
CREATE POLICY "Public can insert feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read feedback" ON feedback FOR SELECT USING (true);
CREATE POLICY "Anyone can update feedback" ON feedback FOR UPDATE USING (true);

-- Policies for template_requests
CREATE POLICY "Public can insert requests" ON template_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read requests" ON template_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can update requests" ON template_requests FOR UPDATE USING (true);

-- Policies for notifications
CREATE POLICY "Anyone can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can update notifications" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete notifications" ON notifications FOR DELETE USING (true);
