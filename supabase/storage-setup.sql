-- Supabase Storage Setup for dish-images bucket
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create the bucket if it doesn't exist (or create it via Storage UI)
-- Go to Storage → Create Bucket → Name: "dish-images" → Public: Yes

-- 2. Enable RLS on the bucket (if not already enabled)
-- This is done automatically when you create a bucket, but you can verify:
-- Storage → dish-images → Policies

-- 3. Create policies to allow authenticated admins to upload
-- Note: These policies assume you have a way to identify admins
-- Option A: Allow authenticated users (if all authenticated users are admins)
-- Option B: Use service role key for admin uploads (recommended - see code fix)

-- Policy: Allow authenticated users to read (public access)
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'dish-images');

-- Policy: Allow authenticated users to upload (for admin panel)
-- This allows any authenticated user to upload - you may want to restrict this further
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dish-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated update"
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
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dish-images' 
  AND auth.role() = 'authenticated'
);

-- Alternative: If you want to restrict to specific users (admins only)
-- You would need to check user metadata or a separate admin table
-- This is more complex and requires additional setup

