import { redirect } from "@/i18n/routing";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Redirect to home page with menu anchor
  redirect({ href: `/#menu`, locale });
}

