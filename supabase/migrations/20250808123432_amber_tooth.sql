/*
  # Create Storage Buckets

  1. Storage Buckets
    - `store-images` - For store logos, hero images, etc.
    - `product-images` - For product photos
    - `user-avatars` - For user profile pictures

  2. Security
    - Enable RLS on all buckets
    - Add policies for authenticated users to upload/view files
    - Public read access for store and product images
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('store-images', 'store-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-images', 'product-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('user-avatars', 'user-avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to upload store images
CREATE POLICY "Authenticated users can upload store images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'store-images');

-- Policy for public read access to store images
CREATE POLICY "Public can view store images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'store-images');

-- Policy for users to delete their own store images
CREATE POLICY "Users can delete their own store images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'store-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Policy for public read access to product images
CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Policy for users to delete their own product images
CREATE POLICY "Users can delete their own product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for authenticated users to upload user avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for authenticated users to view user avatars
CREATE POLICY "Users can view user avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'user-avatars');

-- Policy for users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);