"use client";

import { MenuItemCard } from "@/components/menu-item-card";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

interface Dish {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  rating: number;
}

interface MenuSectionClientProps {
  dishes: Dish[];
  locale: string;
}

export function MenuSectionClient({ dishes, locale }: MenuSectionClientProps) {
  const t = useTranslations("menu");

  const handleWishlistToggle = (id: string) => {
    // TODO: Integrate with Supabase to update wishlist
    console.log("Toggle wishlist for item:", id);
  };

  const handleOrderClick = (id: string) => {
    // TODO: Navigate to order page or add to cart
    console.log("Order item:", id);
  };

  if (dishes.length === 0) {
    return null; // Don't show section if no dishes
  }

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-8 max-w-4xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-xl font-normal text-foreground mb-2 tracking-widest uppercase">
              Featured Products
            </h2>
            <p className="text-xs text-text-secondary tracking-wide">
              {dishes.length} {t("itemsAvailable", { count: dishes.length })}
            </p>
          </div>

          <Link href="/menu">
            <Button
              variant="outline"
              className="border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background text-xs px-6 py-2 tracking-widest uppercase"
            >
              View All
            </Button>
          </Link>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {dishes.map((dish) => (
            <MenuItemCard
              key={dish.id}
              id={dish.id}
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
      </div>
    </section>
  );
}

