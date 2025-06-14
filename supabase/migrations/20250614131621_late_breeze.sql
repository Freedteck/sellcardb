/*
  # Fix RLS policy for inquiries table

  1. Security Changes
    - Drop existing INSERT policy for inquiries table
    - Create new INSERT policy that allows both anonymous and authenticated users to create inquiries
    - Ensure the policy works for public inquiry forms

  This migration fixes the "new row violates row-level security policy" error
  by properly configuring the RLS policy to allow anonymous users to submit inquiries.
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Anyone can create inquiries" ON inquiries;

-- Create a new INSERT policy that allows both anonymous and authenticated users
CREATE POLICY "Allow inquiry creation"
  ON inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);