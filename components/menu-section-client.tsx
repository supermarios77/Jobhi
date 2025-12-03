"use client";

import { useState } from "react";
import { MenuItemCard } from "@/components/menu-item-card";
import { useTranslations } from "next-intl";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Dish {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  rating: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface MenuSectionClientProps {
  dishes: Dish[];
  categories: Category[];
  locale: string;
}

export function MenuSectionClient({ dishes, categories, locale }: MenuSectionClientProps) {
  const t = useTranslations("menu");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleWishlistToggle = (id: string) => {
    // TODO: Integrate with Supabase to update wishlist
    console.log("Toggle wishlist for item:", id);
  };

  const handleOrderClick = (id: string) => {
    // TODO: Navigate to order page or add to cart
    console.log("Order item:", id);
  };

  // Filter dishes by selected category
  const filteredDishes = selectedCategoryId
    ? dishes.filter((dish) => dish.category?.id === selectedCategoryId)
    : dishes;

  return (
    <section id="menu" className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-normal text-foreground mb-2 tracking-widest uppercase">
                {t("title")}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary tracking-wide">
                {t("itemsAvailable", { count: filteredDishes.length })}
              </p>
            </div>
          </div>

          {/* Category Filter Buttons */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`px-3 sm:px-4 py-2 border-2 font-normal text-xs tracking-widest uppercase transition-all ${
                  selectedCategoryId === null
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                {t("allCategories")}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`px-3 sm:px-4 py-2 border-2 font-normal text-xs tracking-widest uppercase transition-all ${
                    selectedCategoryId === category.id
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Menu Grid */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <p className="text-text-secondary text-sm sm:text-base tracking-wide">
              {selectedCategoryId
                ? t("noDishesInCategory")
                : "No dishes available yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredDishes.map((dish) => (
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
    </section>
  );
}

