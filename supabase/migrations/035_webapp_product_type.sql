-- Add product type and webapp URL support
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'template' 
    CHECK (product_type IN ('template', 'webapp', 'fullstack')),
ADD COLUMN IF NOT EXISTS webapp_url TEXT;

-- Index for filtering by product type
CREATE INDEX IF NOT EXISTS idx_products_product_type 
ON products(product_type) 
WHERE product_type IS NOT NULL;

-- Add "Web App" category
INSERT INTO categories (name, slug, icon, description)
VALUES ('Web App', 'web-app', '🌐', 'Aplikasi web berbasis Google Apps Script')
ON CONFLICT (name) DO NOTHING;
