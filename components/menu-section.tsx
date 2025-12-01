import { MenuItemCard } from "@/components/menu-item-card";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { getDishes } from "@/lib/db/dish";
import { MenuSectionClient } from "./menu-section-client";

interface MenuSectionProps {
  locale: string;
}

export async function MenuSection({ locale }: MenuSectionProps) {
  const t = await getTranslations("menu");
  // Get first 6 active dishes as featured
  const dishes = await getDishes({ isActive: true, locale: locale as "en" | "nl" | "fr" });
  const featuredDishes = dishes.slice(0, 6);

  return <MenuSectionClient dishes={featuredDishes} locale={locale} />;
}

