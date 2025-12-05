"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useState, useEffect, lazy, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/config/i18n/routing";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/shared/skeleton";

// Lazy load variant popup (only loads when needed)
const VariantPopup = lazy(() => import("./variant-popup").then(mod => ({ default: mod.VariantPopup })));

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

interface MenuItemCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  pricingModel?: "FIXED" | "PER_PIECE";
  imageSrc?: string;
  imageAlt?: string;
  rating?: number;
  variants?: Variant[];
  category?: {
    name: string;
    slug: string;
  } | null;
  className?: string;
}

export function MenuItemCard({
  id,
  slug,
  name,
  price,
  pricingModel = "FIXED",
  imageSrc,
  imageAlt,
  rating = 0,
  variants = [],
  category,
  className,
}: MenuItemCardProps) {
  const t = useTranslations("menu");
  const { addToast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showVariantPopup, setShowVariantPopup] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Reset loading state when image source changes
  useEffect(() => {
    if (imageSrc) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [imageSrc]);
  
  // Ensure pricingModel is a string for comparison
  const pricingModelStr = String(pricingModel || "FIXED").toUpperCase();

  const handleAddToCart = async (e: React.MouseEvent, variant?: Variant) => {
    e.stopPropagation();
    e.preventDefault();
    
    // If dish has variants and no variant selected, show popup
    if (variants.length > 0 && !variant) {
      setShowVariantPopup(true);
      return;
    }
    
    setIsAddingToCart(true);
    
    // Use variant price if available, otherwise use dish price
    const finalPrice = variant?.price ?? price;
    const finalImageSrc = variant?.imageUrl || imageSrc;
    const displayName = variant ? `${name} (${variant.name})` : name;
    
    // Optimistic update: immediately trigger cart badge update
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dishId: id,
          name: displayName,
          price: finalPrice,
          quantity: 1,
          imageSrc: finalImageSrc,
          variantId: variant?.id,
          variantName: variant?.name,
        }),
      });

      if (response.ok) {
        addToast(t("addedToCart") || "Added to cart!", "success");
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        const error = await response.json();
        addToast(error.error || t("failedToAdd") || "Failed to add to cart", "error");
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      }
    } catch (error) {
      addToast(t("failedToAdd") || "Failed to add to cart. Please try again.", "error");
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleVariantSelect = (variant: Variant) => {
    // Create a synthetic event for handleAddToCart
    const syntheticEvent = {
      stopPropagation: () => {},
      preventDefault: () => {},
    } as React.MouseEvent;
    handleAddToCart(syntheticEvent, variant);
  };

  // Calculate star display (0-5 stars)
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <>
      <Link
        href={`/menu/${slug}`}
        className={cn(
          "group bg-card overflow-hidden transition-all duration-300 cursor-pointer block border-2 border-border hover:border-foreground hover:shadow-lg hover:-translate-y-1",
          className
        )}
        aria-label={`View details and add ${name} to cart`}
      >
      {/* Image Container */}
      <div className="relative w-full flex items-center justify-center pt-6 sm:pt-8 px-6 sm:px-8">
        {imageSrc && !imageError ? (
          <div className="relative w-full max-w-xs mx-auto aspect-square">
            {imageLoading && (
              <Skeleton className="absolute inset-0 w-full h-full rounded-full" />
            )}
            <Image
              src={imageSrc}
              alt={imageAlt || name}
              width={400}
              height={400}
              className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 400px"
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              unoptimized={imageSrc?.includes("supabase.co")}
            />
          </div>
        ) : (
          <div className="w-full max-w-xs mx-auto aspect-square flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-text-secondary"
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

        {/* Quick Add to Cart Button - Enhanced */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={cn(
            "absolute top-3 right-3 p-2.5 rounded-full bg-foreground text-background shadow-lg",
            "hover:bg-foreground/90 hover:scale-110 transition-all z-10",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            "focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
          )}
          aria-label={t("addToCart") || "Add to cart"}
        >
          {isAddingToCart ? (
            <span className="animate-spin text-xs">⏳</span>
          ) : (
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          )}
        </button>

        {/* Category Badge - Subtle */}
        {category && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-background/95 backdrop-blur-sm text-xs font-normal text-text-secondary tracking-widest uppercase border border-border/50">
              {category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Dish Name */}
        <h3 className="text-lg font-normal text-foreground line-clamp-2 tracking-wide group-hover:text-accent transition-colors min-h-[3rem]">
          {name}
        </h3>

        {/* Variant Indicator */}
        {variants.length > 1 && (
          <p className="text-xs text-text-secondary tracking-wide italic">
            {t("multipleVariants", { count: variants.length })}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-border"></div>

        {/* Price and Rating */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground">
              €{price.toFixed(2)}
            </span>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: fullStars }).map((_, i) => (
                <svg
                  key={`full-${i}`}
                  className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
              {hasHalfStar && (
                <svg
                  className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <defs>
                    <linearGradient id={`half-${id}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#half-${id})`}
                    d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
                  />
                </svg>
              )}
              <span className="text-xs text-text-secondary ml-1 font-medium">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>

    {/* Variant Popup - Lazy loaded */}
    {variants.length > 0 && showVariantPopup && (
      <Suspense fallback={null}>
      <VariantPopup
        isOpen={showVariantPopup}
        onClose={() => setShowVariantPopup(false)}
        dishName={name}
        dishImage={imageSrc}
        variants={variants}
        basePrice={price}
        onSelect={handleVariantSelect}
      />
      </Suspense>
    )}
    </>
  );
}

