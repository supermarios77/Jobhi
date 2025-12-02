import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { headers } from "next/headers";
import { UnauthorizedError } from "./errors";

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
    redirect(`/${detectedLocale}/admin/login`);
  }
  return session;
}

/**
 * Require admin role - checks both authentication and admin status
 * Throws UnauthorizedError if user is not authenticated or not an admin
 */
export async function requireAdmin(locale?: string) {
  const session = await requireAuth(locale);
  
  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }

  // Check if user has admin role in user_metadata
  const userRole = session.user.user_metadata?.role;
  
  if (userRole !== "admin") {
    // Log unauthorized access attempt
    console.warn("Unauthorized admin access attempt:", {
      email: session.user.email,
      role: userRole,
      userId: session.user.id,
    });
    
    throw new UnauthorizedError("Admin access required");
  }

  return session;
}
