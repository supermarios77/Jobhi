"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/config/i18n/routing";

export function CartBadge() {
  const [itemCount, setItemCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Fetch cart count
    const fetchCartCount = async () => {
      try {
        const response = await fetch("/api/cart", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          const count = (data.cart || []).reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
          );
          setItemCount(count);
        }
      } catch (error) {
        // Error logged by API route
      }
    };

    fetchCartCount();

    // Listen for cart update events
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    // Refresh cart count when pathname changes (user navigates)
    const interval = setInterval(fetchCartCount, 5000); // Poll every 5 seconds as fallback

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      clearInterval(interval);
    };
  }, [pathname]);

  if (itemCount === 0) return null;

  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent dark:bg-accent rounded-full text-[10px] flex items-center justify-center text-background dark:text-background font-semibold px-1 leading-none border border-background dark:border-background">
      {itemCount > 9 ? "9+" : itemCount}
    </span>
  );
}

