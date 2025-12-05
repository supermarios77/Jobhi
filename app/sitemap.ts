import { MetadataRoute } from "next";
import { routing } from "@/config/i18n/routing";
import { getDishes } from "@/lib/db/dish";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jobhi.be";

  // Static pages
  const staticPages = routing.locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/${locale}/menu`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/${locale}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ]);

  // Dynamic dish pages
  const dishPages: MetadataRoute.Sitemap = [];
  try {
    for (const locale of routing.locales) {
      const dishes = await getDishes({
        isActive: true,
        locale: locale as "en" | "nl" | "fr",
      });

      for (const dish of dishes) {
        if (dish.slug) {
          dishPages.push({
            url: `${baseUrl}/${locale}/menu/${dish.slug}`,
            lastModified: dish.updatedAt || new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error generating sitemap for dishes:", error);
  }

  return [...staticPages, ...dishPages];
}

