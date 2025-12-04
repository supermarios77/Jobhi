/**
 * Environment variable validation
 * Validates required environment variables on startup
 */

interface EnvConfig {
  required: string[];
  optional: Record<string, string | undefined>;
}

const envConfig: EnvConfig = {
  required: [
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    // New Supabase API keys are required (legacy keys supported as fallback)
    // Note: Validation logic checks for either new or legacy keys
  ],
  optional: {
    // New Supabase API keys (REQUIRED - preferred)
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    // Legacy Supabase API keys (fallback only, deprecated Nov 2025)
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    // Other optional variables
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    USE_POOLER: process.env.USE_POOLER,
    SUPABASE_REGION: process.env.SUPABASE_REGION,
  },
};

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required variables
  for (const key of envConfig.required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }
  
  // Warn about missing optional but recommended variables
  const warnings: string[] = [];
  
  if (!process.env.STRIPE_SECRET_KEY) {
    warnings.push("STRIPE_SECRET_KEY not set - payment processing will be in mock mode");
  }
  
  // Check for Supabase keys (prioritize new keys, fallback to legacy for compatibility)
  const hasNewPublishableKey = !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const hasNewSecretKey = !!process.env.SUPABASE_SECRET_KEY;
  const hasLegacyPublishableKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasLegacySecretKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const hasPublishableKey = hasNewPublishableKey || hasLegacyPublishableKey;
  const hasSecretKey = hasNewSecretKey || hasLegacySecretKey;
  
  // Require new keys (preferred)
  if (!hasNewPublishableKey && !hasLegacyPublishableKey) {
    errors.push(
      "Missing Supabase publishable key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (new) or NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy)"
    );
  } else if (!hasNewPublishableKey && hasLegacyPublishableKey) {
    // Warn if using legacy but not new
    warnings.push(
      "⚠️  Using legacy NEXT_PUBLIC_SUPABASE_ANON_KEY. Migrate to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (deprecated Nov 2025)"
    );
  }
  
  if (!hasNewSecretKey && !hasLegacySecretKey) {
    warnings.push(
      "Missing Supabase secret key. Set SUPABASE_SECRET_KEY (new) or SUPABASE_SERVICE_ROLE_KEY (legacy) - admin features require this"
    );
  } else if (!hasNewSecretKey && hasLegacySecretKey) {
    // Warn if using legacy but not new
    warnings.push(
      "⚠️  Using legacy SUPABASE_SERVICE_ROLE_KEY. Migrate to SUPABASE_SECRET_KEY (deprecated Nov 2025)"
    );
  }
  
  // Success message if using new keys
  if (hasNewPublishableKey && hasNewSecretKey) {
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Using new Supabase API keys (sb_publishable_... and sb_secret_...)");
    }
  }
  
  if (warnings.length > 0 && process.env.NODE_ENV === "production") {
    console.warn("⚠️  Environment warnings:", warnings);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate on module load (only in server-side code)
if (typeof window === "undefined") {
  const validation = validateEnv();
  if (!validation.valid) {
    console.error("❌ Environment validation failed:");
    validation.errors.forEach((error) => console.error(`  - ${error}`));
    
    // In production, throw error to prevent startup
    if (process.env.NODE_ENV === "production") {
      throw new Error("Environment validation failed. Please check your environment variables.");
    }
  } else {
    console.log("✅ Environment variables validated");
  }
}


