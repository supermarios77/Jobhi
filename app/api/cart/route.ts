import { NextRequest, NextResponse } from "next/server";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  type CartItem,
} from "@/lib/cart-supabase";
import { sanitizeError, logError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// GET - Get cart
export async function GET(req: NextRequest) {
  try {
    const cart = await getCart();
    return NextResponse.json({ cart }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (error) {
    logError(error, { operation: "getCart" });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

// POST - Add item to cart
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dishId, name, price, quantity, imageSrc, size } = body;

    if (!dishId || !name || price === undefined || !quantity) {
      throw new ValidationError("Missing required fields: dishId, name, price, and quantity are required");
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      throw new ValidationError("Invalid price value");
    }

    if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      throw new ValidationError("Quantity must be a positive number");
    }

    const cart = await addToCart({
      dishId,
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      imageSrc,
      size,
    });

    return NextResponse.json({ cart, success: true });
  } catch (error) {
    logError(error, { operation: "addToCart" });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

// PUT - Update cart item quantity
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      throw new ValidationError("Missing required fields: itemId and quantity are required");
    }

    if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      throw new ValidationError("Quantity must be a positive number");
    }

    const cart = await updateCartItemQuantity(itemId, parseInt(quantity));
    return NextResponse.json({ cart, success: true });
  } catch (error) {
    logError(error, { operation: "updateCartItemQuantity" });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

// DELETE - Remove item from cart or clear cart
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const clear = searchParams.get("clear") === "true";

    if (clear) {
      await clearCart();
      return NextResponse.json({ cart: [], success: true }, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      });
    }

    if (!itemId) {
      throw new ValidationError("Missing itemId parameter");
    }

    const cart = await removeFromCart(itemId);
    
    // Verify the item was actually removed
    const verifyCart = await getCart();
    const itemStillExists = verifyCart.some(item => item.id === itemId);
    
    if (itemStillExists) {
      logger.error(`Item ${itemId} still exists after removal attempt. Retrying...`);
      // Retry removal
      const retryCart = await removeFromCart(itemId);
      return NextResponse.json({ cart: retryCart, success: true }, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      });
    }
    
    return NextResponse.json({ cart, success: true }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (error) {
    logError(error, { operation: "removeFromCart" });
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message, code: sanitized.code },
      { status: sanitized.statusCode }
    );
  }
}

