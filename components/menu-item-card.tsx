"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  id: string;
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
      href={`/menu/${id}`}
      className={cn(
        "group bg-card rounded-lg overflow-hidden transition-all duration-200 hover:opacity-90 cursor-pointer block border border-border",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt || name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
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
            "absolute top-3 right-3 p-2 rounded-full bg-card/90 backdrop-blur-sm transition-colors",
            "hover:bg-card focus:outline-none",
            isWishlistActive && "bg-accent/20"
          )}
          aria-label={isWishlistActive ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              isWishlistActive
                ? "fill-accent text-accent"
                : "text-text-secondary"
            )}
          />
        </button>

        {/* Order 48h Label */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-card/90 backdrop-blur-sm rounded text-xs font-normal text-text-secondary">
            {t("order48h")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-5 space-y-3">
        {/* Dish Name */}
        <h3 className="text-lg lg:text-xl font-medium text-foreground line-clamp-2">
          {name}
        </h3>

        {/* Rating and Price Row */}
        <div className="flex items-center justify-between">
          {/* Rating Stars */}
          <div className="flex items-center gap-1">
            {Array.from({ length: fullStars }).map((_, i) => (
              <svg
                key={`full-${i}`}
                className="w-4 h-4 text-accent fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            {hasHalfStar && (
              <svg
                className="w-4 h-4 text-accent fill-current"
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
                className="w-4 h-4 text-border fill-current"
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
            <span className="text-xl lg:text-2xl font-bold text-foreground">
              €{price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

