"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { VariantSelector } from "@/components/features/menu/variant-selector";
import { Skeleton } from "@/components/shared/skeleton";

interface Variant {
  id: string;
  name: string;
  nameEn: string;
  nameNl: string;
  nameFr: string;
  imageUrl?: string | null;
  price?: number | null;
  isActive: boolean;
}

interface Dish {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  pricingModel?: "FIXED" | "PER_PIECE";
  imageUrl?: string | null;
  quantity?: string | null;
  weight?: string | null;
  allergens: string[];
  ingredients: string[];
  rating: number;
  variants?: Variant[];
}

interface MenuItemDetailClientProps {
  dish: Dish;
}

export function MenuItemDetailClient({ dish }: MenuItemDetailClientProps) {
  const t = useTranslations("dishDetail");
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    dish.variants && dish.variants.length > 0 ? null : null
  );

  // Determine current price (variant price or dish price)
  const currentPrice = selectedVariant?.price ?? dish.price;
  const currentImageUrl = selectedVariant?.imageUrl || dish.imageUrl;
  const totalPrice = currentPrice * quantity;

  // Reset loading state when image URL changes
  useEffect(() => {
    if (currentImageUrl) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [currentImageUrl]);

  // Require variant selection if variants exist
  const canAddToCart = !dish.variants || dish.variants.length === 0 || selectedVariant !== null;

  const handleAddToCart = async () => {
    if (!canAddToCart) {
      addToast("Please select a flavor", "error");
      return;
    }

    setIsLoading(true);
    
    // Optimistic update: immediately trigger cart badge update
    // The actual API call will sync the real state
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    
    // Build display name with variant if selected
    const displayName = selectedVariant 
      ? `${dish.name} (${selectedVariant.name})`
      : dish.name;
    
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dishId: dish.id,
          name: displayName,
          price: currentPrice,
          quantity,
          imageSrc: currentImageUrl,
          variantId: selectedVariant?.id,
          variantName: selectedVariant?.name,
        }),
      });

      if (response.ok) {
        // Show success toast
        addToast(t("addedToCart") || "Added to cart!", "success");
        // Reset quantity
        setQuantity(1);
        // Trigger cart badge update again to ensure sync
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        const error = await response.json();
        addToast(error.error || t("failedToAdd") || "Failed to add to cart", "error");
        // Re-trigger update to revert optimistic change
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      }
    } catch {
      addToast(t("failedToAdd") || "Failed to add to cart. Please try again.", "error");
      // Re-trigger update to revert optimistic change
      window.dispatchEvent(new CustomEvent("cartUpdated"));
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Image */}
          <div className="relative w-full flex justify-center lg:justify-start">
            <div className="relative w-full max-w-lg">
              {currentImageUrl && !imageError ? (
                <div className="relative w-full aspect-square">
                  {imageLoading && (
                    <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
                  )}
              <Image
                    src={currentImageUrl}
                alt={dish.name}
                width={600}
                height={600}
                    className={`w-full h-auto object-contain transition-opacity duration-300 ${
                      imageLoading ? "opacity-0" : "opacity-100"
                    }`}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                    unoptimized={currentImageUrl?.includes("supabase.co")}
                  />
                </div>
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-secondary/20">
                  <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                </div>
              )}
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
            <div className="text-3xl lg:text-4xl font-normal text-foreground tracking-widest">
              €{currentPrice.toFixed(2)}
              {dish.pricingModel === "PER_PIECE" && (
                <span className="text-lg lg:text-xl font-normal text-text-secondary ml-2">
                  per piece
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {dish.variants && dish.variants.length > 0 && (
              <VariantSelector
                variants={dish.variants}
                selectedVariantId={selectedVariant?.id}
                onSelect={(variant) => setSelectedVariant(variant)}
                basePrice={dish.price}
              />
            )}

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
                disabled={isLoading || !canAddToCart}
                variant="default"
                size="lg"
                className="w-full text-xs tracking-widest uppercase border-2 border-foreground bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
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

