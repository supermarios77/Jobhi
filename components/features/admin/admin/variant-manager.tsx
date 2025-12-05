"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Plus, X, Upload, Edit2, Trash2 } from "lucide-react";
import Image from "next/image";

interface Variant {
  id: string;
  nameEn: string;
  nameNl: string;
  nameFr: string;
  imageUrl?: string | null;
  price?: number | null;
  isActive: boolean;
  sortOrder: number;
}

interface VariantManagerProps {
  dishId: string;
  initialVariants?: Variant[];
}

export function VariantManager({ dishId, initialVariants = [] }: VariantManagerProps) {
  const t = useTranslations("admin.dishForm");
  const { addToast } = useToast();
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    if (dishId) {
      loadVariants();
    }
  }, [dishId]);

  const loadVariants = async () => {
    try {
      const response = await fetch(`/api/admin/dishes/${dishId}/variants`);
      if (response.ok) {
        const data = await response.json();
        setVariants(data.variants || []);
      }
    } catch (error) {
      console.error("Failed to load variants:", error);
    }
  };

  const handleImageUpload = async (variantId: string, file: File) => {
    setUploadingImage(variantId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await uploadResponse.json();

      // Update variant with new image
      await updateVariant(variantId, { imageUrl: url });
      await loadVariants();
    } catch (error: any) {
      addToast(error.message || "Failed to upload image", "error");
    } finally {
      setUploadingImage(null);
    }
  };

  const createVariant = async (variantData: Omit<Variant, "id" | "sortOrder">) => {
    try {
      const response = await fetch(`/api/admin/dishes/${dishId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variantData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create variant");
      }

      addToast("Variant created successfully", "success");
      await loadVariants();
      setIsAdding(false);
    } catch (error: any) {
      addToast(error.message || "Failed to create variant", "error");
    }
  };

  const updateVariant = async (variantId: string, updates: Partial<Variant>) => {
    try {
      const response = await fetch(`/api/admin/dishes/${dishId}/variants/${variantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update variant");
      }

      addToast("Variant updated successfully", "success");
      await loadVariants();
      setEditingId(null);
    } catch (error: any) {
      addToast(error.message || "Failed to update variant", "error");
    }
  };

  const deleteVariant = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/dishes/${dishId}/variants/${variantId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete variant");
      }

      addToast("Variant deleted successfully", "success");
      await loadVariants();
    } catch (error: any) {
      addToast(error.message || "Failed to delete variant", "error");
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-soft border border-border p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">Variants</h3>
          <p className="text-sm text-text-secondary mt-1">
            Add different flavors or variations of this dish (e.g., Aloo, Chicken, Mince)
          </p>
        </div>
        {!isAdding && (
          <Button
            type="button"
            onClick={() => setIsAdding(true)}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Variant
          </Button>
        )}
      </div>

      {/* Add New Variant Form */}
      {isAdding && (
        <VariantForm
          onSave={(data) => {
            createVariant(data);
          }}
          onCancel={() => setIsAdding(false)}
          onImageUpload={(file) => {
            // Handle image upload for new variant (will be saved after creation)
            return Promise.resolve(URL.createObjectURL(file));
          }}
        />
      )}

      {/* Variants List */}
      <div className="space-y-4">
        {variants.length === 0 && !isAdding && (
          <p className="text-sm text-text-secondary text-center py-8">
            No variants yet. Click "Add Variant" to create one.
          </p>
        )}

        {variants.map((variant) => (
          <VariantItem
            key={variant.id}
            variant={variant}
            isEditing={editingId === variant.id}
            onEdit={() => setEditingId(variant.id)}
            onCancel={() => setEditingId(null)}
            onSave={(updates) => updateVariant(variant.id, updates)}
            onDelete={() => deleteVariant(variant.id)}
            onImageUpload={(file) => handleImageUpload(variant.id, file)}
            isUploading={uploadingImage === variant.id}
          />
        ))}
      </div>
    </div>
  );
}

interface VariantFormProps {
  variant?: Variant;
  onSave: (data: Omit<Variant, "id" | "sortOrder">) => void;
  onCancel: () => void;
  onImageUpload: (file: File) => Promise<string>;
}

function VariantForm({ variant, onSave, onCancel, onImageUpload }: VariantFormProps) {
  const [formData, setFormData] = useState({
    nameEn: variant?.nameEn || "",
    nameNl: variant?.nameNl || "",
    nameFr: variant?.nameFr || "",
    price: variant?.price?.toString() || "",
    imageUrl: variant?.imageUrl || "",
    isActive: variant?.isActive ?? true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(variant?.imageUrl || null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await onImageUpload(file);
      setImagePreview(url);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Name (English) *
          </label>
          <input
            type="text"
            value={formData.nameEn}
            onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Name (Dutch) *
          </label>
          <input
            type="text"
            value={formData.nameNl}
            onChange={(e) => setFormData((prev) => ({ ...prev, nameNl: e.target.value }))}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Name (French) *
          </label>
          <input
            type="text"
            value={formData.nameFr}
            onChange={(e) => setFormData((prev) => ({ ...prev, nameFr: e.target.value }))}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Price (optional, uses dish price if empty)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Image (optional)
          </label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Variant preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors">
                {uploading ? "Uploading..." : <Upload className="w-4 h-4" />}
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" size="sm">
          {variant ? "Update" : "Create"} Variant
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface VariantItemProps {
  variant: Variant;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updates: Partial<Variant>) => void;
  onDelete: () => void;
  onImageUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

function VariantItem({
  variant,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onImageUpload,
  isUploading,
}: VariantItemProps) {
  if (isEditing) {
    return (
      <VariantForm
        variant={variant}
        onSave={(data) => onSave(data)}
        onCancel={onCancel}
        onImageUpload={async (file) => {
          await onImageUpload(file);
          return variant.imageUrl || "";
        }}
      />
    );
  }

  return (
    <div className="border border-border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {variant.imageUrl && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
            <Image
              src={variant.imageUrl}
              alt={variant.nameEn}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <div className="font-medium text-foreground">
            {variant.nameEn} / {variant.nameNl} / {variant.nameFr}
          </div>
          {variant.price && (
            <div className="text-sm text-text-secondary">€{variant.price.toFixed(2)}</div>
          )}
          <div className="text-xs text-text-secondary">
            {variant.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

