/*
  # Fix seller rating function with SECURITY DEFINER

  1. Function Updates
    - Drop and recreate the update_seller_rating function with SECURITY DEFINER
    - This ensures the function runs with elevated privileges
    - Allows proper rating updates regardless of who creates the review

  2. Security
    - Function will run with definer's privileges (superuser)
    - Enables RLS bypass for the rating calculation
    - Maintains data integrity for seller ratings
*/

-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS update_seller_rating_trigger ON reviews;
DROP FUNCTION IF EXISTS update_seller_rating();

-- Recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sellers
  SET
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE seller_id = NEW.seller_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE seller_id = NEW.seller_id
    ),
    updated_at = now()
  WHERE id = NEW.seller_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER update_seller_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_rating();

-- Update all existing seller ratings to ensure consistency
DO $$
DECLARE
  seller_record RECORD;
BEGIN
  FOR seller_record IN SELECT id FROM sellers LOOP
    UPDATE sellers
    SET
      rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE seller_id = seller_record.id
      ),
      total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE seller_id = seller_record.id
      ),
      updated_at = now()
    WHERE id = seller_record.id;
  END LOOP;
END $$;