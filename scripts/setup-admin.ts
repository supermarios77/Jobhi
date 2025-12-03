/**
 * Setup script to create an admin user in Supabase and Prisma
 * 
 * Run with: bun run setup:admin
 * 
 * This will create an admin user with the following credentials:
 * Email: admin@freshbite.com
 * Password: Set via ADMIN_PASSWORD environment variable or will be auto-generated
 * 
 * Environment variables:
 * - ADMIN_PASSWORD: (optional) Password for admin user. If not set, a random password will be generated.
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

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

/**
 * Generate a secure random password
 */
function generateSecurePassword(): string {
  // Generate a 16-character password with mixed case, numbers, and special chars
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const passwordLength = 16;
  let password = "";
  
  // Ensure at least one of each type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  password += "0123456789"[Math.floor(Math.random() * 10)];
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
  
  // Fill the rest randomly
  for (let i = password.length; i < passwordLength; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

async function setupAdmin() {
  const adminEmail = "admin@freshbite.com";
  // Use environment variable or generate a secure random password
  const adminPassword = process.env.ADMIN_PASSWORD || generateSecurePassword();

  console.log("🔧 Setting up admin user...\n");

  try {
    // Try to list users and check if admin exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Error checking users:", listError.message);
      process.exit(1);
    }

    const existingUser = users?.users?.find((user: any) => user.email === adminEmail);

    if (existingUser) {
      console.log("⚠️  Admin user already exists!");
      console.log(`   Email: ${adminEmail}`);
      console.log("\n💡 To reset password, use Supabase Dashboard or delete the user first.");
      return;
    }

    // Create admin user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: "admin",
        name: "Admin",
      },
    });

    if (createError) {
      console.error("❌ Error creating admin user:", createError.message);
      process.exit(1);
    }

    // Create or update Prisma User with ADMIN role
    try {
      await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
          role: "ADMIN",
          name: "Admin",
        },
        create: {
          email: adminEmail,
          name: "Admin",
          role: "ADMIN",
        },
      });
      console.log("✅ Prisma user synced with ADMIN role\n");
    } catch (prismaError: any) {
      console.error("⚠️  Warning: Failed to sync Prisma user:", prismaError.message);
      console.error("   The admin user was created in Supabase but not in Prisma.");
      console.error("   You may need to run: prisma db push\n");
    }

    console.log("✅ Admin user created successfully!\n");
    console.log("📧 Admin Credentials:");
    console.log("   Email:    " + adminEmail);
    // Only show password if it was provided via env var (user knows it)
    // Otherwise, show it once for the generated password
    if (process.env.ADMIN_PASSWORD) {
      console.log("   Password: [Using ADMIN_PASSWORD from environment]");
    } else {
      console.log("   Password: " + adminPassword);
      console.log("   ⚠️  SECURITY: Save this password now - it won't be shown again!");
    }
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
    console.log("   Login URLs (localized):");
    console.log("   - English: /en/admin/login");
    console.log("   - Dutch:   /nl/admin/login");
    console.log("   - French: /fr/admin/login\n");
  } catch (error: any) {
    console.error("❌ Unexpected error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();

