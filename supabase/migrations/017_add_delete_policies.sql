-- Add DELETE policies to all tables that need them

-- Customers table
DROP POLICY IF EXISTS "Anyone can delete customers" ON customers;
CREATE POLICY "Anyone can delete customers" ON customers FOR DELETE USING (true);

-- Contact Messages table (not "messages")
DROP POLICY IF EXISTS "Anyone can delete contact_messages" ON contact_messages;
CREATE POLICY "Anyone can delete contact_messages" ON contact_messages FOR DELETE USING (true);

-- Template requests table
DROP POLICY IF EXISTS "Anyone can delete template_requests" ON template_requests;
CREATE POLICY "Anyone can delete template_requests" ON template_requests FOR DELETE USING (true);

-- QRIS confirmations table
DROP POLICY IF EXISTS "Anyone can delete qris_confirmations" ON qris_confirmations;
CREATE POLICY "Anyone can delete qris_confirmations" ON qris_confirmations FOR DELETE USING (true);

-- Orders table
DROP POLICY IF EXISTS "Anyone can delete orders" ON orders;
CREATE POLICY "Anyone can delete orders" ON orders FOR DELETE USING (true);

-- Feedback table
DROP POLICY IF EXISTS "Anyone can delete feedback" ON feedback;
CREATE POLICY "Anyone can delete feedback" ON feedback FOR DELETE USING (true);

-- Payment confirmations table
DROP POLICY IF EXISTS "Anyone can delete payment_confirmations" ON payment_confirmations;
CREATE POLICY "Anyone can delete payment_confirmations" ON payment_confirmations FOR DELETE USING (true);
