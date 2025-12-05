"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "@/config/i18n/routing";
import { LogOut } from "lucide-react";

export function OrderLogoutButton() {
  const t = useTranslations("order");
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Get locale from pathname
      const locale = pathname.split("/")[1] || "en";
      
      // Redirect to order page (which will show sign-in)
      router.push(`/${locale}/order`);
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isLoading}
      className="text-xs tracking-widest uppercase flex items-center gap-2"
    >
      <LogOut className="w-3 h-3" />
      {isLoading ? t("signingOut") : t("signOut")}
    </Button>
  );
}

