"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] as "en" | "nl" | "fr";

  const switchLocale = (locale: "en" | "nl" | "fr") => {
    router.replace(pathname, { locale });
  };

  return (
    <div className="flex items-center gap-2">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale as "en" | "nl" | "fr")}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            currentLocale === locale
              ? "bg-accent text-foreground"
              : "text-text-secondary hover:text-foreground"
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

