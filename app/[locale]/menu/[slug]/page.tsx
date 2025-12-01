import { getDishBySlug } from "@/lib/db/dish";
import { notFound } from "next/navigation";
import { MenuItemDetailClient } from "./menu-item-detail-client";

export default async function MenuItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const dish = await getDishBySlug(slug, locale as "en" | "nl" | "fr");

  if (!dish || !dish.isActive) {
    notFound();
  }

  return <MenuItemDetailClient dish={dish} />;
}

