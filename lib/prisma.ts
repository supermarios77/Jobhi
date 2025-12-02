import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Supabase requires SSL for production connections
const databaseUrl = process.env.DATABASE_URL;
const needsSSL = databaseUrl?.includes("supabase.co") && process.env.NODE_ENV === "production";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: needsSSL
      ? {
          db: {
            url: databaseUrl + "?sslmode=require",
          },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

