import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeError, logError, ValidationError } from "@/lib/errors";

export const runtime = "nodejs";

// GET - Get all variants for a dish
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const variants = await prisma.dishVariant.findMany({
      where: { dishId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ variants });
  } catch (error) {
    logError(error, { operation: "getDishVariants" });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

// POST - Create a new variant
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { nameEn, nameNl, nameFr, imageUrl, price, sortOrder } = body;

    if (!nameEn || !nameNl || !nameFr) {
      throw new ValidationError("Variant names in all languages are required");
    }

    // Get the highest sortOrder for this dish
    const maxSortOrder = await prisma.dishVariant.findFirst({
      where: { dishId: id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const variant = await prisma.dishVariant.create({
      data: {
        dishId: id,
        name: nameEn, // Use nameEn as the name field
        nameEn,
        nameNl,
        nameFr,
        imageUrl: imageUrl || null,
        price: price ? parseFloat(price) : null,
        sortOrder: sortOrder ?? (maxSortOrder?.sortOrder ?? 0) + 1,
      },
    });

    return NextResponse.json({ variant }, { status: 201 });
  } catch (error) {
    logError(error, { operation: "createDishVariant" });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

