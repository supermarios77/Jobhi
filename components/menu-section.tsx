"use client";

import { MenuItemCard } from "@/components/menu-item-card";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

// Mock data - will be replaced with Supabase integration later
const featuredMeals = [
  {
    id: "1",
    name: "Grilled Salmon with Seasonal Vegetables",
    price: 18.99,
    imageSrc: undefined,
    rating: 4.5,
    isWishlisted: false,
  },
  {
    id: "2",
    name: "Beef Bourguignon with Mashed Potatoes",
    price: 22.50,
    imageSrc: undefined,
    rating: 4.8,
    isWishlisted: true,
  },
  {
    id: "3",
    name: "Mediterranean Quinoa Bowl",
    price: 15.99,
    imageSrc: undefined,
    rating: 4.2,
    isWishlisted: false,
  },
  {
    id: "4",
    name: "Chicken Tikka Masala with Basmati Rice",
    price: 17.99,
    imageSrc: undefined,
    rating: 4.7,
    isWishlisted: false,
  },
  {
    id: "5",
    name: "Vegetarian Lasagna",
    price: 16.50,
    imageSrc: undefined,
    rating: 4.4,
    isWishlisted: true,
  },
  {
    id: "6",
    name: "Thai Green Curry with Jasmine Rice",
    price: 19.99,
    imageSrc: undefined,
    rating: 4.6,
    isWishlisted: false,
  },
];

export function MenuSection() {
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
    <section className="bg-background py-16">
      <div className="container mx-auto px-8 max-w-4xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-xl font-normal text-foreground mb-2 tracking-widest uppercase">
              Featured Products
            </h2>
            <p className="text-xs text-text-secondary tracking-wide">
              {featuredMeals.length} {t("itemsAvailable", { count: featuredMeals.length })}
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
          {featuredMeals.map((meal) => (
            <MenuItemCard
              key={meal.id}
              id={meal.id}
              name={meal.name}
              price={meal.price}
              imageSrc={meal.imageSrc}
              imageAlt={meal.name}
              rating={meal.rating}
              isWishlisted={meal.isWishlisted}
              onWishlistToggle={handleWishlistToggle}
              onOrderClick={handleOrderClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

