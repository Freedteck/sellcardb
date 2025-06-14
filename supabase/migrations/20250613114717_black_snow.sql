/*
  # Make service price optional

  1. Changes
    - Make price column nullable in services table
    - Update existing services to handle optional pricing
*/

-- Make price column nullable for services
ALTER TABLE services ALTER COLUMN price DROP NOT NULL;