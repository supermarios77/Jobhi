# Supabase Storage Setup

## Create Storage Bucket for Dish Images

The image upload feature requires a Supabase Storage bucket named `dish-images`. Follow these steps to create it:

### Option 1: Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Name it: `dish-images`
5. Set it as **Public** (so images can be accessed via public URLs)
6. Click **"Create bucket"**

### Option 2: Via SQL (Supabase SQL Editor)

Run this SQL in the Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for authenticated users
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'dish-images');

CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'dish-images');

CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'dish-images');

CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'dish-images');
```

### Verify Setup

After creating the bucket, try uploading an image in the admin panel. If you still get errors, check:

1. The bucket name is exactly `dish-images` (case-sensitive)
2. The bucket is set to **Public**
3. Storage policies allow authenticated users to upload

