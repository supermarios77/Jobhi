import { requireAdmin } from "@/lib/auth";
import { getDishById, getCategories } from "@/lib/db/dish";
import { notFound } from "next/navigation";
import { DishForm } from "../../dish-form";

export default async function EditDishPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  await requireAdmin(locale);
  const dish = await getDishById(id, "en");
  const categories = await getCategories("en");

  if (!dish) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Edit Dish</h2>
        <p className="text-text-secondary mt-1">Update dish information</p>
      </div>

      <DishForm dish={dish} categories={categories} />
    </div>
  );
}

