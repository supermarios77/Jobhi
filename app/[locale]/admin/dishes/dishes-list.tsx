"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Dish {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  isActive: boolean;
  rating?: number;
}

interface DishesListProps {
  initialDishes: Dish[];
}

export function DishesList({ initialDishes }: DishesListProps) {
  const t = useTranslations("admin.dishes");
  const [dishes, setDishes] = useState(initialDishes);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/dishes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete dish");
      }

      setDishes(dishes.filter((dish) => dish.id !== id));
    } catch (error) {
      console.error("Error deleting dish:", error);
      alert("Failed to delete dish. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/dishes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update dish");
      }

      setDishes(
        dishes.map((dish) =>
          dish.id === id ? { ...dish, isActive: !currentStatus } : dish
        )
      );
    } catch (error) {
      console.error("Error updating dish:", error);
      alert("Failed to update dish. Please try again.");
    }
  };

  if (dishes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-4">{t("noDishes")}</p>
        <Link
          href="/admin/dishes/new"
          className="px-6 py-3 rounded-lg bg-accent text-foreground font-medium hover:bg-accent/90 transition-colors inline-block"
        >
          {t("addFirst")}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-soft border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                {t("image")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                {t("name")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                {t("price")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                {t("status")}
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dishes.map((dish) => (
              <tr key={dish.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary">
                    {dish.imageUrl ? (
                      <Image
                        src={dish.imageUrl}
                        alt={dish.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-accent/20" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{dish.name}</div>
                  {dish.rating && (
                    <div className="text-sm text-text-secondary">
                      ⭐ {dish.rating.toFixed(1)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-foreground font-medium">
                  €{dish.price.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(dish.id, dish.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      dish.isActive
                        ? "bg-accent/20 text-foreground"
                        : "bg-secondary text-text-secondary"
                    }`}
                  >
                    {dish.isActive ? t("active") : t("inactive")}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/dishes/${dish.id}/edit`}
                      className="p-2 text-text-secondary hover:text-foreground transition-colors"
                      aria-label="Edit dish"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      disabled={deletingId === dish.id}
                      className="p-2 text-text-secondary hover:text-red-600 transition-colors disabled:opacity-50"
                      aria-label="Delete dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

