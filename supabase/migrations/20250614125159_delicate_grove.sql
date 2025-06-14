/*
  # Add location field to products and services

  1. Changes
    - Add location column to products table
    - Add location column to services table
    - Create indexes for location-based searches

  2. Data Migration
    - Set default location from seller's location where available
*/

-- Add location column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS location text;

-- Add location column to services table  
ALTER TABLE services ADD COLUMN IF NOT EXISTS location text;

-- Update existing products with seller's location
UPDATE products 
SET location = sellers.location
FROM sellers 
WHERE products.seller_id = sellers.id 
AND products.location IS NULL 
AND sellers.location IS NOT NULL;

-- Update existing services with seller's location
UPDATE services 
SET location = sellers.location
FROM sellers 
WHERE services.seller_id = sellers.id 
AND services.location IS NULL 
AND sellers.location IS NOT NULL;

-- Create indexes for location-based searches
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_services_location ON services(location) WHERE location IS NOT NULL;