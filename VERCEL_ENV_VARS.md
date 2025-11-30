# Environment Variables for Vercel

Copy and paste these into Vercel Dashboard → Settings → Environment Variables

## Required Variables

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Database (Prisma)
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

**Note**: Replace `[PASSWORD]` with your Supabase database password and `[PROJECT]` with your project reference.

### Stripe (Production)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Note**: 
- Get these from [Stripe Dashboard](https://dashboard.stripe.com)
- For webhook secret: Configure webhook endpoint in Stripe pointing to: `https://your-domain.com/api/stripe/webhook`

### Next.js App URL
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Note**: Update this after first deployment with your actual production domain.

## Optional Variables

These are automatically set by Vercel:
- `NODE_ENV=production` (auto-set)

## Environment-Specific Setup

### Production
Set all variables above with production values.

### Preview
Use the same variables as production (or test values for Stripe).

### Development
Use development/test values:
- Stripe: Use test keys (`pk_test_...`, `sk_test_...`)
- Database: Can use same Supabase project or separate dev database

## Verification Checklist

After setting environment variables:

- [ ] All Supabase variables are set
- [ ] Database URL is correct and accessible
- [ ] Stripe keys are production keys (for production environment)
- [ ] Stripe webhook secret matches the webhook configured in Stripe Dashboard
- [ ] `NEXT_PUBLIC_APP_URL` matches your Vercel deployment URL
- [ ] All variables are set for Production, Preview, and Development environments

## Security Notes

- ✅ Never commit these values to Git
- ✅ Use Vercel's environment variable encryption
- ✅ Rotate keys regularly
- ✅ Use different keys for development and production
- ✅ Restrict Supabase service role key access

