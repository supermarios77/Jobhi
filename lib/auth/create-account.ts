/**
 * Utility function to create a user account after checkout
 * Creates account in Supabase Auth, syncs with Prisma User model, and sends magic link email
 */

import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

// Create admin client for user creation
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface CreateAccountData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CreateAccountResult {
  userId: string; // Prisma User.id (not Supabase Auth ID)
  email: string;
  magicLinkSent: boolean;
}

/**
 * Creates a user account in Supabase Auth, syncs with Prisma User model, and sends a magic link email
 * Returns the Prisma User ID that should be used to link the order
 */
export async function createAccountForUser(
  data: CreateAccountData
): Promise<CreateAccountResult> {
  const { email, firstName, lastName, phone } = data;

  if (!email) {
    throw new Error("Email is required to create an account");
  }

  try {
    // Check if Prisma User already exists
    let prismaUser = await prisma.user.findUnique({
      where: { email },
    });

    // Check if Supabase Auth user exists
    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      throw new Error(`Failed to check existing users: ${listError.message}`);
    }

    const existingAuthUser = existingUsers?.users?.find(
      (user) => user.email === email
    );

    if (prismaUser && existingAuthUser) {
      // User already exists in both systems, send magic link
      const { error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: email,
      });

      return {
        userId: prismaUser.id,
        email: email,
        magicLinkSent: !linkError,
      };
    }

    // Create new Supabase Auth user
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || undefined;

    let authUserId: string;

    if (existingAuthUser) {
      // Auth user exists but no Prisma user - create Prisma user
      authUserId = existingAuthUser.id;
    } else {
      // Create new auth user
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email,
          email_confirm: false, // User will confirm via magic link
          user_metadata: {
            name: fullName,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
          },
        });

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      if (!newUser.user) {
        throw new Error("User creation succeeded but no user data returned");
      }

      authUserId = newUser.user.id;
    }

    // Create or update Prisma User record
    if (!prismaUser) {
      prismaUser = await prisma.user.create({
        data: {
          email: email,
          name: fullName,
          role: "CUSTOMER", // Default role for regular users
        },
      });
    } else {
      // Update existing user if needed (sync name, etc.)
      prismaUser = await prisma.user.update({
        where: { email },
        data: {
          name: fullName || prismaUser.name,
        },
      });
    }

    // Send magic link email
    const { error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
    });

    if (linkError) {
      console.error("Failed to send magic link:", linkError);
      // Don't throw - account was created, just magic link failed
    }

    return {
      userId: prismaUser.id, // Return Prisma User ID for order linking
      email: email,
      magicLinkSent: !linkError,
    };
  } catch (error: any) {
    console.error("Error creating account:", error);
    throw error;
  }
}

