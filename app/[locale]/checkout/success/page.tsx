"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/config/i18n/routing";

export default function CheckoutSuccessPage() {
  const t = useTranslations("checkoutSuccess");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");
  const isMock = searchParams.get("mock") === "true";
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If mock mode, mark order as paid
    if (isMock && orderId) {
      fetch("/api/stripe/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          type: "checkout.session.completed",
        }),
      })
        .then(() => {
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error updating order:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [isMock, orderId]);

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-text-secondary">{t("processing")}</p>
      </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-16 lg:py-24">
        <div className="bg-card rounded-xl lg:rounded-2xl shadow-soft border border-border p-8 lg:p-12 text-center space-y-6 transition-all">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-accent/20 dark:bg-accent/30 flex items-center justify-center transition-colors">
              <CheckCircle className="w-12 h-12 text-accent" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {t("title")}
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t("thankYou")} {isMock && t("mockMode")}
            {orderId && ` ${t("orderId", { orderId })}`}
          </p>

          <p className="text-base text-text-secondary">
            {t("confirmationEmail")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/menu">
              <Button variant="outline" size="lg" className="px-8">
                {t("continueShopping")}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="accent" size="lg" className="px-8">
                {t("backToHome")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

