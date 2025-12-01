import { getSession } from "@/lib/auth";
import { AdminLogoutButton } from "./logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Don't check authentication here - let individual pages handle it
  // This prevents redirect loops on the login page

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

