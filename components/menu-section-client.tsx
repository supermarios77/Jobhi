"use client";

import { useState } from "react";
import { MenuItemCard } from "@/components/menu-item-card";
import { useTranslations } from "next-intl";
import { ChevronDown, X } from "lucide-react";

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);

  return (
    <section id="menu" className="bg-background py-16">
      <div className="container mx-auto px-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 lg:mb-12">
          <div>
            <h2 className="text-xl font-normal text-foreground mb-2 tracking-widest uppercase">
              {t("title")}
            </h2>
            <p className="text-xs text-text-secondary tracking-wide">
              {t("itemsAvailable", { count: filteredDishes.length })}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-6 py-2 border-2 border-foreground bg-transparent text-foreground font-normal text-xs hover:bg-foreground hover:text-background transition-all tracking-widest uppercase flex items-center gap-2"
              >
                {selectedCategory ? selectedCategory.name : t("filter")}
                <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Filter Dropdown */}
              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-card border border-border shadow-soft z-20 min-w-[200px]">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setSelectedCategoryId(null);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs tracking-wide uppercase transition-colors ${
                          selectedCategoryId === null
                            ? "bg-foreground text-background"
                            : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        {t("allCategories")}
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategoryId(category.id);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs tracking-wide uppercase transition-colors ${
                            selectedCategoryId === category.id
                              ? "bg-foreground text-background"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Clear filter button */}
            {selectedCategoryId && (
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="p-2 text-text-secondary hover:text-foreground transition-colors"
                aria-label="Clear filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Menu Grid */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm tracking-wide">
              {selectedCategoryId
                ? t("noDishesInCategory")
                : "No dishes available yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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

