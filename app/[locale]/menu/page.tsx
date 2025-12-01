import { MenuItemCard } from "@/components/menu-item-card";
import { getTranslations } from "next-intl/server";
import { getDishes } from "@/lib/db/dish";
import { MenuClient } from "./menu-client";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("menu");
  const dishes = await getDishes({ isActive: true, locale: locale as "en" | "nl" | "fr" });

  return <MenuClient dishes={dishes} locale={locale} />;
}

