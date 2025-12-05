import { getTranslations } from "next-intl/server";
import { Link } from "@/config/i18n/routing";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-2xl w-full text-center space-y-6 sm:space-y-8">
        <div className="flex justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border-2 border-foreground">
            <Package className="w-7 h-7 sm:w-8 sm:h-8 text-foreground" />
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

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Link href="/" className="block">
            <Button
              variant="accent"
              className="w-full sm:w-auto text-xs px-6 sm:px-8 py-3 tracking-widest uppercase rounded-none"
            >
              {t("goHome")}
            </Button>
          </Link>
          <Link href="/#menu" className="block">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-xs px-6 sm:px-8 py-3 tracking-widest uppercase rounded-none"
            >
              {t("browseMenu")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

