import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function Navigation() {
  const t = await getTranslations("common");

  return (
    <nav className="border-b border-border bg-white">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-foreground">
            FreshBite
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-foreground hover:text-accent transition-colors"
            >
              {t("order")}
            </Link>
            <Link
              href="/cart"
              className="text-foreground hover:text-accent transition-colors"
            >
              {t("cart")}
            </Link>
            <Link
              href="/admin"
              className="text-foreground hover:text-accent transition-colors"
            >
              {t("admin")}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

