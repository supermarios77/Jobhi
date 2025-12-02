import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { sanitizeError, logError, ValidationError } from "@/lib/errors";

// Use Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    logError(error, { operation: "createDish", reason: "auth" });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }

  try {
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
      quantity,
      weight,
      allergens,
      ingredients,
      isActive,
    } = body;

    // Validate required fields
    if (!nameEn || !nameNl || !nameFr || price === undefined) {
      throw new ValidationError("Missing required fields: nameEn, nameNl, nameFr, and price are required");
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      throw new ValidationError("Price must be a valid positive number");
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
        quantity: quantity || null,
        weight: weight || null,
        allergens: allergens || [],
        ingredients: ingredients || [],
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(dish);
  } catch (error) {
    logError(error, { operation: "createDish" });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

