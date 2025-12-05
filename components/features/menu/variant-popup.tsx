"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VariantSelector } from "./variant-selector";
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

interface VariantPopupProps {
  isOpen: boolean;
  onClose: () => void;
  dishName: string;
  dishImage?: string;
  variants: Variant[];
  basePrice: number;
  onSelect: (variant: Variant) => void;
}

export function VariantPopup({
  isOpen,
  onClose,
  dishName,
  dishImage,
  variants,
  basePrice,
  onSelect,
}: VariantPopupProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedVariant) {
      onSelect(selectedVariant);
      setSelectedVariant(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border-2 border-border rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-medium text-foreground">{dishName}</h2>
            <p className="text-sm text-text-secondary mt-1">Select a flavor</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {dishImage && (
            <div className="relative w-full max-w-xs mx-auto aspect-square">
              <Image
                src={selectedVariant?.imageUrl || dishImage}
                alt={dishName}
                fill
                className="object-contain rounded-lg"
                sizes="(max-width: 640px) 100vw, 400px"
              />
            </div>
          )}

          <VariantSelector
            variants={variants}
            selectedVariantId={selectedVariant?.id}
            onSelect={setSelectedVariant}
            basePrice={basePrice}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedVariant}
            className="disabled:opacity-50"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

