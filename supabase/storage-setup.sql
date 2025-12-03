-- Supabase Storage Setup for dish-images bucket
-- Run this in Supabase Dashboard → SQL Editor

-- IMPORTANT: First create the bucket via Storage UI:
-- 1. Go to Storage → Create Bucket
-- 2. Name: "dish-images"
-- 3. Public: Yes (so images can be accessed publicly)
-- 4. File size limit: 5MB (or your preferred limit)

-- Then run these SQL commands to set up RLS policies:

-- Policy: Allow public read access (images need to be publicly accessible)
CREATE POLICY IF NOT EXISTS "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'dish-images');

-- Policy: Allow authenticated users to upload
-- Note: The admin upload route uses service role key which bypasses RLS
-- But this policy allows authenticated users if needed
CREATE POLICY IF NOT EXISTS "Allow authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dish-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update
CREATE POLICY IF NOT EXISTS "Allow authenticated update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dish-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'dish-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to delete
CREATE POLICY IF NOT EXISTS "Allow authenticated delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dish-images' 
  AND auth.role() = 'authenticated'
);

-- Note: The admin upload route now uses service role key (createAdminClient)
-- which bypasses RLS, so these policies are for additional access if needed
