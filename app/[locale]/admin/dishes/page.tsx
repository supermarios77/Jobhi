import { requireAdmin } from "@/lib/auth";
import { getDishes } from "@/lib/db/dish";
import { getTranslations } from "next-intl/server";
import { DishesList } from "./dishes-list";
import { Link } from "@/config/i18n/routing";

export default async function AdminDishesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);
  const t = await getTranslations("admin.dishes");
  const dishes = await getDishes({ isActive: undefined }); // Get all dishes

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-normal text-foreground tracking-widest uppercase">{t("title")}</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 sm:mt-2 tracking-wide">{t("subtitle")}</p>
        </div>
        <Link
          href="/admin/dishes/new"
          className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-foreground bg-foreground text-background font-normal text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors shadow-soft inline-block text-center"
        >
          {t("addNew")}
        </Link>
      </div>

      <DishesList initialDishes={dishes} />
    </div>
  );
}

