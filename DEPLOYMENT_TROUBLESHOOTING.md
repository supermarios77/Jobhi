# Deployment Troubleshooting Guide

## Common Issues: Local vs Production

### 1. Prisma Client Not Generated

**Problem**: Prisma client needs to be generated after `bun install` but before `next build`.

**Solution**: 
- Added `postinstall` script to automatically generate Prisma client
- Build command now includes `prisma generate && bun run build`
- This ensures Prisma client is always generated during Vercel builds

### 2. Database Connection Issues

**Problem**: Supabase requires SSL connections in production.

**Solution**:
- Prisma client now automatically adds `?sslmode=require` to Supabase connection strings in production
- Make sure your `DATABASE_URL` is correct:
  ```
  postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
  ```

### 3. Missing Environment Variables

**Problem**: Environment variables work locally but not in production.

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add ALL required variables (see VERCEL_ENV_SETUP.md)
3. **Important**: After adding variables, you MUST redeploy
4. Check that variables are set for the correct environment (Production/Preview/Development)

### 4. Build Succeeds but Site Shows Error

**Problem**: Build completes but runtime errors occur.

**Common Causes**:
- Missing environment variables (most common)
- Database connection string incorrect
- Prisma client not generated
- Supabase keys incorrect

**Debug Steps**:
1. Check Vercel Function Logs:
   - Go to Deployments → Select deployment → View Function Logs
   - Look for error messages
2. Check Browser Console:
   - Open site → Open DevTools → Console
   - Look for client-side errors
3. Verify Environment Variables:
   - Vercel Dashboard → Settings → Environment Variables
   - Ensure all required vars are set

### 5. Differences Between Local and Production

| Aspect | Local | Production (Vercel) |
|--------|-------|---------------------|
| Prisma Client | Generated manually | Auto-generated via postinstall |
| Database SSL | Usually not required | Required for Supabase |
| Environment Variables | From `.env` file | From Vercel dashboard |
| Build Process | `bun run build` | `prisma generate && bun run build` |
| Node Version | Your local version | Vercel's default (check settings) |

## Quick Checklist

Before deploying, ensure:

- [ ] All environment variables are set in Vercel
- [ ] `DATABASE_URL` includes SSL parameters for Supabase
- [ ] Prisma client is generated (handled by postinstall)
- [ ] Build command includes Prisma generation
- [ ] Supabase keys are correct
- [ ] `NEXT_PUBLIC_APP_URL` matches your Vercel domain

## Testing Locally with Production Settings

To test production-like behavior locally:

1. Set `NODE_ENV=production` in your `.env`
2. Use production database connection string with SSL
3. Run `bun run build && bun run start`
4. Test the production build locally

## Getting Help

If issues persist:

1. **Check Vercel Logs**: Most detailed error information
2. **Check Browser Console**: Client-side errors
3. **Verify Environment Variables**: Missing vars are #1 cause
4. **Test Database Connection**: Can you connect from local with production URL?
5. **Check Prisma Client**: Is it generated in `.next` folder?

## Common Error Messages

### "Cannot find module '@prisma/client'"
- **Fix**: Prisma client not generated. Check postinstall script runs.

### "P1001: Can't reach database server"
- **Fix**: Check DATABASE_URL and SSL settings.

### "Missing Supabase environment variables"
- **Fix**: Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel.

### "Something went wrong"
- **Fix**: Check Vercel function logs for actual error message.

