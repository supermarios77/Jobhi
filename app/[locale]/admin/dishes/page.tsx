import { requireAuth } from "@/lib/auth";
import { getDishes } from "@/lib/db/dish";
import { getTranslations } from "next-intl/server";
import { DishesList } from "./dishes-list";
import { Link } from "@/i18n/routing";

export default async function AdminDishesPage() {
  await requireAuth();
  const t = await getTranslations("admin.dishes");
  const dishes = await getDishes({ isActive: undefined }); // Get all dishes

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-text-secondary mt-1">{t("subtitle")}</p>
        </div>
        <Link
          href="/admin/dishes/new"
          className="px-6 py-3 rounded-lg bg-accent text-foreground font-medium hover:bg-accent/90 transition-colors shadow-soft"
        >
          {t("addNew")}
        </Link>
      </div>

      <DishesList initialDishes={dishes} />
    </div>
  );
}

