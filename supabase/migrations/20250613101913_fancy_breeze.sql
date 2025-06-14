/*
  # Update services duration from minutes to days

  1. Changes
    - Rename duration_minutes column to duration_days
    - Update existing data to convert minutes to days (divide by 1440)
    - Update all references in the application

  2. Data Migration
    - Convert existing minute values to day equivalents
    - Handle null values appropriately
*/

-- Add new duration_days column
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_days integer;

-- Migrate existing data (convert minutes to days, rounding to nearest day)
UPDATE services 
SET duration_days = CASE 
  WHEN duration_minutes IS NOT NULL THEN 
    GREATEST(1, ROUND(duration_minutes::numeric / 1440))
  ELSE NULL 
END;

-- Drop the old column
ALTER TABLE services DROP COLUMN IF EXISTS duration_minutes;