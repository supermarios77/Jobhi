import { getSession } from "@/lib/auth";
import { AdminLogoutButton } from "./logout-button";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Get the current pathname to check if we're on the login page
  let isLoginPage = false;
  let locale = "en";
  
  try {
    const headersList = await headers();
    // Try multiple ways to get the pathname
    const pathname = 
      headersList.get("x-pathname") || 
      headersList.get("x-invoke-path") ||
      headersList.get("referer")?.split("?")[0] || 
      "";
    
    isLoginPage = pathname.includes("/admin/login");
    
    // Extract locale from pathname
    const pathMatch = pathname.match(/\/(en|nl|fr)\//);
    if (pathMatch) {
      locale = pathMatch[1];
    }
  } catch {
    // If we can't determine, assume we're not on login page
  }

  // Redirect to login if not authenticated (but not if we're already on login page)
  if (!session && !isLoginPage) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <div className="min-h-screen bg-background">
      {session && (
        <div className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">{session.user.email}</span>
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}

