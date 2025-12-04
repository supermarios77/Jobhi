/**
 * Script to add serves column to dishes table
 * Run with: bun run scripts/add-serves-column.ts
 */

import { prisma } from "@/lib/prisma";

async function addServesColumn() {
  console.log("🔧 Adding serves column to dishes table...\n");

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "dishes" 
      ADD COLUMN IF NOT EXISTS "serves" INTEGER;
    `);

    console.log("✅ serves column added successfully!\n");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error adding column:", errorMessage);
    console.error("\n💡 Alternative: Run the SQL directly in Supabase SQL Editor:");
    console.error("   Copy contents of prisma/add-serves-column.sql\n");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addServesColumn();

