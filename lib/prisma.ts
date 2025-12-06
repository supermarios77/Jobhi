import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL has SSL and connection pooling for Supabase in production
const databaseUrl = process.env.DATABASE_URL;
let finalDatabaseUrl = databaseUrl;

if (databaseUrl && databaseUrl.includes("supabase.co")) {
  // Check if it's already a pooler URL
  const isPoolerUrl = databaseUrl.includes("pooler.supabase.com") || databaseUrl.includes(":6543");
  
  // Use pooler URL in production (required for serverless) or if USE_POOLER env var is set
  const shouldUsePooler = process.env.NODE_ENV === "production" || process.env.USE_POOLER === "true";
  
  // In development, prefer direct connection unless explicitly using pooler
  if (isPoolerUrl && process.env.NODE_ENV === "development" && !process.env.USE_POOLER) {
    // Try to convert pooler URL back to direct connection for development
    // Pooler formats:
    //   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
    //   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:6543/postgres
    // Direct: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
    const poolerMatch = databaseUrl.match(/postgresql:\/\/([^.]+)\.([^:]+):([^@]+)@([^\/]+)\/([^?]+)/);
    if (poolerMatch) {
      const [, user, projectRef, password, hostname, database] = poolerMatch;
      // Extract database name and project ref from pooler URL
      // User is typically "postgres", projectRef is the Supabase project reference
      finalDatabaseUrl = `postgresql://${user}:${password}@db.${projectRef}.supabase.co:5432/${database}?sslmode=require`;
      logger.log(`[Prisma] Converted pooler URL (${hostname}) to direct connection for development (port 5432)`);
    } else {
      // If we can't convert, use the pooler URL but ensure it has correct parameters
      logger.warn("[Prisma] Could not convert pooler URL to direct connection. Using pooler URL in development. Set USE_POOLER=true to suppress this warning.");
    }
  } else if (!isPoolerUrl && shouldUsePooler) {
    // For serverless (Vercel), we MUST use the connection pooler
    // Direct connections (port 5432) get closed between function invocations
    // Pooler connections (port 6543) are designed for serverless
    
    // Try to convert direct connection to pooler URL
    // Direct: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
    // Pooler: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
    const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co:5432\/([^?]+)/);
    if (urlMatch) {
      const [, user, password, projectRef, database] = urlMatch;
      
      // Common Supabase regions - try to detect or default to eu-central-1
      // You can override by setting SUPABASE_REGION env var
      const region = process.env.SUPABASE_REGION || "eu-central-1";
      
      // Try both aws-0- and aws-1- prefixes (different Supabase regions use different prefixes)
      // Most common is aws-0-, but some regions use aws-1-
      const poolerPrefix = process.env.SUPABASE_POOLER_PREFIX || "aws-0";
      
      // Convert to pooler URL
      // Use ?pgbouncer=true&connection_limit=1 to disable prepared statements
      // pgbouncer=true tells Prisma to not use prepared statements (required for transaction mode)
      finalDatabaseUrl = `postgresql://${user}.${projectRef}:${password}@${poolerPrefix}-${region}.pooler.supabase.com:6543/${database}?pgbouncer=true&connection_limit=1&sslmode=require`;
      logger.log(`[Prisma] Converted direct connection to pooler URL (region: ${region}, prefix: ${poolerPrefix})`);
      logger.warn(`[Prisma] IMPORTANT: If this fails, get the exact pooler URL from Supabase Dashboard → Settings → Database → Connection Pooling`);
    } else {
      logger.warn("[Prisma] Could not auto-convert to pooler URL. Please use pooler URL from Supabase Dashboard.");
    }
  } else if (!isPoolerUrl && process.env.NODE_ENV === "development") {
    // In development, log a warning if direct connection might fail
    logger.log("[Prisma] Using direct connection (port 5432). If connection fails, set USE_POOLER=true to use pooler.");
  }
  
  // Ensure pooler URLs have required parameters (required for pgBouncer)
  if (finalDatabaseUrl && (finalDatabaseUrl.includes("pgbouncer=true") || finalDatabaseUrl.includes("pooler.supabase.com"))) {
    const separator = finalDatabaseUrl.includes("?") ? "&" : "?";
    let needsUpdate = false;
    let updatedUrl = finalDatabaseUrl;
    
    // Ensure pgbouncer=true is present (this disables prepared statements in Prisma)
    if (!updatedUrl.includes("pgbouncer=true")) {
      updatedUrl = `${updatedUrl}${separator}pgbouncer=true`;
      needsUpdate = true;
    }
    
    // connection_limit=1 helps with serverless environments
    if (!updatedUrl.includes("connection_limit=")) {
      const newSeparator = updatedUrl.includes("?") ? "&" : "?";
      updatedUrl = `${updatedUrl}${newSeparator}connection_limit=1`;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      finalDatabaseUrl = updatedUrl;
      logger.log("[Prisma] Added required parameters to pooler URL (pgbouncer=true, connection_limit=1)");
    }
  }
  
  // Add SSL parameter if not already present
  if (finalDatabaseUrl && !finalDatabaseUrl.includes("sslmode=")) {
    const separator = finalDatabaseUrl.includes("?") ? "&" : "?";
    finalDatabaseUrl = `${finalDatabaseUrl}${separator}sslmode=require`;
  }
}

// Log the final connection URL (without password) for debugging
// SECURITY: Always mask passwords in logs, even in development
if (finalDatabaseUrl) {
  // Mask password in connection string - handles both :password@ and :password:port@ formats
  const safeUrl = finalDatabaseUrl.replace(/:([^:@]+)@/, ":***@");
  if (process.env.NODE_ENV === "production") {
    logger.log(`[Prisma] Final connection URL: ${safeUrl}`);
  } else {
    // In development, only log if explicitly enabled
    if (process.env.DEBUG_DATABASE_URL === "true") {
      logger.log(`[Prisma] Final connection URL: ${safeUrl}`);
    }
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: finalDatabaseUrl && finalDatabaseUrl !== databaseUrl
      ? {
          db: {
            url: finalDatabaseUrl,
          },
        }
      : undefined,
    // Note: pgBouncer compatibility is handled via the connection string parameter
    // The pgbouncer=true parameter in the URL tells Prisma to disable prepared statements
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

