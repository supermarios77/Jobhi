import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL has SSL and connection pooling for Supabase in production
const databaseUrl = process.env.DATABASE_URL;
let finalDatabaseUrl = databaseUrl;

if (databaseUrl && databaseUrl.includes("supabase.co")) {
  // For Supabase, we need to use the connection pooler URL in production
  // Direct connection URL: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
  // Pooler URL: postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
  
  // Check if it's already a pooler URL
  const isPoolerUrl = databaseUrl.includes("pooler.supabase.com") || databaseUrl.includes(":6543");
  
  if (!isPoolerUrl && process.env.NODE_ENV === "production") {
    // Convert direct connection to pooler URL for better connection management
    // Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
    const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co:5432\/(.+)/);
    if (urlMatch) {
      const [, user, password, projectRef, database] = urlMatch;
      // Use pooler URL - this is more reliable for serverless environments
      finalDatabaseUrl = `postgresql://${user}.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/${database}?pgbouncer=true&sslmode=require`;
      console.log("[Prisma] Using Supabase connection pooler for production");
    }
  }
  
  // Add SSL parameter if not already present
  if (!finalDatabaseUrl.includes("sslmode=")) {
    const separator = finalDatabaseUrl.includes("?") ? "&" : "?";
    finalDatabaseUrl = `${finalDatabaseUrl}${separator}sslmode=require`;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: finalDatabaseUrl !== databaseUrl
      ? {
          db: {
            url: finalDatabaseUrl,
          },
        }
      : undefined,
    // Connection pool configuration for serverless
    ...(process.env.NODE_ENV === "production" && {
      // Use connection pooling settings optimized for serverless
      // These prevent connection exhaustion
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

