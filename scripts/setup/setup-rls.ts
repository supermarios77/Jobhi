/**
 * Setup script to configure RLS policies for cart_sessions table
 * 
 * Run with: bun run setup:rls
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setupRLS() {
  console.log("🔧 Setting up RLS policies for cart_sessions...\n");

  try {
    // Enable Row Level Security
    await prisma.$executeRaw`
      ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;
    `;
    console.log("✅ Enabled Row Level Security");

    // Drop existing policies if they exist
    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Allow all reads" ON cart_sessions;
    `;
    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Allow all inserts" ON cart_sessions;
    `;
    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Allow all updates" ON cart_sessions;
    `;
    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Allow all deletes" ON cart_sessions;
    `;
    console.log("✅ Cleaned up existing policies");

    // Create permissive policies for anonymous cart access
    await prisma.$executeRaw`
      CREATE POLICY "Allow all reads" ON cart_sessions
        FOR SELECT
        USING (true);
    `;
    console.log("✅ Created SELECT policy");

    await prisma.$executeRaw`
      CREATE POLICY "Allow all inserts" ON cart_sessions
        FOR INSERT
        WITH CHECK (true);
    `;
    console.log("✅ Created INSERT policy");

    await prisma.$executeRaw`
      CREATE POLICY "Allow all updates" ON cart_sessions
        FOR UPDATE
        USING (true)
        WITH CHECK (true);
    `;
    console.log("✅ Created UPDATE policy");

    await prisma.$executeRaw`
      CREATE POLICY "Allow all deletes" ON cart_sessions
        FOR DELETE
        USING (true);
    `;
    console.log("✅ Created DELETE policy");

    console.log("\n🎉 RLS policies setup complete!");
    console.log("   The cart_sessions table is now accessible via Supabase.\n");
  } catch (error: any) {
    console.error("❌ Error setting up RLS:", error.message);
    
    if (error.message.includes("already exists")) {
      console.log("\n💡 Policies may already exist. This is okay!");
    } else {
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupRLS();

