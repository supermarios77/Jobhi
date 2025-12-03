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
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ],
  optional: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
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
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push("SUPABASE_SERVICE_ROLE_KEY not set - some admin features may not work");
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


