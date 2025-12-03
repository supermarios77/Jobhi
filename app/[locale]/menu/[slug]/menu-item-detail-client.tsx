"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface Dish {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  quantity?: string | null;
  weight?: string | null;
  allergens: string[];
  ingredients: string[];
  rating: number;
}

interface MenuItemDetailClientProps {
  dish: Dish;
}

export function MenuItemDetailClient({ dish }: MenuItemDetailClientProps) {
  const t = useTranslations("dishDetail");
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = dish.price * quantity;

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dishId: dish.id,
          name: dish.name,
          price: dish.price,
          quantity,
          imageSrc: dish.imageUrl,
        }),
      });

      if (response.ok) {
        // Show success toast
        addToast(t("addedToCart") || "Added to cart!", "success");
        // Reset quantity
        setQuantity(1);
        // Trigger cart badge update
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        const error = await response.json();
        addToast(error.error || t("failedToAdd") || "Failed to add to cart", "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      addToast(t("failedToAdd") || "Failed to add to cart. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image */}
          <div className="relative w-full aspect-square">
            <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-foreground shadow-2xl shadow-amber-200/30 dark:shadow-amber-900/20">
              <Image
                src={dish.imageUrl || "/placeholder-dish.jpg"}
                alt={dish.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Warm appetizing overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-orange-400/10" />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Dish Name */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground tracking-widest uppercase">
              {dish.name}
            </h1>

            {/* Rating */}
            {dish.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(dish.rating)
                          ? "text-amber-500 dark:text-amber-400 fill-current"
                          : "text-text-secondary/30 fill-current"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-text-secondary tracking-wide">({dish.rating.toFixed(1)})</span>
              </div>
            )}

            {/* Price */}
            <div className="text-4xl lg:text-5xl font-bold text-amber-600 dark:text-amber-400 tracking-widest">
              €{dish.price.toFixed(2)}
            </div>

            {/* Quantity and Weight */}
            {(dish.quantity || dish.weight) && (
              <div className="flex flex-wrap gap-4 text-sm text-text-secondary tracking-wide">
                {dish.quantity && (
                  <div className="flex items-center gap-2">
                    <span className="uppercase">{t("quantity")}:</span>
                    <span>{dish.quantity}</span>
                  </div>
                )}
                {dish.weight && (
                  <div className="flex items-center gap-2">
                    <span className="uppercase">{t("weight")}:</span>
                    <span>{dish.weight}</span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {dish.description && (
              <div className="space-y-2">
                <h2 className="text-sm font-normal text-foreground tracking-widest uppercase">{t("description")}</h2>
                <p className="text-base text-text-secondary leading-relaxed tracking-wide">{dish.description}</p>
              </div>
            )}

            {/* Allergens */}
            {dish.allergens && dish.allergens.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-normal text-foreground tracking-widest uppercase">{t("allergens")}</h2>
                <div className="flex flex-wrap gap-2">
                  {dish.allergens.map((allergen, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-secondary text-xs text-text-secondary border border-border uppercase tracking-wide"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {dish.ingredients && dish.ingredients.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-normal text-foreground tracking-widest uppercase">{t("ingredients")}</h2>
                <ul className="list-disc list-inside space-y-1 text-text-secondary tracking-wide">
                  {dish.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector and Add to Cart */}
            <div className="pt-6 border-t-2 border-border">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-text-secondary tracking-wide uppercase">Quantity:</span>
                <div className="flex items-center gap-3 border-2 border-foreground px-4 py-3 bg-background">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="p-3 sm:p-4 text-foreground hover:text-text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <span className="text-xl sm:text-2xl font-normal text-foreground w-12 sm:w-16 text-center tracking-wide">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="p-3 sm:p-4 text-foreground hover:text-text-secondary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-text-secondary tracking-wide uppercase">Total:</span>
                <span className="text-2xl lg:text-3xl font-normal text-foreground tracking-widest">
                  €{totalPrice.toFixed(2)}
                </span>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                variant="default"
                size="lg"
                className="w-full text-sm sm:text-base tracking-widest uppercase border-2 border-amber-600 dark:border-amber-400 bg-amber-600 dark:bg-amber-500 text-white hover:bg-amber-700 dark:hover:bg-amber-600 shadow-lg shadow-amber-200/30 dark:shadow-amber-900/30 hover:shadow-xl hover:shadow-amber-300/40 dark:hover:shadow-amber-800/40 transition-all duration-300 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {t("adding")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    {t("addToCart")}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

