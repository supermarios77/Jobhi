"use client";

import Image from "next/image";
import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { VariantPopup } from "./variant-popup";

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
          "group bg-card overflow-hidden transition-all duration-300 cursor-pointer block border border-border hover:border-accent/50 dark:hover:border-accent/30 hover:shadow-lg hover:-translate-y-1",
          className
        )}
        aria-label={`View details and add ${name} to cart`}
      >
      {/* Image Container */}
      <div className="relative w-full flex items-center justify-center p-4 sm:p-6">
        {imageSrc ? (
          <div className="relative w-full max-w-xs mx-auto">
            <Image
              src={imageSrc}
              alt={imageAlt || name}
              width={400}
              height={400}
              className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 400px"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full max-w-xs mx-auto flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-accent/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-accent"
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
          </div>
        )}

        {/* Quick Add to Cart Button (Plus Icon) */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={cn(
            "absolute top-4 right-4 p-2.5 rounded-full bg-foreground text-background",
            "hover:bg-foreground/90 transition-all z-10 shadow-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2",
            "hover:scale-110 active:scale-95"
          )}
          aria-label={t("addToCart") || "Add to cart"}
        >
          {isAddingToCart ? (
            <span className="animate-spin text-sm">⏳</span>
          ) : (
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          )}
        </button>

        {/* Order 48h Label */}
        <div className="absolute bottom-4 left-4">
          <span className="px-2 py-1 bg-card/95 dark:bg-card/90 backdrop-blur-sm rounded text-xs font-normal text-text-secondary border border-border/50">
            {t("order48h")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 lg:p-6 space-y-3">
        {/* Category Badge */}
        {category && (
          <div className="mb-1">
            <span className="inline-block px-2 py-1 text-xs font-normal text-text-secondary tracking-widest uppercase border border-border/50 rounded">
              {category.name}
            </span>
          </div>
        )}
        
        {/* Dish Name */}
        <h3 className="text-sm sm:text-base font-normal text-foreground line-clamp-2 tracking-wide min-h-[2.5rem] group-hover:text-accent transition-colors">
          {name}
        </h3>

        {/* Rating and Price Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Rating Stars */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {Array.from({ length: fullStars }).map((_, i) => (
              <svg
                key={`full-${i}`}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            {hasHalfStar && (
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-400 fill-current"
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
            {Array.from({ length: emptyStars }).map((_, i) => (
              <svg
                key={`empty-${i}`}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-border fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            {rating > 0 && (
              <span className="ml-1 text-xs text-text-secondary">
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="text-right">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
              €{price.toFixed(2)}
            </span>
            <div className="text-xs sm:text-sm font-normal text-text-secondary mt-0.5">
              {pricingModelStr === "PER_PIECE" ? t("perPiece") : t("perPortion")}
            </div>
          </div>
        </div>

        {/* View Details CTA */}
        <div className="pt-2">
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-foreground bg-transparent hover:bg-foreground hover:text-background transition-all duration-200 group-hover:border-accent">
            <span className="text-xs sm:text-sm tracking-widest uppercase font-normal">
              {t("clickToViewDetails") || "Click to view details"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>

    {/* Variant Popup */}
    {variants.length > 0 && (
      <VariantPopup
        isOpen={showVariantPopup}
        onClose={() => setShowVariantPopup(false)}
        dishName={name}
        dishImage={imageSrc}
        variants={variants}
        basePrice={price}
        onSelect={handleVariantSelect}
      />
    )}
    </>
  );
}

