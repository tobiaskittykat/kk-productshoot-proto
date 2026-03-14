
-- Drop the restrictive policy that requires user_id as first folder
DROP POLICY "Authenticated users can upload product images" ON storage.objects;

-- Recreate: allow uploads if first folder is user_id OR if path starts with imports/
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.uid() IS NOT NULL
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR (storage.foldername(name))[1] = 'imports'
  )
);
