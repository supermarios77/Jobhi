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

  // Redirect to login if not authenticated
  if (!session) {
    // Get locale from headers/pathname
    try {
      const headersList = await headers();
      const pathname = headersList.get("x-pathname") || headersList.get("referer") || "";
      const pathMatch = pathname.match(/\/(en|nl|fr)\//);
      const locale = pathMatch ? pathMatch[1] : "en";
      redirect(`/${locale}/admin/login`);
    } catch {
      redirect("/en/admin/login");
    }
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

