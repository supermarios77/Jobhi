import { requireAdmin } from "@/lib/auth";
import { redirect } from "@/i18n/routing";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);
  redirect({ href: `/admin/dishes`, locale });
}

