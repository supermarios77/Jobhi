"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Dish {
  id: string;
  name: string;
  nameEn: string;
  nameNl: string;
  nameFr: string;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionNl?: string | null;
  descriptionFr?: string | null;
  price: number;
  imageUrl?: string | null;
  categoryId?: string | null;
  rating?: number | null;
  quantity?: string | null;
  weight?: string | null;
  allergens: string[];
  ingredients: string[];
  isActive: boolean;
}

interface DishFormProps {
  dish?: Dish;
  categories: Category[];
}

export function DishForm({ dish, categories }: DishFormProps) {
  const t = useTranslations("admin.dishForm");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    dish?.imageUrl || null
  );

  const [formData, setFormData] = useState({
    nameEn: dish?.nameEn || "",
    nameNl: dish?.nameNl || "",
    nameFr: dish?.nameFr || "",
    descriptionEn: dish?.descriptionEn || "",
    descriptionNl: dish?.descriptionNl || "",
    descriptionFr: dish?.descriptionFr || "",
    price: dish?.price || 0,
    categoryId: dish?.categoryId || "",
    rating: dish?.rating || 0,
    quantity: dish?.quantity || "",
    weight: dish?.weight || "",
    allergens: dish?.allergens?.join(", ") || "",
    ingredients: dish?.ingredients?.join("\n") || "",
    isActive: dish?.isActive ?? true,
  });

  // Update form data when dish prop changes (for edit mode)
  useEffect(() => {
    if (dish) {
      setFormData({
        nameEn: dish.nameEn || "",
        nameNl: dish.nameNl || "",
        nameFr: dish.nameFr || "",
        descriptionEn: dish.descriptionEn || "",
        descriptionNl: dish.descriptionNl || "",
        descriptionFr: dish.descriptionFr || "",
        price: dish.price || 0,
        categoryId: dish.categoryId || "",
        rating: dish.rating || 0,
        quantity: dish.quantity || "",
        weight: dish.weight || "",
        allergens: dish.allergens?.join(", ") || "",
        ingredients: dish.ingredients?.join("\n") || "",
        isActive: dish.isActive ?? true,
      });
      setImagePreview(dish.imageUrl || null);
    }
  }, [dish]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "price" || name === "rating" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      setImagePreview(data.url);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    if (confirm("Are you sure you want to remove this image?")) {
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const allergens = formData.allergens
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const ingredients = formData.ingredients
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        allergens,
        ingredients,
        imageUrl: imagePreview,
      };

      const url = dish ? `/api/admin/dishes/${dish.id}` : "/api/admin/dishes";
      const method = dish ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save dish");
      }

      // Get locale from current pathname
      const currentPath = window.location.pathname;
      const locale = currentPath.split("/")[1] || "en";
      window.location.href = `/${locale}/admin/dishes`;
    } catch (error: any) {
      console.error("Error saving dish:", error);
      alert(error.message || "Failed to save dish. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card rounded-xl shadow-soft border border-border p-6 lg:p-8 space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("dishImage")}
          </label>
          <div className="space-y-4">
            {imagePreview ? (
              <div className="space-y-2">
                <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-secondary border border-border group">
                  <Image
                    src={imagePreview}
                    alt="Dish preview"
                    fill
                    className="object-cover"
                    unoptimized={imagePreview.startsWith("http")}
                    onError={() => {
                      // Fallback if image fails to load
                      console.error("Failed to load image:", imagePreview);
                      setImagePreview(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                    aria-label="Replace image"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-md hover:bg-background transition-colors z-10"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-text-secondary">
                  Click image to replace or use X to remove
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-48 h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors"
              >
                <Upload className="w-8 h-8 text-text-secondary mb-2" />
                <span className="text-sm text-text-secondary">{t("uploadImage")}</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {uploadingImage && (
              <p className="text-sm text-text-secondary">Uploading...</p>
            )}
          </div>
        </div>

        {/* Names */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("nameEn")}
            </label>
            <input
              type="text"
              name="nameEn"
              value={formData.nameEn}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("nameNl")}
            </label>
            <input
              type="text"
              name="nameNl"
              value={formData.nameNl}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("nameFr")}
            </label>
            <input
              type="text"
              name="nameFr"
              value={formData.nameFr}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("descriptionEn")}
            </label>
            <textarea
              name="descriptionEn"
              value={formData.descriptionEn}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("descriptionNl")}
            </label>
            <textarea
              name="descriptionNl"
              value={formData.descriptionNl}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("descriptionFr")}
            </label>
            <textarea
              name="descriptionFr"
              value={formData.descriptionFr}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
            />
          </div>
        </div>

        {/* Price, Category, Rating */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("price")}
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("category")}
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
            >
              <option value="">{t("noCategory")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("rating")}
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              max="5"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
            />
          </div>
        </div>

        {/* Quantity and Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("quantity")}
            </label>
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder={t("quantityPlaceholder")}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("weight")}
            </label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder={t("weightPlaceholder")}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
            />
          </div>
        </div>

        {/* Allergens */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("allergens")}
          </label>
          <input
            type="text"
            name="allergens"
            value={formData.allergens}
            onChange={handleInputChange}
            placeholder={t("allergensPlaceholder")}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
          />
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("ingredients")}
          </label>
          <textarea
            name="ingredients"
            value={formData.ingredients}
            onChange={handleInputChange}
            rows={6}
            placeholder={t("ingredientsPlaceholder")}
            className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-foreground">
            {t("isActive")}
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={isSubmitting}
          className="px-8"
        >
          {isSubmitting ? t("saving") : dish ? t("updateDish") : t("createDish")}
        </Button>
        <Link
          href="/admin/dishes"
          className="px-6 py-3 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
        >
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}

