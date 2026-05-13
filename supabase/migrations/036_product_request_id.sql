-- Add request_id to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS request_id INTEGER REFERENCES template_requests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_request_id ON products(request_id);
