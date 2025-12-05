-- Quick RLS setup for cart_sessions table
-- Run this in Supabase Dashboard → SQL Editor

-- Enable Row Level Security (if not already enabled)
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all reads" ON cart_sessions;
DROP POLICY IF EXISTS "Allow all inserts" ON cart_sessions;
DROP POLICY IF EXISTS "Allow all updates" ON cart_sessions;
DROP POLICY IF EXISTS "Allow all deletes" ON cart_sessions;

-- Create permissive policies for anonymous cart access
CREATE POLICY "Allow all reads" ON cart_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all inserts" ON cart_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all updates" ON cart_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes" ON cart_sessions
  FOR DELETE
  USING (true);

