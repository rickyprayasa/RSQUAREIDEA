-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tutorials ENABLE ROW LEVEL SECURITY;

-- Users policies (only admins can access)
CREATE POLICY "Users are viewable by admins" ON users
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
    );

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can update users" ON users
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
    );

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can view all products" ON products
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
    );

CREATE POLICY "Admins can insert products" ON products
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
    );

CREATE POLICY "Admins can update products" ON products
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
    );

CREATE POLICY "Admins can delete products" ON products
    FOR DELETE USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
    );

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
    );

-- Payment settings policies
CREATE POLICY "Active payment settings are viewable by everyone" ON payment_settings
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage payment settings" ON payment_settings
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
    );

-- Orders policies
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Customers can create orders" ON orders
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
    );

CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
    );

-- Site settings policies
CREATE POLICY "Site settings are viewable by everyone" ON site_settings
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage site settings" ON site_settings
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
    );

-- Video tutorials policies
CREATE POLICY "Active video tutorials are viewable by everyone" ON video_tutorials
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage video tutorials" ON video_tutorials
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
    );
