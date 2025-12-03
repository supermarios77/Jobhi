"use client";

import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageSrc?: string;
  imageAlt?: string;
  rating?: number;
  isWishlisted?: boolean;
  onWishlistToggle?: (id: string) => void;
  onOrderClick?: (id: string) => void;
  className?: string;
}

export function MenuItemCard({
  id,
  slug,
  name,
  price,
  imageSrc,
  imageAlt,
  rating = 0,
  isWishlisted = false,
  onWishlistToggle,
  onOrderClick,
  className,
}: MenuItemCardProps) {
  const t = useTranslations("menu");
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlistActive, setIsWishlistActive] = useState(isWishlisted);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isWishlistActive;
    setIsWishlistActive(newState);
    onWishlistToggle?.(id);
  };

  // Calculate star display (0-5 stars)
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <Link
      href={`/menu/${slug}`}
      className={cn(
        "group bg-card overflow-hidden transition-all duration-300 cursor-pointer block border-2 border-border hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-xl hover:shadow-amber-200/20 dark:hover:shadow-amber-900/30 hover:-translate-y-1",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`View details for ${name}`}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt={imageAlt || name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            {/* Warm gradient overlay for appetizing effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Subtle warm glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 via-transparent to-orange-400/0 group-hover:from-amber-400/10 group-hover:to-orange-400/10 transition-all duration-500" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
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

        {/* Wishlist Heart Icon */}
        <button
          onClick={handleWishlistClick}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full bg-card/95 dark:bg-card/90 backdrop-blur-sm transition-all",
            "hover:bg-card dark:hover:bg-card/95 focus:outline-none hover:scale-110",
            isWishlistActive && "bg-accent/20 dark:bg-accent/30"
          )}
          aria-label={isWishlistActive ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-all",
              isWishlistActive
                ? "fill-accent text-accent"
                : "text-text-secondary hover:text-accent"
            )}
          />
        </button>

        {/* Order 48h Label */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-card/95 dark:bg-card/90 backdrop-blur-sm rounded text-xs font-normal text-text-secondary border border-border/50">
            {t("order48h")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 lg:p-6 space-y-3">
        {/* Dish Name */}
        <h3 className="text-base sm:text-lg font-medium text-foreground line-clamp-2 tracking-wide min-h-[2.5rem] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {name}
        </h3>

        {/* Rating and Price Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Rating Stars */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {Array.from({ length: fullStars }).map((_, i) => (
              <svg
                key={`full-${i}`}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            {hasHalfStar && (
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent fill-current"
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
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-400">
              €{price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* View Details Link */}
        <div className="flex items-center gap-2 pt-2 text-xs sm:text-sm text-text-secondary group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          <span className="tracking-wide uppercase font-medium">{t("viewDetails")}</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

