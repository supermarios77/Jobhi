"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/config/i18n/routing";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      console.error("Application error:", error);
      // TODO: Send to error reporting service (e.g., Sentry, LogRocket)
    }
  }, [error]);

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-2xl w-full text-center space-y-6 sm:space-y-8">
        <div className="flex justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border-2 border-destructive">
            <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-foreground tracking-widest uppercase">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed tracking-wide max-w-xl mx-auto px-4">
            {t("description")}
          </p>
        </div>

        {process.env.NODE_ENV === "development" && error.message && (
          <div className="bg-destructive/10 border-2 border-destructive p-4 text-left mx-4">
            <p className="text-xs font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-text-secondary mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Button
            onClick={reset}
            variant="accent"
            className="w-full sm:w-auto text-xs px-6 sm:px-8 py-3 tracking-widest uppercase rounded-none"
          >
            {t("tryAgain")}
          </Button>
          <Link href="/" className="block">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-xs px-6 sm:px-8 py-3 tracking-widest uppercase rounded-none"
            >
              {t("goHome")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

