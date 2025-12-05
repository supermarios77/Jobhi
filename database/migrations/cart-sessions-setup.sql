-- Create cart_sessions table (if not using Prisma migrations)
-- This is automatically created by Prisma, but you may need to run this
-- if you're setting up manually or if Prisma hasn't run yet.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create cart_sessions table
CREATE TABLE IF NOT EXISTS cart_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT UNIQUE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index on session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_cart_sessions_session_id ON cart_sessions(session_id);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_cart_sessions_expires_at ON cart_sessions(expires_at);

-- Enable Row Level Security
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read their own cart session
CREATE POLICY "Users can read their own cart session"
  ON cart_sessions
  FOR SELECT
  USING (true); -- Allow all reads for anonymous users

-- Create policy to allow anyone to insert their own cart session
CREATE POLICY "Users can insert their own cart session"
  ON cart_sessions
  FOR INSERT
  WITH CHECK (true); -- Allow all inserts for anonymous users

-- Create policy to allow anyone to update their own cart session
CREATE POLICY "Users can update their own cart session"
  ON cart_sessions
  FOR UPDATE
  USING (true) -- Allow all updates for anonymous users
  WITH CHECK (true);

-- Create policy to allow anyone to delete their own cart session
CREATE POLICY "Users can delete their own cart session"
  ON cart_sessions
  FOR DELETE
  USING (true); -- Allow all deletes for anonymous users

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cart_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
DROP TRIGGER IF EXISTS trigger_update_cart_sessions_updated_at ON cart_sessions;
CREATE TRIGGER trigger_update_cart_sessions_updated_at
  BEFORE UPDATE ON cart_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_sessions_updated_at();

-- Optional: Create a function to clean up expired cart sessions
-- You can run this periodically via a cron job or scheduled task
CREATE OR REPLACE FUNCTION cleanup_expired_cart_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM cart_sessions
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

