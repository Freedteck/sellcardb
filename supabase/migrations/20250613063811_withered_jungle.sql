/*
  # Authentication and Marketplace Schema

  1. New Tables
    - `sellers` - Seller profiles linked to auth users
    - `products` - Products for sale
    - `services` - Services offered
    - `inquiries` - Customer inquiries to sellers
    - `reviews` - Customer reviews for sellers
    - `shop_settings` - Shop configuration and business hours

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure seller data access

  3. Functions
    - View count increment functions
    - Search and filter functions
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sellers table (linked to auth.users)
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  description text NOT NULL,
  whatsapp_number text NOT NULL,
  phone_number text,
  email text,
  website text,
  instagram text,
  tiktok text,
  location text,
  avatar_url text,
  cover_image_url text,
  is_verified boolean DEFAULT false,
  rating numeric(3,2) DEFAULT 0.0,
  total_reviews integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  view_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  images text[] DEFAULT '{}',
  stock_quantity integer DEFAULT 0,
  is_available boolean DEFAULT true,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  images text[] DEFAULT '{}',
  duration_minutes integer,
  is_available boolean DEFAULT true,
  availability_schedule jsonb DEFAULT '{}',
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Shop settings table
CREATE TABLE IF NOT EXISTS shop_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE UNIQUE,
  business_hours jsonb DEFAULT '{}',
  delivery_options jsonb DEFAULT '{}',
  payment_methods jsonb DEFAULT '{}',
  return_policy text,
  shipping_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_location ON sellers(location);
CREATE INDEX IF NOT EXISTS idx_sellers_rating ON sellers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_services_seller_id ON services(seller_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_inquiries_seller_id ON inquiries(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);

-- Enable Row Level Security
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Sellers policies
CREATE POLICY "Anyone can view active sellers"
  ON sellers FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Users can create their own seller profile"
  ON sellers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seller profile"
  ON sellers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  TO public
  USING (is_available = true);

CREATE POLICY "Sellers can manage their own products"
  ON products FOR ALL
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  );

-- Services policies
CREATE POLICY "Anyone can view available services"
  ON services FOR SELECT
  TO public
  USING (is_available = true);

CREATE POLICY "Sellers can manage their own services"
  ON services FOR ALL
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  );

-- Inquiries policies
CREATE POLICY "Anyone can create inquiries"
  ON inquiries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Sellers can view their own inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update their own inquiries"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create reviews"
  ON reviews FOR INSERT
  TO public
  WITH CHECK (true);

-- Shop settings policies
CREATE POLICY "Sellers can manage their own shop settings"
  ON shop_settings FOR ALL
  TO authenticated
  USING (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  );

-- Functions for updating ratings
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
    )
  WHERE id = NEW.seller_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER SECURITY DEFINER update_seller_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_rating();

-- Function to increment view counts
CREATE OR REPLACE FUNCTION increment_seller_views(seller_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE sellers 
  SET view_count = view_count + 1 
  WHERE id = seller_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_product_views(product_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET view_count = view_count + 1 
  WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_service_views(service_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE services 
  SET view_count = view_count + 1 
  WHERE id = service_uuid;
END;
$$ LANGUAGE plpgsql;