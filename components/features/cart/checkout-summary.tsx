"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/shared/skeleton";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageSrc?: string;
  size?: string;
}

interface CheckoutSummaryProps {
  items: CartItem[];
  discount?: number;
  taxRate?: number; // e.g., 0.21 for 21% VAT
  onRemoveItem?: (id: string) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onProceedToPayment?: () => void;
  isLoading?: boolean;
  className?: string;
}

function CartItemImage({ src, alt }: { src: string; alt: string }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (src) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [src]);

  if (imageError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-accent/20" />
      </div>
    );
  }

  return (
    <>
      {imageLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          imageLoading ? "opacity-0" : "opacity-100"
        }`}
        sizes="96px"
        loading="lazy"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        unoptimized={src?.includes("supabase.co")}
      />
    </>
  );
}

export function CheckoutSummary({
  items,
  discount = 0,
  taxRate = 0.21, // 21% VAT for Belgium
  onRemoveItem,
  onUpdateQuantity,
  onProceedToPayment,
  isLoading = false,
  className,
}: CheckoutSummaryProps) {
  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = discount;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxes = subtotalAfterDiscount * taxRate;
  const total = subtotalAfterDiscount + taxes;
  const t = useTranslations("checkoutSummary");

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem?.(id);
    } else {
      onUpdateQuantity?.(id, newQuantity);
    }
  };

  return (
    <div
      className={`bg-card rounded-xl lg:rounded-2xl shadow-soft p-6 lg:p-8 ${className || ""}`}
    >
      {/* Products List */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-4 lg:mb-6">
          {t("orderSummary")}
        </h2>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-text-secondary text-center py-8">
              {t("emptyCart")}
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                {/* Item Image */}
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  {item.imageSrc ? (
                    <CartItemImage src={item.imageSrc} alt={item.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-accent/20" />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                  {item.size && (
                    <p className="text-xs lg:text-sm text-text-secondary mb-2">
                      Size: {item.size}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded border border-border flex items-center justify-center text-text-secondary hover:text-foreground hover:border-accent transition-colors text-sm"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-sm lg:text-base font-medium text-foreground min-w-[2ch] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded border border-border flex items-center justify-center text-text-secondary hover:text-foreground hover:border-accent transition-colors text-sm"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm lg:text-base font-semibold text-foreground">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-text-secondary">
                          €{item.price.toFixed(2)} {t("each")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-text-secondary hover:text-foreground transition-colors flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pricing Breakdown */}
      {items.length > 0 && (
        <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8 pt-4 lg:pt-6 border-t border-border">
          {/* Subtotal */}
          <div className="flex justify-between text-base lg:text-lg">
            <span className="text-text-secondary">{t("subtotal")}</span>
            <span className="text-foreground font-medium">
              €{subtotal.toFixed(2)}
            </span>
          </div>

          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between text-base lg:text-lg">
              <span className="text-text-secondary">{t("discount")}</span>
              <span className="text-foreground font-medium text-accent">
                -€{discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Taxes */}
          <div className="flex justify-between text-base lg:text-lg">
            <span className="text-text-secondary">{t("taxes")}</span>
            <span className="text-foreground font-medium">
              €{taxes.toFixed(2)}
            </span>
          </div>

          {/* Total */}
          <div className="flex justify-between text-xl lg:text-2xl font-bold pt-3 lg:pt-4 border-t border-border">
            <span className="text-foreground">{t("total")}</span>
            <span className="text-foreground">€{total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Proceed to Payment Button */}
      {items.length > 0 && (
        <Button
          onClick={onProceedToPayment}
          disabled={isLoading || items.length === 0}
          variant="accent"
          size="lg"
          className="w-full text-base lg:text-lg px-8 py-6 rounded-lg shadow-soft hover:shadow-md transition-all duration-200"
        >
          {isLoading ? t("processing") : t("proceedToPayment")}
        </Button>
      )}
    </div>
  );
}

