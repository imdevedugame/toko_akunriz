-- Add featured column to premium_products table
ALTER TABLE premium_products 
ADD COLUMN featured BOOLEAN DEFAULT FALSE AFTER status;

-- Add index for better performance
CREATE INDEX idx_products_featured ON premium_products(featured);
CREATE INDEX idx_products_status_featured ON premium_products(status, featured);

-- Update some products to be featured (optional)
UPDATE premium_products 
SET featured = TRUE 
WHERE id IN (1, 2, 3, 4) 
LIMIT 4;
