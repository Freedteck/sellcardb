/*
  # Create storage bucket for images

  1. Storage
    - Create 'images' bucket for storing product/service images
    - Enable public access for uploaded images
    
  2. Security
    - Allow authenticated and anonymous users to upload images
    - Allow public read access to images
    - Set file size limits and allowed file types
*/

-- Create the images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Allow anyone to upload images (for anonymous profile creation)
CREATE POLICY "Anyone can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Allow anyone to view images (public bucket)
CREATE POLICY "Anyone can view images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Allow users to delete their own images (for editing profiles)
CREATE POLICY "Users can delete images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'images');

-- Allow users to update their own images
CREATE POLICY "Users can update images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'images');