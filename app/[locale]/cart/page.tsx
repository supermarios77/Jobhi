"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";

interface CartItem {
  id: string;
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  imageSrc?: string;
  size?: string;
}

export default function CartPage() {
  const t = useTranslations("cart");
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        cache: "no-store", // Prevent caching
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const response = await fetch(`/api/cart?itemId=${id}`, {
        method: "DELETE",
        cache: "no-store", // Prevent caching
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || []);
        // Force a refresh to ensure state is synced
        await fetchCart();
      } else {
        const errorData = await response.json();
        console.error("Error removing item:", errorData);
        // Still refresh cart to get current state
        await fetchCart();
      }
    } catch (error) {
      console.error("Error removing item:", error);
      // Refresh cart even on error to get current state
      await fetchCart();
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: id, quantity: newQuantity }),
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || []);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.21; // 21% VAT for Belgium
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;

  const isCartEmpty = cartItems.length === 0;

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-secondary">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-10 lg:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-normal text-foreground mb-2 tracking-widest uppercase">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary tracking-wide">
            {cartItems.length === 0
              ? t("emptyCart")
              : t("itemCount", { count: cartItems.length })}
          </p>
        </div>

        {isCartEmpty ? (
          /* Empty Cart State */
          <div className="bg-card rounded-xl shadow-soft border-2 border-border p-8 sm:p-12 lg:p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-normal text-foreground mb-4 tracking-widest uppercase">
                {t("emptyTitle")}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary mb-8 tracking-wide">
                {t("emptyDescription")}
              </p>
              <Link href="/#menu">
                <Button variant="accent" size="lg" className="text-xs sm:text-sm px-6 sm:px-8 py-3 tracking-widest uppercase rounded-none">
                  {t("browseMenu")}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-xl shadow-soft border-2 border-border p-4 sm:p-6 lg:p-8"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Item Image */}
                    <div className="relative w-full sm:w-28 lg:w-32 h-28 lg:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-secondary border border-border">
                      {item.imageSrc ? (
                        <Image
                          src={item.imageSrc}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 128px"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-text-secondary text-xs sm:text-sm">
                          {t("noImage")}
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground mb-1 sm:mb-2 tracking-wide">
                          {item.name}
                        </h3>
                        {item.size && (
                          <p className="text-xs sm:text-sm text-text-secondary mb-2">{item.size}</p>
                        )}
                        <p className="text-base sm:text-lg font-normal text-foreground">
                          €{item.price.toFixed(2)} {t("each")}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                        <div className="flex items-center border-2 border-border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity === 1}
                            className="rounded-r-none h-9 w-9 sm:h-10 sm:w-10"
                          >
                            <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <span className="px-3 sm:px-4 text-base sm:text-lg font-medium text-foreground min-w-[3ch] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="rounded-l-none h-9 w-9 sm:h-10 sm:w-10"
                          >
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-9 w-9 sm:h-10 sm:w-10 text-destructive hover:bg-destructive/10"
                          aria-label={t("removeItem", { name: item.name })}
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-card rounded-xl shadow-soft border-2 border-border p-5 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-normal text-foreground mb-5 sm:mb-6 tracking-widest uppercase">
                  {t("orderSummary")}
                </h2>

                {/* Pricing Breakdown */}
                <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6 border-b border-border pb-5 sm:pb-6">
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="text-text-secondary">{t("subtotal")}</span>
                    <span className="text-foreground font-medium">
                      €{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="text-text-secondary">{t("taxes")}</span>
                    <span className="text-foreground font-medium">
                      €{taxes.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center text-xl sm:text-2xl font-normal text-foreground mb-6 sm:mb-8">
                  <span>{t("total")}</span>
                  <span>€{total.toFixed(2)}</span>
                </div>

                {/* Proceed to Checkout Button */}
                <Link href="/checkout" className="block">
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full text-xs sm:text-sm px-6 sm:px-8 py-3 tracking-widest uppercase rounded-none flex items-center justify-center gap-2"
                  >
                    {t("proceedToCheckout")}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>

                {/* Continue Shopping Link */}
                <Link
                  href="/#menu"
                  className="block text-center text-xs sm:text-sm text-text-secondary hover:text-foreground transition-colors mt-4 tracking-wide"
                >
                  {t("continueShopping")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

