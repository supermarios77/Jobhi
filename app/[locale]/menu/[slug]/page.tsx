import { getDishBySlug } from "@/lib/db/dish";
import { notFound } from "next/navigation";
import { MenuItemDetailClient } from "./menu-item-detail-client";
import { getMetadata } from "@/lib/metadata";
import { getProductStructuredData, getBreadcrumbStructuredData } from "@/lib/structured-data";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const dish = await getDishBySlug(slug, locale as "en" | "nl" | "fr");

  if (!dish || !dish.isActive) {
    return getMetadata({ locale, path: `/menu/${slug}`, noindex: true });
  }

  const name =
    locale === "en"
      ? dish.nameEn || dish.name
      : locale === "nl"
      ? dish.nameNl || dish.name
      : dish.nameFr || dish.name;

  const description =
    locale === "en"
      ? dish.descriptionEn || dish.description || `Order ${name} - €${dish.price.toFixed(2)}`
      : locale === "nl"
      ? dish.descriptionNl || dish.description || `Bestel ${name} - €${dish.price.toFixed(2)}`
      : dish.descriptionFr || dish.description || `Commandez ${name} - €${dish.price.toFixed(2)}`;

  return getMetadata({
    locale,
    title: name,
    description,
    path: `/menu/${slug}`,
    image: dish.imageUrl || undefined,
  });
}

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jobhi.be";
  const productStructuredData = getProductStructuredData(
    {
      name: dish.name,
      nameEn: dish.nameEn,
      nameNl: dish.nameNl,
      nameFr: dish.nameFr,
      description: dish.description,
      descriptionEn: dish.descriptionEn,
      descriptionNl: dish.descriptionNl,
      descriptionFr: dish.descriptionFr,
      price: dish.price,
      imageUrl: dish.imageUrl,
      slug: dish.slug,
    },
    locale
  );

  const breadcrumbStructuredData = getBreadcrumbStructuredData([
    { name: locale === "nl" ? "Home" : locale === "fr" ? "Accueil" : "Home", url: `${baseUrl}/${locale}` },
    { name: locale === "nl" ? "Menu" : locale === "fr" ? "Menu" : "Menu", url: `${baseUrl}/${locale}/menu` },
    {
      name:
        locale === "en"
          ? dish.nameEn || dish.name
          : locale === "nl"
          ? dish.nameNl || dish.name
          : dish.nameFr || dish.name,
      url: `${baseUrl}/${locale}/menu/${slug}`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <MenuItemDetailClient dish={dish} />
    </>
  );
}

