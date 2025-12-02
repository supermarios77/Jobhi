"use client";

import { MenuItemCard } from "@/components/menu-item-card";
import { useTranslations } from "next-intl";

interface Dish {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  rating: number;
}

interface MenuClientProps {
  dishes: Dish[];
  locale: string;
}

export function MenuClient({ dishes, locale }: MenuClientProps) {
  const t = useTranslations("menu");

  const handleWishlistToggle = (id: string) => {
    // TODO: Integrate with Supabase to update wishlist
    console.log("Toggle wishlist for item:", id);
  };

  const handleOrderClick = (id: string) => {
    // TODO: Navigate to order page or add to cart
    console.log("Order item:", id);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 lg:py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 lg:mb-12">
          <div>
            <h1 className="text-xl font-normal text-foreground mb-2 tracking-widest uppercase">
              {t("title")}
            </h1>
            <p className="text-xs text-text-secondary tracking-wide">
              {t("itemsAvailable", { count: dishes.length })}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3">
            <button className="px-6 py-2 border-2 border-foreground bg-transparent text-foreground font-normal text-xs hover:bg-foreground hover:text-background transition-all tracking-widest uppercase">
              {t("filter")}
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        {dishes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm tracking-wide">
              No dishes available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {dishes.map((dish) => (
              <MenuItemCard
                key={dish.id}
                id={dish.id}
                slug={dish.slug}
                name={dish.name}
                price={dish.price}
                imageSrc={dish.imageUrl || "/placeholder-dish.jpg"}
                imageAlt={dish.name}
                rating={dish.rating || 0}
                isWishlisted={false}
                onWishlistToggle={handleWishlistToggle}
                onOrderClick={handleOrderClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

