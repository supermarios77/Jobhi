import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeError, logError, ValidationError } from "@/lib/errors";

export const runtime = "nodejs";

// PUT - Update a variant
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { variantId } = await params;
    const body = await req.json();
    const { nameEn, nameNl, nameFr, imageUrl, price, isActive, sortOrder } = body;

    if (!nameEn || !nameNl || !nameFr) {
      throw new ValidationError("Variant names in all languages are required");
    }

    const variant = await prisma.dishVariant.update({
      where: { id: variantId },
      data: {
        name: nameEn, // Update name field when nameEn changes
        nameEn,
        nameNl,
        nameFr,
        imageUrl: imageUrl || null,
        price: price ? parseFloat(price) : null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
      },
    });

    return NextResponse.json({ variant });
  } catch (error) {
    logError(error, { operation: "updateDishVariant" });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

// DELETE - Delete a variant
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { variantId } = await params;

    await prisma.dishVariant.delete({
      where: { id: variantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, { operation: "deleteDishVariant" });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

