@@ .. @@
-- Policy for authenticated users to upload store images
CREATE POLICY "Authenticated users can upload store images"
ON storage.objects
FOR INSERT
TO authenticated
-WITH CHECK (bucket_id = 'store-images');
+WITH CHECK (bucket_id = 'store-images' AND auth.uid()::text = (storage.foldername(name))[1]);

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
-WITH CHECK (bucket_id = 'product-images');
+WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);