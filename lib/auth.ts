import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { headers } from "next/headers";
import { UnauthorizedError } from "./errors";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  const supabase = await createClient();
  // Use getUser() instead of getSession() for better reliability
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  // Get the session after confirming user exists
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function requireAuth(locale?: string) {
  const session = await getSession();
  if (!session) {
    // Get locale from parameter or try to extract from headers
    let detectedLocale = locale;
    if (!detectedLocale) {
      try {
        const headersList = await headers();
        const referer = headersList.get("referer") || "";
        const pathMatch = referer.match(/\/(en|nl|fr)\//);
        detectedLocale = pathMatch ? pathMatch[1] : "en";
      } catch {
        detectedLocale = "en";
      }
    }
    redirect({ href: `/${detectedLocale}/admin/login`, locale: detectedLocale });
  }
  return session;
}

/**
 * Require admin role - checks both authentication and admin status
 * Checks role in Prisma database (source of truth) and Supabase user_metadata
 * Throws UnauthorizedError if user is not authenticated or not an admin
 */
export async function requireAdmin(locale?: string) {
  const session = await requireAuth(locale);
  
  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }

  // Check role in Prisma database (source of truth)
  let userRole: string | null = null;
  let prismaRole: string | null = null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    
    // Type assertion needed until Prisma client types are fully updated
    prismaRole = (user as any)?.role || null;
    userRole = prismaRole;
  } catch {
    // If Prisma query fails, fall back to Supabase metadata
    console.warn("Failed to query Prisma for user role, falling back to Supabase metadata");
  }

  // Fallback to Supabase user_metadata if Prisma user doesn't exist yet
  if (!userRole) {
    userRole = session.user.user_metadata?.role || null;
  }
  
  // Check if user is admin (Prisma enum "ADMIN" or Supabase metadata "admin")
  const isAdmin = userRole === "ADMIN" || userRole === "admin";
  
  if (!isAdmin) {
    // Log unauthorized access attempt
    console.warn("Unauthorized admin access attempt:", {
      email: session.user.email,
      role: userRole,
      userId: session.user.id,
      prismaRole: prismaRole,
      supabaseRole: session.user.user_metadata?.role,
    });
    
    throw new UnauthorizedError("Admin access required");
  }

  return session;
}
