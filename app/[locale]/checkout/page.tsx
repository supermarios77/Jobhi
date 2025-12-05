"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/config/i18n/routing";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { FormField } from "@/components/shared/form-field";
import { CheckoutSummary } from "@/components/features/cart/checkout-summary";

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
  const { addToast } = useToast();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    createAccount: false, // Optional account creation
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return t("firstNameError");
        if (value.trim().length < 2) return "First name must be at least 2 characters";
        return "";
      case "lastName":
        if (!value.trim()) return t("lastNameError");
        if (value.trim().length < 2) return "Last name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return t("emailError");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return t("emailError");
        return "";
      case "phone":
        if (!value.trim()) return t("phoneError");
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (!phoneRegex.test(value) || value.replace(/\D/g, "").length < 8) {
          return t("phoneError");
        }
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData] as string);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = type === "checkbox" ? "" : validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
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
    // Mark all fields as touched
    const allTouched = {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    };
    setTouched(allTouched);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "createAccount") {
        const error = validateField(key, formData[key as keyof typeof formData] as string);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);

    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      addToast(t("fillRequiredFields"), "error");
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: "smooth", block: "center" });
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
            customerInfo: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
            },
            createAccount: formData.createAccount,
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
      addToast(error.message || "Failed to proceed to payment. Please try again.", "error");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-10 lg:py-12">
          <div className="h-10 w-48 bg-secondary animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
            <div className="space-y-6">
              <div className="h-6 w-32 bg-secondary animate-pulse rounded mb-6" />
              <div className="space-y-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-5 w-24 bg-secondary animate-pulse rounded" />
                    <div className="h-12 w-full bg-secondary animate-pulse rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-card rounded-xl border-2 border-border p-5 sm:p-6 lg:p-8 space-y-4">
                <div className="h-6 w-32 bg-secondary animate-pulse rounded" />
                <div className="space-y-3 border-b border-border pb-4">
                  <div className="h-5 w-full bg-secondary animate-pulse rounded" />
                  <div className="h-5 w-full bg-secondary animate-pulse rounded" />
                </div>
                <div className="h-12 w-full bg-secondary animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-background min-h-screen">
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
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-10 lg:py-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-normal text-foreground mb-6 sm:mb-8 lg:mb-12 tracking-widest uppercase">
          {t("title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          {/* Left: Customer Details Form */}
          <div className="space-y-6 lg:space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground mb-5 sm:mb-6 tracking-widest uppercase">
                {t("customerInformation")}
              </h2>

              <form className="space-y-6" noValidate>
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    label={t("firstName")}
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("firstName")}
                    placeholder="John"
                    required
                    error={touched.firstName ? errors.firstName : undefined}
                    helperText={t("firstNameHelper")}
                    isValid={!errors.firstName && formData.firstName.length > 0}
                  />
                  <FormField
                    label={t("lastName")}
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("lastName")}
                    placeholder="Doe"
                    required
                    error={touched.lastName ? errors.lastName : undefined}
                    helperText={t("lastNameHelper")}
                    isValid={!errors.lastName && formData.lastName.length > 0}
                  />
                </div>

                {/* Email */}
                <FormField
                  label={t("email")}
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("email")}
                  placeholder="john.doe@example.com"
                  required
                  error={touched.email ? errors.email : undefined}
                  helperText={t("emailHelper")}
                  isValid={!errors.email && formData.email.length > 0}
                />

                {/* Phone */}
                <FormField
                  label={t("phone")}
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("phone")}
                  placeholder="+32 123 456 789"
                  required
                  error={touched.phone ? errors.phone : undefined}
                  helperText={t("phoneHelper")}
                  isValid={!errors.phone && formData.phone.length > 0}
                />

                {/* Pickup Information Notice */}
                <div className="bg-secondary/50 border-2 border-border p-4 rounded-lg">
                  <p className="text-sm font-medium text-foreground tracking-wide mb-2">
                    {t("pickupNotice")}
                  </p>
                  <p className="text-xs text-text-secondary tracking-wide mb-2">
                    {t("pickupLocationBrussels")}
                  </p>
                  <p className="text-xs text-text-secondary tracking-wide mb-3">
                    {t("pickupAddressInfo")}
                  </p>
                  <Link
                    href="/contact"
                    className="text-xs text-foreground underline hover:text-foreground/80 transition-colors inline-flex items-center gap-1"
                  >
                    {t("contactUs")}
                  </Link>
                </div>

                {/* Create Account Checkbox */}
                <div className="flex items-start gap-4 pt-2">
                  <input
                    type="checkbox"
                    id="createAccount"
                    name="createAccount"
                    checked={formData.createAccount}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 sm:w-6 sm:h-6 text-accent bg-background border-2 border-border rounded focus:ring-accent focus:ring-2 cursor-pointer"
                  />
                  <label
                    htmlFor="createAccount"
                    className="text-base sm:text-lg text-foreground cursor-pointer leading-relaxed"
                  >
                    {t("createAccount")}
                  </label>
                </div>
                {formData.createAccount && (
                  <p className="text-sm sm:text-base text-text-secondary -mt-2 ml-9 sm:ml-10 leading-relaxed">
                    {t("createAccountDescription")}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Right: Checkout Summary */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <CheckoutSummary
              items={cartItems}
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

