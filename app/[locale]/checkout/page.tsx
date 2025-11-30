"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { CheckoutSummary } from "@/components/checkout-summary";

interface CartItem {
  id: string;
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  imageSrc?: string;
  size?: string;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Belgium",
    deliveryInstructions: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || []);
        if (data.cart.length === 0) {
          // Redirect to cart if empty
          router.push("/cart");
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const response = await fetch(`/api/cart?itemId=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || []);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: id, quantity }),
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || []);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleProceedToPayment = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
      alert(t("fillRequiredFields"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Get locale from URL or default to 'en'
      const locale = window.location.pathname.split('/')[1] || 'en';

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              dishId: item.dishId,
              quantity: item.quantity,
              price: item.price,
              size: item.size,
            })),
            userId: "temp-user-id", // TODO: Get from auth/session
            deliveryInfo: formData,
            locale,
          }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout or success page (mock mode)
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Failed to proceed to payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 lg:py-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-text-secondary mb-8">Your cart is empty.</p>
          <Link href="/menu">
            <Button variant="accent" size="lg" className="rounded-lg shadow-soft">
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 lg:py-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-8 lg:mb-12">
          {t("title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
          {/* Left: Customer Details Form */}
          <div className="space-y-6 lg:space-y-8">
            <div>
              <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-6">
                {t("deliveryInformation")}
              </h2>

              <form className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {t("firstName")}
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {t("lastName")}
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    placeholder="john.doe@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    placeholder="+32 123 456 789"
                  />
                </div>

                {/* Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    {t("address")}
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    placeholder="Rue de la Paix 123"
                  />
                </div>

                {/* City and Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {t("city")}
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="Brussels"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {t("postalCode")}
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="1000"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    {t("country")}
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  />
                </div>

                {/* Delivery Instructions */}
                <div>
                  <label
                    htmlFor="deliveryInstructions"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    {t("deliveryInstructions")}
                  </label>
                  <textarea
                    id="deliveryInstructions"
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
                    placeholder="Any special delivery instructions..."
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Right: Checkout Summary */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <CheckoutSummary
              items={mockCartItems}
              discount={0}
              taxRate={0.21}
              onRemoveItem={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
              onProceedToPayment={handleProceedToPayment}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

