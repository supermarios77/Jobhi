"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useState } from "react";
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
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlistActive, setIsWishlistActive] = useState(isWishlisted);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isWishlistActive;
    setIsWishlistActive(newState);
    onWishlistToggle?.(id);
  };

  const handleCardClick = () => {
    onOrderClick?.(id);
  };

  // Calculate star display (0-5 stars)
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div
      className={cn(
        "group bg-white rounded-xl lg:rounded-2xl shadow-soft overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt || name}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              isHovered && "scale-105"
            )}
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
            "absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200",
            "hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
            isWishlistActive && "bg-accent/20"
          )}
          aria-label={isWishlistActive ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors duration-200",
              isWishlistActive
                ? "fill-accent text-accent"
                : "text-text-secondary group-hover:text-accent"
            )}
          />
        </button>

        {/* Order 48h Label */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-text-secondary">
            Order 48h in advance
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-5 space-y-3">
        {/* Dish Name */}
        <h3 className="text-lg lg:text-xl font-semibold text-foreground line-clamp-2">
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
    </div>
  );
}

