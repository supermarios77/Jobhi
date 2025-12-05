import { redirect } from "@/config/i18n/routing";
import { getMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return getMetadata({
    locale,
    title: "Menu",
    description:
      locale === "nl"
        ? "Bekijk ons volledige menu met heerlijke maaltijden"
        : locale === "fr"
        ? "Découvrez notre menu complet de plats délicieux"
        : "Browse our complete menu of delicious meals",
    path: "/menu",
  });
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Redirect to home page with menu anchor
  redirect({ href: `/#menu`, locale });
}

