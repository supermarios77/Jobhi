/**
 * Script to sync user roles from Supabase Auth to Prisma
 * 
 * This script updates Prisma User records with roles from Supabase user_metadata
 * Run with: bun run scripts/sync-user-roles.ts
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const prisma = new PrismaClient();

async function syncUserRoles() {
  console.log("🔄 Syncing user roles from Supabase to Prisma...\n");

  try {
    // Get all users from Supabase
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("❌ Error listing users:", listError.message);
      process.exit(1);
    }

    if (!users?.users || users.users.length === 0) {
      console.log("⚠️  No users found in Supabase");
      return;
    }

    let synced = 0;
    let created = 0;
    let errors = 0;

    for (const supabaseUser of users.users) {
      if (!supabaseUser.email) continue;

      const supabaseRole = supabaseUser.user_metadata?.role;
      const prismaRole = supabaseRole === "admin" ? "ADMIN" : "CUSTOMER";

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: supabaseUser.email },
        });

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { email: supabaseUser.email },
            data: {
              role: prismaRole as any,
              name: supabaseUser.user_metadata?.name || existingUser.name,
            } as any,
          });
          synced++;
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              email: supabaseUser.email,
              name: supabaseUser.user_metadata?.name || null,
              role: prismaRole as any,
            } as any,
          });
          created++;
        }
      } catch (error: any) {
        console.error(`❌ Error syncing user ${supabaseUser.email}:`, error.message);
        errors++;
      }
    }

    console.log("✅ Role sync completed!\n");
    console.log(`   Updated: ${synced} users`);
    console.log(`   Created: ${created} users`);
    if (errors > 0) {
      console.log(`   Errors:  ${errors} users`);
    }
  } catch (error: any) {
    console.error("❌ Unexpected error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncUserRoles();

