import { requireAdmin } from "@/lib/auth";
import { redirect } from "@/config/i18n/routing";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);
  // Use relative path since we're already in /admin route
  redirect({ href: "dishes", locale });
}

