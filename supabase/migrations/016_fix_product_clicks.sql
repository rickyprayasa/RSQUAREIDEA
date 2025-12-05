-- Fix product_clicks to allow null product_id (for products that might not exist in DB)
ALTER TABLE product_clicks 
    DROP CONSTRAINT IF EXISTS product_clicks_product_id_fkey;

ALTER TABLE product_clicks 
    ALTER COLUMN product_id DROP NOT NULL;
