# Supabase Connection Pooling Fix

## Problem
Error: `Error in PostgreSQL connection: Error { kind: Closed, cause: None }`

This happens because:
1. Serverless functions (Vercel) create many short-lived connections
2. Direct database connections get closed between function invocations
3. Connection pool exhaustion in serverless environments

## Solution

### Option 1: Use Supabase Connection Pooler (Recommended)

Supabase provides a connection pooler that's optimized for serverless environments.

**Get your pooler URL:**
1. Go to Supabase Dashboard → Settings → Database
2. Scroll to "Connection Pooling"
3. Copy the "Connection string" under "Transaction mode" or "Session mode"
4. It should look like: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`

**Update Vercel Environment Variable:**
- Replace `DATABASE_URL` with the pooler connection string
- The code will automatically detect and use it

### Option 2: Manual Configuration

If you want to manually set it, update your `DATABASE_URL` in Vercel:

**Direct connection (not recommended for serverless):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

**Pooler connection (recommended):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

### Important Notes

1. **Port difference:**
   - Direct: `5432`
   - Pooler: `6543`

2. **User format:**
   - Direct: `postgres`
   - Pooler: `postgres.[PROJECT-REF]`

3. **Host difference:**
   - Direct: `db.[PROJECT-REF].supabase.co`
   - Pooler: `aws-0-[REGION].pooler.supabase.com`

4. **Parameters:**
   - Pooler requires: `?pgbouncer=true&sslmode=require`
   - Direct requires: `?sslmode=require`

## Current Code Behavior

The code now:
- Automatically detects Supabase URLs
- Attempts to convert direct connections to pooler URLs in production
- Falls back to direct connection if conversion fails
- Adds SSL parameters automatically

## Testing

After updating `DATABASE_URL`:
1. Redeploy on Vercel
2. Check function logs for: `[Prisma] Using Supabase connection pooler for production`
3. Verify dishes are loading correctly

## Troubleshooting

If connection issues persist:

1. **Check your region:**
   - The code assumes `eu-central-1` (Europe)
   - If your Supabase is in a different region, update the pooler URL manually

2. **Verify pooler is enabled:**
   - Go to Supabase Dashboard → Settings → Database
   - Ensure "Connection Pooling" is enabled

3. **Check connection limits:**
   - Supabase free tier: 60 connections
   - Pooler helps manage this better

4. **Use Supabase Dashboard connection string:**
   - Copy the exact pooler URL from Supabase dashboard
   - Don't try to construct it manually

