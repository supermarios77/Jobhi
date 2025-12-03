import { getDishes, getCategories } from "@/lib/db/dish";
import { MenuSectionClient } from "./menu-section-client";

interface MenuSectionProps {
  locale: string;
}

export async function MenuSection({ locale }: MenuSectionProps) {
  // Get all active dishes with error handling
  let dishes: Awaited<ReturnType<typeof getDishes>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  
  try {
    [dishes, categories] = await Promise.all([
      getDishes({ isActive: true, locale: locale as "en" | "nl" | "fr" }),
      getCategories(locale as "en" | "nl" | "fr"),
    ]);
    
    // Log in production for debugging
    if (process.env.NODE_ENV === "production") {
      console.log(`[MenuSection] Fetched ${dishes.length} dishes for locale: ${locale}`);
    }
  } catch (error: unknown) {
    // Enhanced error logging for production debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as { code?: string })?.code;
    const errorName = (error as { name?: string })?.name;
    
    console.error("[MenuSection] Error fetching dishes:", {
      message: errorMessage,
      code: errorCode,
      name: errorName,
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      locale,
    });
    
    // In production, also try fetching without isActive filter to see if it's a data issue
    if (process.env.NODE_ENV === "production") {
      try {
        const allDishes = await getDishes({ locale: locale as "en" | "nl" | "fr" });
        console.log(`[MenuSection] Total dishes in DB: ${allDishes.length}, Active: ${allDishes.filter(d => d.isActive).length}`);
      } catch (fallbackError: unknown) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error("[MenuSection] Fallback query also failed:", fallbackMessage);
      }
    }
    
    // Return empty array on error to prevent page crash
    // The UI will show "No dishes available" message
  }

  return <MenuSectionClient dishes={dishes} categories={categories} locale={locale} />;
}

