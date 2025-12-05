"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/config/i18n/routing";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Package, Calendar, MapPin, Mail, Phone, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { OrderLogoutButton } from "./order-logout-button";

interface OrderItem {
  id: string;
  dishId: string;
  quantity: number;
  price: number;
  size?: string | null;
  dish: {
    id: string;
    name: string;
    nameEn: string;
    nameNl: string;
    nameFr: string;
    imageUrl?: string | null;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  items: OrderItem[];
}

interface OrderListProps {
  orders: Order[];
  locale: string;
  email?: string;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-secondary text-foreground";
    case "PAID":
      return "bg-accent/20 text-foreground";
    case "PREPARING":
      return "bg-accent/30 text-foreground";
    case "SHIPPED":
      return "bg-accent/40 text-foreground";
    case "DELIVERED":
      return "bg-accent/50 text-foreground";
    case "CANCELLED":
      return "bg-destructive/20 text-destructive";
    default:
      return "bg-secondary text-foreground";
  }
}

function getStatusLabel(status: string, t: any): string {
  switch (status) {
    case "PENDING":
      return t("statusPending");
    case "PAID":
      return t("statusPaid");
    case "PREPARING":
      return t("statusPreparing");
    case "SHIPPED":
      return t("statusShipped");
    case "DELIVERED":
      return t("statusDelivered");
    case "CANCELLED":
      return t("statusCancelled");
    default:
      return status;
  }
}

export function OrderList({ orders, locale, email }: OrderListProps) {
  const t = useTranslations("order");
  const { addToast } = useToast();
  const router = useRouter();
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);

  const getDishName = (dish: OrderItem["dish"]) => {
    if (locale === "nl") return dish.nameNl;
    if (locale === "fr") return dish.nameFr;
    return dish.nameEn;
  };

  const handleOrderAgain = async (order: Order) => {
    setReorderingOrderId(order.id);
    
    try {
      // Add all items from the order to the cart
      for (const item of order.items) {
        const dishName = getDishName(item.dish);
        
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dishId: item.dishId,
            name: dishName,
            price: item.price,
            quantity: item.quantity,
            imageSrc: item.dish.imageUrl || undefined,
            size: item.size || undefined,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to add item to cart");
        }
      }

      // Redirect to cart page
      router.push("/cart");
    } catch (error: any) {
      console.error("Error reordering:", error);
      addToast(error.message || t("reorderError"), "error");
      setReorderingOrderId(null);
    }
  };

  if (!email) {
    return (
      <div className="bg-background min-h-screen py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-foreground tracking-widest uppercase">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base text-text-secondary tracking-wide max-w-xl mx-auto px-4">
              {t("enterEmail")}
            </p>
            <form
              action=""
              method="get"
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto px-4"
            >
              <input
                type="email"
                name="email"
                placeholder={t("emailPlaceholder")}
                required
                className="flex-1 px-4 py-3 border-2 border-border bg-background text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-foreground focus:border-foreground transition-all text-sm tracking-wide"
              />
              <Button
                type="submit"
                variant="accent"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 text-xs tracking-widest uppercase rounded-none"
              >
                {t("viewOrders")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-background min-h-screen py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-foreground tracking-widest uppercase">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base text-text-secondary tracking-wide px-4">
              {t("noOrders")}
            </p>
            <Link href="/#menu" className="block px-4">
              <Button variant="accent" className="w-full sm:w-auto text-xs px-6 sm:px-8 py-3 tracking-widest uppercase rounded-none">
                {t("browseMenu")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-foreground tracking-widest uppercase mb-2">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary tracking-wide">
                {t("orderCount", { count: orders.length })}
              </p>
            </div>
            <OrderLogoutButton />
          </div>

          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border-2 border-border p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 shadow-soft"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b-2 border-border">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-secondary flex-shrink-0" />
                      <span className="text-xs text-text-secondary tracking-wide uppercase">
                        {t("orderId")}: {order.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-secondary flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-foreground tracking-wide">
                        {new Date(order.createdAt).toLocaleDateString(locale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-start sm:items-end gap-3 sm:gap-2">
                    <span
                      className={`px-2 sm:px-3 py-1 text-xs font-normal tracking-wide uppercase border-2 border-border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status, t)}
                    </span>
                    <span className="text-lg sm:text-xl font-normal text-foreground tracking-wide">
                      €{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-normal text-foreground tracking-widest uppercase">
                    {t("items")}
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 sm:gap-4 pb-2 sm:pb-3 border-b border-border last:border-0"
                      >
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-secondary border border-border rounded">
                          {item.dish.imageUrl ? (
                            <Image
                              src={item.dish.imageUrl}
                              alt={getDishName(item.dish)}
                              fill
                              className="object-cover rounded"
                              sizes="(max-width: 640px) 56px, 64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-normal text-foreground tracking-wide uppercase line-clamp-1">
                            {getDishName(item.dish)}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                            <span className="text-xs text-text-secondary tracking-wide">
                              {t("quantity")}: {item.quantity}
                            </span>
                            {item.size && (
                              <span className="text-xs text-text-secondary tracking-wide">
                                {t("size")}: {item.size}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm font-normal text-foreground tracking-wide flex-shrink-0">
                          €{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="pt-3 sm:pt-4 border-t-2 border-border space-y-2 sm:space-y-3">
                  <h3 className="text-xs sm:text-sm font-normal text-foreground tracking-widest uppercase">
                    {t("customerInformation")}
                  </h3>
                  <div className="space-y-1 text-xs sm:text-sm text-text-secondary tracking-wide">
                    {order.firstName && order.lastName && (
                      <p>
                        {order.firstName} {order.lastName}
                      </p>
                    )}
                    {order.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <p>{order.phone}</p>
                      </div>
                    )}
                    {order.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <p className="break-all">{order.email}</p>
                      </div>
                    )}
                    <div className="pt-2 mt-2 border-t border-border">
                      <p className="text-xs text-text-secondary">
                        {t("pickupAddressSent")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Again Button */}
                <div className="pt-3 sm:pt-4 border-t-2 border-border">
                  <Button
                    variant="accent"
                    onClick={() => handleOrderAgain(order)}
                    disabled={reorderingOrderId === order.id}
                    className="w-full text-xs px-4 sm:px-6 py-2 sm:py-3 tracking-widest uppercase rounded-none flex items-center justify-center gap-2"
                  >
                    {reorderingOrderId === order.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-background"></div>
                        {t("addingToCart")}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3 h-3" />
                        {t("orderAgain")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Back to Menu */}
          <div className="pt-4 sm:pt-6 border-t-2 border-border text-center">
            <Link href="/#menu">
              <Button variant="outline" className="w-full sm:w-auto text-xs px-6 sm:px-8 py-3 tracking-widest uppercase rounded-none">
                {t("browseMenu")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

