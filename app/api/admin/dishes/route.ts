import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

// Use Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body = await req.json();
    const {
      nameEn,
      nameNl,
      nameFr,
      descriptionEn,
      descriptionNl,
      descriptionFr,
      price,
      imageUrl,
      categoryId,
      rating,
      allergens,
      ingredients,
      isActive,
    } = body;

    // Validate required fields
    if (!nameEn || !nameNl || !nameFr || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug from English name
    const baseSlug = generateSlug(nameEn);
    // Ensure slug is unique by appending a number if needed
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.dish.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const dish = await prisma.dish.create({
      data: {
        name: nameEn, // Default name
        nameEn,
        nameNl,
        nameFr,
        slug,
        description: descriptionEn,
        descriptionEn,
        descriptionNl,
        descriptionFr,
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        categoryId: categoryId || null,
        rating: rating ? parseFloat(rating) : 0,
        allergens: allergens || [],
        ingredients: ingredients || [],
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(dish);
  } catch (error: any) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create dish" },
      { status: 500 }
    );
  }
}

