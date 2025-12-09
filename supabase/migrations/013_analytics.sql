-- Create page_views table for tracking visitor analytics
CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    page_path VARCHAR(500) NOT NULL,
    page_title VARCHAR(255),
    referrer TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    session_id VARCHAR(100),
    visitor_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);

-- Create product_clicks table for tracking product interactions
CREATE TABLE IF NOT EXISTS product_clicks (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    product_slug VARCHAR(255) NOT NULL,
    product_title VARCHAR(255),
    click_type VARCHAR(50) DEFAULT 'view', -- view, add_to_cart, buy_now, download
    referrer TEXT,
    user_agent TEXT,
    session_id VARCHAR(100),
    visitor_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_clicks_created_at ON product_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_clicks_product_id ON product_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_type ON product_clicks(click_type);

-- Create button_clicks table for CTA tracking
CREATE TABLE IF NOT EXISTS button_clicks (
    id SERIAL PRIMARY KEY,
    button_name VARCHAR(255) NOT NULL,
    button_location VARCHAR(255),
    page_path VARCHAR(500),
    session_id VARCHAR(100),
    visitor_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_button_clicks_created_at ON button_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_button_clicks_name ON button_clicks(button_name);

-- Create daily_stats table for aggregated daily analytics
CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    total_product_clicks INTEGER DEFAULT 0,
    total_add_to_cart INTEGER DEFAULT 0,
    total_checkouts INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    top_pages JSONB,
    top_products JSONB,
    traffic_sources JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE button_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Policies - allow public insert, admin read
DROP POLICY IF EXISTS "Anyone can insert page_views" ON page_views;
DROP POLICY IF EXISTS "Anyone can read page_views" ON page_views;
DROP POLICY IF EXISTS "Anyone can insert product_clicks" ON product_clicks;
DROP POLICY IF EXISTS "Anyone can read product_clicks" ON product_clicks;
DROP POLICY IF EXISTS "Anyone can insert button_clicks" ON button_clicks;
DROP POLICY IF EXISTS "Anyone can read button_clicks" ON button_clicks;
DROP POLICY IF EXISTS "Anyone can read daily_stats" ON daily_stats;
DROP POLICY IF EXISTS "Anyone can insert daily_stats" ON daily_stats;
DROP POLICY IF EXISTS "Anyone can update daily_stats" ON daily_stats;

CREATE POLICY "Anyone can insert page_views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read page_views" ON page_views FOR SELECT USING (true);

CREATE POLICY "Anyone can insert product_clicks" ON product_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read product_clicks" ON product_clicks FOR SELECT USING (true);

CREATE POLICY "Anyone can insert button_clicks" ON button_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read button_clicks" ON button_clicks FOR SELECT USING (true);

CREATE POLICY "Anyone can read daily_stats" ON daily_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can insert daily_stats" ON daily_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update daily_stats" ON daily_stats FOR UPDATE USING (true);
