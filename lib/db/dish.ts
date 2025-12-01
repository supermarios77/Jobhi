import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export interface GetDishesParams {
  categoryId?: string;
  isActive?: boolean;
  locale?: "en" | "nl" | "fr";
}

export async function getDishes(params: GetDishesParams = {}) {
  const { categoryId, isActive, locale = "en" } = params;

  const dishes = await prisma.dish.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Map to include localized names
  return dishes.map((dish) => ({
    id: dish.id,
    slug: dish.slug,
    name: locale === "en" ? dish.nameEn : locale === "nl" ? dish.nameNl : dish.nameFr,
    description:
      locale === "en"
        ? dish.descriptionEn
        : locale === "nl"
        ? dish.descriptionNl
        : dish.descriptionFr,
    price: dish.price,
    imageUrl: dish.imageUrl,
    rating: dish.rating || 0,
    allergens: dish.allergens,
    ingredients: dish.ingredients,
    category: dish.category
      ? {
          id: dish.category.id,
          name:
            locale === "en"
              ? dish.category.nameEn
              : locale === "nl"
              ? dish.category.nameNl
              : dish.category.nameFr,
          slug: dish.category.slug,
        }
      : null,
    isActive: dish.isActive,
    createdAt: dish.createdAt,
    updatedAt: dish.updatedAt,
  }));
}

export async function getDishById(id: string, locale: "en" | "nl" | "fr" = "en") {
  const dish = await prisma.dish.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!dish) {
    return null;
  }

  // Return raw data for admin editing, or localized for public display
  return {
    id: dish.id,
    slug: dish.slug,
    name: dish.name,
    nameEn: dish.nameEn,
    nameNl: dish.nameNl,
    nameFr: dish.nameFr,
    description: dish.description,
    descriptionEn: dish.descriptionEn,
    descriptionNl: dish.descriptionNl,
    descriptionFr: dish.descriptionFr,
    price: dish.price,
    imageUrl: dish.imageUrl,
    rating: dish.rating || 0,
    allergens: dish.allergens,
    ingredients: dish.ingredients,
    categoryId: dish.categoryId,
    category: dish.category
      ? {
          id: dish.category.id,
          name:
            locale === "en"
              ? dish.category.nameEn
              : locale === "nl"
              ? dish.category.nameNl
              : dish.category.nameFr,
          slug: dish.category.slug,
        }
      : null,
    isActive: dish.isActive,
    createdAt: dish.createdAt,
    updatedAt: dish.updatedAt,
  };
}

export async function getDishBySlug(slug: string, locale: "en" | "nl" | "fr" = "en") {
  const dish = await prisma.dish.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });

  if (!dish) {
    return null;
  }

  // Return localized data for public display
  return {
    id: dish.id,
    slug: dish.slug,
    name: locale === "en" ? dish.nameEn : locale === "nl" ? dish.nameNl : dish.nameFr,
    nameEn: dish.nameEn,
    nameNl: dish.nameNl,
    nameFr: dish.nameFr,
    description:
      locale === "en"
        ? dish.descriptionEn
        : locale === "nl"
        ? dish.descriptionNl
        : dish.descriptionFr,
    descriptionEn: dish.descriptionEn,
    descriptionNl: dish.descriptionNl,
    descriptionFr: dish.descriptionFr,
    price: dish.price,
    imageUrl: dish.imageUrl,
    rating: dish.rating || 0,
    allergens: dish.allergens,
    ingredients: dish.ingredients,
    categoryId: dish.categoryId,
    category: dish.category
      ? {
          id: dish.category.id,
          name:
            locale === "en"
              ? dish.category.nameEn
              : locale === "nl"
              ? dish.category.nameNl
              : dish.category.nameFr,
          slug: dish.category.slug,
        }
      : null,
    isActive: dish.isActive,
    createdAt: dish.createdAt,
    updatedAt: dish.updatedAt,
  };
}

export async function getCategories(locale: "en" | "nl" | "fr" = "en") {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name:
      locale === "en" ? category.nameEn : locale === "nl" ? category.nameNl : category.nameFr,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
  }));
}

