import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

// Use Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

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
    console.error("Error updating dish:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update dish" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    await prisma.dish.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting dish:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete dish" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const body = await req.json();
    const { isActive } = body;

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(dish);
  } catch (error: any) {
    console.error("Error updating dish status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update dish" },
      { status: 500 }
    );
  }
}

