# 🚀 FreshBite - Vercel Deployment Checklist

## Pre-Deployment Checklist

### ✅ Environment Variables

Configure the following environment variables in Vercel Dashboard → Settings → Environment Variables:

#### Required Variables

1. **Supabase Configuration**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Database (Prisma)**
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   ```
   - Replace `[PASSWORD]` with your Supabase database password
   - Replace `[PROJECT]` with your Supabase project reference

3. **Stripe (Production)**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
   - Get these from your Stripe Dashboard
   - For webhook secret: Configure webhook endpoint in Stripe Dashboard pointing to: `https://your-domain.com/api/stripe/webhook`

4. **Next.js App URL**
   ```
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```
   - Update this to your production domain after first deployment

#### Optional Variables

- `NODE_ENV=production` (automatically set by Vercel)

### ✅ Database Setup

1. **Run Prisma Migrations**
   ```bash
   bun run db:generate
   bun run db:push
   ```
   Or use Prisma Migrate for production:
   ```bash
   bun run db:migrate
   ```

2. **Verify Database Connection**
   - Test connection using Prisma Studio: `bun run db:studio`
   - Ensure all tables are created correctly

### ✅ Supabase Storage Setup

1. **Create Storage Bucket**
   - Go to Supabase Dashboard → Storage
   - Create bucket named: `dish-images`
   - Set bucket to **Public** (or configure RLS policies)

2. **Configure Storage Policies** (if using RLS)
   - Allow public read access for dish images
   - Restrict write access to authenticated admin users

### ✅ Stripe Webhook Configuration

1. **Create Webhook Endpoint in Stripe Dashboard**
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.succeeded` (optional)

2. **Get Webhook Secret**
   - Copy the webhook signing secret from Stripe Dashboard
   - Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### ✅ Build Configuration

1. **Build Command**: `bun run build` (configured in `vercel.json`)
2. **Install Command**: `bun install` (configured in `vercel.json`)
3. **Node.js Version**: Vercel automatically detects from `package.json`

### ✅ Runtime Configuration

All API routes using Prisma have been configured with:
```typescript
export const runtime = "nodejs";
```

This ensures compatibility with Vercel's serverless functions.

### ✅ Image Optimization

- ✅ All images use Next.js `Image` component
- ✅ Supabase image domains configured in `next.config.ts`
- ✅ Image formats: AVIF and WebP
- ✅ Cache TTL: 60 seconds

### ✅ Route Configuration

- ✅ Static routes: Home page, menu listing (with ISR)
- ✅ Dynamic routes: Menu item details, checkout, admin pages
- ✅ API routes: All configured with Node.js runtime
- ✅ Internationalization: All locales (en, nl, fr) configured

### ✅ Security Headers

Configured in `next.config.ts`:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- X-DNS-Prefetch-Control: on

## Deployment Steps

### 1. Initial Setup

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Vercel will auto-detect Next.js configuration

2. **Configure Environment Variables**
   - Add all required environment variables (see above)
   - Set them for Production, Preview, and Development environments

3. **Configure Build Settings**
   - Build Command: `bun run build`
   - Install Command: `bun install`
   - Output Directory: `.next` (auto-detected)

### 2. First Deployment

1. **Deploy to Preview**
   - Push to a branch to trigger preview deployment
   - Verify all environment variables are set
   - Check build logs for any errors

2. **Test Preview Deployment**
   - Verify all pages load correctly
   - Test authentication flow
   - Test checkout flow (use Stripe test mode)
   - Verify image loading from Supabase

3. **Deploy to Production**
   - Merge to main branch or deploy manually
   - Update `NEXT_PUBLIC_APP_URL` to production domain
   - Re-deploy to apply new environment variable

### 3. Post-Deployment

1. **Update Stripe Webhook URL**
   - Update webhook endpoint in Stripe Dashboard to production URL
   - Verify webhook secret matches environment variable

2. **Verify Database Connection**
   - Test database queries from production
   - Verify Prisma client is working correctly

3. **Test Critical Flows**
   - ✅ User authentication
   - ✅ Menu browsing
   - ✅ Checkout process
   - ✅ Payment processing
   - ✅ Admin panel access
   - ✅ Image uploads

4. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor API route performance
   - Check database query performance

## Troubleshooting

### Build Errors

1. **Prisma Client Not Generated**
   ```bash
   bun run db:generate
   ```
   Add to build command if needed: `bun run db:generate && bun run build`

2. **Environment Variables Missing**
   - Verify all variables are set in Vercel Dashboard
   - Check variable names match exactly (case-sensitive)

3. **Database Connection Errors**
   - Verify `DATABASE_URL` is correct
   - Check Supabase database is accessible
   - Ensure connection pooling is configured if needed

### Runtime Errors

1. **API Routes Failing**
   - Check runtime is set to `nodejs` for Prisma routes
   - Verify environment variables are accessible
   - Check Vercel function logs

2. **Image Loading Issues**
   - Verify Supabase storage bucket is public
   - Check image domains in `next.config.ts`
   - Verify image URLs are correct

3. **Stripe Webhook Failures**
   - Verify webhook secret matches
   - Check webhook endpoint URL is correct
   - Review Stripe webhook logs

## Performance Optimization

### Already Configured

- ✅ Image optimization (AVIF/WebP)
- ✅ Compression enabled
- ✅ Security headers
- ✅ Static generation for locales
- ✅ ISR for menu pages (can be added)

### Recommended Additions

1. **Add ISR to Menu Page**
   ```typescript
   export const revalidate = 60; // Revalidate every 60 seconds
   ```

2. **Add Database Connection Pooling**
   - Use Supabase connection pooling URL
   - Format: `postgresql://postgres:[PASSWORD]@[PROJECT].pooler.supabase.com:6543/postgres`

3. **Enable Vercel Analytics**
   - Add to `next.config.ts`:
   ```typescript
   experimental: {
     instrumentationHook: true,
   }
   ```

## Security Checklist

- ✅ Environment variables secured in Vercel
- ✅ Security headers configured
- ✅ Supabase RLS policies (if enabled)
- ✅ Stripe webhook signature verification
- ✅ Admin routes protected with authentication
- ✅ API routes validate authentication where needed

## Monitoring

1. **Vercel Dashboard**
   - Monitor deployments
   - Check function logs
   - Review analytics

2. **Supabase Dashboard**
   - Monitor database performance
   - Check storage usage
   - Review authentication logs

3. **Stripe Dashboard**
   - Monitor payment events
   - Check webhook delivery
   - Review transaction logs

## Rollback Plan

1. **Vercel Automatic Rollback**
   - Vercel automatically rolls back on build failure
   - Previous deployment remains available

2. **Manual Rollback**
   - Go to Vercel Dashboard → Deployments
   - Select previous successful deployment
   - Click "Promote to Production"

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

**Last Updated**: Deployment preparation complete
**Status**: ✅ Ready for deployment

