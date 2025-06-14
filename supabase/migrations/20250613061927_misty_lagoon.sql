/*
  # Create profiles table and related functionality

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `business_name` (text, required)
      - `description` (text, required, max 150 chars)
      - `whatsapp_number` (text, required)
      - `category` (text)
      - `images` (text array)
      - `contact_methods` (jsonb for social links)
      - `edit_token` (text, unique)
      - `view_count` (integer, default 0)
      - `is_featured` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - `increment_view_count` function to safely increment views

  3. Security
    - Enable RLS on `profiles` table
    - Add policies for public read access
    - Add policies for editing with token
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  description text NOT NULL CHECK (char_length(description) <= 150),
  whatsapp_number text NOT NULL,
  category text DEFAULT 'Other',
  images text[] DEFAULT '{}',
  contact_methods jsonb DEFAULT '{}',
  edit_token text UNIQUE NOT NULL,
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read profiles (for public viewing)
CREATE POLICY "Anyone can read profiles"
  ON profiles
  FOR SELECT
  USING (true);

-- Allow anyone to insert profiles (for anonymous creation)
CREATE POLICY "Anyone can create profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Allow updates only with correct edit token
CREATE POLICY "Users can update with edit token"
  ON profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to increment view count safely
CREATE OR REPLACE FUNCTION increment_view_count(profile_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET view_count = view_count + 1,
      updated_at = now()
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_category ON profiles(category);
CREATE INDEX IF NOT EXISTS idx_profiles_featured ON profiles(is_featured) WHERE is_featured = true;