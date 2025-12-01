import { requireAuth } from "@/lib/auth";
import { DishForm } from "../dish-form";
import { getCategories } from "@/lib/db/dish";
import { getTranslations } from "next-intl/server";

export default async function NewDishPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAuth(locale);
  const t = await getTranslations("admin.dishForm");
  const categories = await getCategories("en");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t("addTitle")}</h2>
        <p className="text-text-secondary mt-1">{t("subtitle")}</p>
      </div>

      <DishForm categories={categories} />
    </div>
  );
}

