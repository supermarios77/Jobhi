import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL has SSL for Supabase in production
const databaseUrl = process.env.DATABASE_URL;
let finalDatabaseUrl = databaseUrl;

if (databaseUrl && databaseUrl.includes("supabase.co") && process.env.NODE_ENV === "production") {
  // Add SSL parameter if not already present
  if (!databaseUrl.includes("sslmode=")) {
    const separator = databaseUrl.includes("?") ? "&" : "?";
    finalDatabaseUrl = `${databaseUrl}${separator}sslmode=require`;
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
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

