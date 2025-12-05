/**
 * Script to create dish_variants table using direct database connection
 * 
 * This script temporarily uses the direct connection (port 5432) instead of 
 * the pooler (port 6543) to avoid prepared statement issues.
 * 
 * Run with: DATABASE_URL_DIRECT=your_direct_url bun run scripts/create-dish-variants-direct.ts
 * 
 * Or set DATABASE_URL_DIRECT in .env file with your direct Supabase connection string
 * (port 5432, not 6543)
 */

import { PrismaClient } from "@prisma/client";

// Use direct connection if provided, otherwise use regular DATABASE_URL
const directUrl = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

if (!directUrl) {
  console.error("❌ Missing DATABASE_URL or DATABASE_URL_DIRECT");
  console.error("\n💡 To use direct connection:");
  console.error("   1. Get your direct connection string from Supabase Dashboard");
  console.error("      (Settings → Database → Connection string → Direct connection)");
  console.error("   2. Set DATABASE_URL_DIRECT in .env or run:");
  console.error("      DATABASE_URL_DIRECT=your_direct_url bun run scripts/create-dish-variants-direct.ts\n");
  process.exit(1);
}

// Convert pooler URL to direct URL if needed
let finalUrl = directUrl;
if (directUrl.includes("pooler.supabase.com") || directUrl.includes(":6543")) {
  // Convert pooler URL to direct URL
  finalUrl = directUrl
    .replace(/pooler\.supabase\.com:6543/, "supabase.co:5432")
    .replace(/aws-\d+-([^.]+)\.pooler/, "db.$1")
    .replace(/\.([^.]+):([^@]+)@/, ":$2@") // Remove project ref from username
    .replace(/\?.*$/, ""); // Remove query parameters
  console.log("⚠️  Converted pooler URL to direct connection for migration");
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: finalUrl,
    },
  },
});

async function createDishVariantsTable() {
  console.log("🔧 Creating dish_variants table using direct connection...\n");

  try {
    // Check if table already exists
    const tableExists = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dish_variants'
      ) as exists
    `);

    if (tableExists[0]?.exists) {
      console.log("✅ dish_variants table already exists!\n");
      return;
    }

    console.log("Creating table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "dish_variants" (
        "id" TEXT NOT NULL,
        "dishId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL,
        "nameNl" TEXT NOT NULL,
        "nameFr" TEXT NOT NULL,
        "imageUrl" TEXT,
        "price" DOUBLE PRECISION,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "dish_variants_pkey" PRIMARY KEY ("id")
      )
    `);

    console.log("Creating index...");
    await prisma.$executeRawUnsafe(`
      CREATE INDEX "dish_variants_dishId_idx" ON "dish_variants"("dishId")
    `);

    console.log("Adding foreign key constraint...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "dish_variants" 
      ADD CONSTRAINT "dish_variants_dishId_fkey" 
      FOREIGN KEY ("dishId") 
      REFERENCES "dishes"("id") 
      ON DELETE CASCADE 
      ON UPDATE CASCADE
    `);

    console.log("\n✅ dish_variants table created successfully!\n");
  } catch (error: any) {
    console.error("❌ Error creating table:", error.message);
    console.error("\n💡 Alternative: Run the SQL directly in Supabase SQL Editor:");
    console.error("   1. Go to Supabase Dashboard → SQL Editor");
    console.error("   2. Copy and run the SQL from database/migrations/create-dish-variants.sql\n");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDishVariantsTable();

