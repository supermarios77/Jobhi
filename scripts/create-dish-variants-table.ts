/**
 * Script to create the dish_variants table in the database
 * 
 * This script can be run when Prisma migrations fail due to connection pooler issues.
 * Run with: bun run scripts/create-dish-variants-table.ts
 * 
 * Or run the SQL directly in Supabase SQL Editor:
 * - Go to Supabase Dashboard → SQL Editor
 * - Copy contents of prisma/create-dish-variants.sql
 * - Run the SQL
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function createDishVariantsTable() {
  console.log("🔧 Creating dish_variants table...\n");

  try {
    // Execute SQL statements one at a time (required for connection poolers)
    console.log("Creating table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "dish_variants" (
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
      CREATE INDEX IF NOT EXISTS "dish_variants_dishId_idx" ON "dish_variants"("dishId")
    `);

    console.log("Adding foreign key constraint...");
    // Check if constraint exists first
    const constraintExists = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dish_variants_dishId_fkey'
      ) as exists
    `);

    if (!constraintExists[0]?.exists) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "dish_variants" 
        ADD CONSTRAINT "dish_variants_dishId_fkey" 
        FOREIGN KEY ("dishId") 
        REFERENCES "dishes"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
      `);
    } else {
      console.log("Foreign key constraint already exists, skipping...");
    }

    console.log("✅ dish_variants table created successfully!\n");
    
    // Verify the table exists
    const result = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name = 'dish_variants'`
    );

    if (result.length > 0) {
      console.log("✅ Verification: dish_variants table exists in database\n");
    } else {
      console.log("⚠️  Warning: Table creation may have failed. Please check manually.\n");
    }
  } catch (error: any) {
    console.error("❌ Error creating table:", error.message);
    console.error("\n💡 Alternative: Run the SQL directly in Supabase SQL Editor:");
    console.error("   1. Go to Supabase Dashboard → SQL Editor");
    console.error("   2. Copy contents of prisma/create-dish-variants.sql");
    console.error("   3. Run the SQL\n");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDishVariantsTable();

