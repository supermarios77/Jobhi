"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId?: string;
  onSelect: (variant: Variant) => void;
  basePrice: number;
  className?: string;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
  basePrice,
  className,
}: VariantSelectorProps) {
  if (variants.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Select Flavor</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {variants.map((variant) => {
            const isSelected = selectedVariantId === variant.id;
            const variantPrice = variant.price ?? basePrice;

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => onSelect(variant)}
                className={cn(
                  "relative border-2 rounded-lg p-3 transition-all hover:scale-105",
                  "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                  isSelected
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:border-accent/50"
                )}
              >
                {variant.imageUrl && (
                  <div className="relative w-full aspect-square mb-2 rounded-md overflow-hidden">
                    <Image
                      src={variant.imageUrl}
                      alt={variant.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                )}
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground">{variant.name}</div>
                  {variant.price && variant.price !== basePrice && (
                    <div className="text-xs text-text-secondary mt-1">
                      €{variantPrice.toFixed(2)}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-foreground rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-background rounded-full" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

