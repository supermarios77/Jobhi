import { getSession } from "@/lib/auth";
import { AdminLogoutButton } from "./logout-button";
import { redirect } from "@/i18n/routing";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  // Redirect to login if not authenticated
  if (!session) {
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

