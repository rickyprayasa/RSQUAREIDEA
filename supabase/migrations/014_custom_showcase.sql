-- Add custom showcase support to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_custom_showcase BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS service_type VARCHAR(50) CHECK (service_type IN ('sheets', 'webapp', 'fullstack', NULL));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_custom_showcase 
ON products(is_custom_showcase) 
WHERE is_custom_showcase = true;

CREATE INDEX IF NOT EXISTS idx_products_service_type 
ON products(service_type) 
WHERE service_type IS NOT NULL;

-- Update template_requests table
ALTER TABLE template_requests 
ADD COLUMN IF NOT EXISTS service_type VARCHAR(50) DEFAULT 'sheets' 
    CHECK (service_type IN ('sheets', 'webapp', 'fullstack', 'consultation')),
ADD COLUMN IF NOT EXISTS company VARCHAR(255),
ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(500);
