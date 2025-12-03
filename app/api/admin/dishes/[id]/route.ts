import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { sanitizeError, logError, ValidationError, NotFoundError } from "@/lib/errors";

// Use Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      nameEn,
      nameNl,
      nameFr,
      descriptionEn,
      descriptionNl,
      descriptionFr,
      price,
      pricingModel,
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
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current dish to check if name changed
    const currentDish = await prisma.dish.findUnique({ where: { id } });
    
    // Generate new slug if name changed
    let slug = currentDish?.slug || generateSlug(nameEn);
    if (currentDish?.nameEn !== nameEn) {
      const baseSlug = generateSlug(nameEn);
      let counter = 1;
      let newSlug = baseSlug;
      while (await prisma.dish.findFirst({ where: { slug: newSlug, NOT: { id } } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      slug = newSlug;
    }

    const dish = await prisma.dish.update({
      where: { id },
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
        pricingModel: pricingModel || "FIXED",
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
    logError(error, { operation: "updateDish", dishId: id });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();
  } catch (error) {
    logError(error, { operation: "deleteDish", reason: "auth" });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }

  try {

    await prisma.dish.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, { operation: "deleteDish", dishId: id });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();

    const body = await req.json();
    const { isActive } = body;

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(dish);
  } catch (error) {
    logError(error, { operation: "updateDishStatus", dishId: id });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

