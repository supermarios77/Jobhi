"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface CartItem {
  id: string;
  dishId: string;
  variantId?: string; // Optional variant ID
  variantName?: string; // Optional variant name for display
  name: string;
  price: number;
  quantity: number;
  imageSrc?: string;
  size?: string; // Deprecated, use variantId instead
}

const CART_COOKIE_NAME = "jobhi-cart-session";
const CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!sessionId) {
    // Generate a new session ID
    sessionId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    cookieStore.set(CART_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: CART_MAX_AGE,
      path: "/",
    });
  }

  return sessionId;
}

export async function getCart(): Promise<CartItem[]> {
  try {
    const supabase = await createClient();
    const sessionId = await getOrCreateSessionId();

    // Try to get cart from Supabase
    const { data, error } = await supabase
      .from("cart_sessions")
      .select("items")
      .eq("session_id", sessionId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is fine
      console.error("Error fetching cart:", error);
      return [];
    }

    if (data?.items) {
      return data.items as CartItem[];
    }

    return [];
  } catch (error) {
    console.error("Error in getCart:", error);
    return [];
  }
}

export async function saveCart(items: CartItem[]): Promise<void> {
  try {
    const supabase = await createClient();
    const sessionId = await getOrCreateSessionId();
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    // Check if cart session already exists - fetch id and created_at
    const { data: existingCart, error: fetchError } = await supabase
      .from("cart_sessions")
      .select("id, created_at")
      .eq("session_id", sessionId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is fine
      console.error("Error checking existing cart:", fetchError);
    }

    // Prepare the data object
    const cartData: any = {
      session_id: sessionId,
      items,
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(), // Always include updated_at
    };

    if (existingCart && !fetchError) {
      // Update existing cart - include the ID and preserve created_at
      cartData.id = existingCart.id;
      if (existingCart.created_at) {
        cartData.created_at = existingCart.created_at;
      }
    } else {
      // Create new cart - generate new ID
      cartData.id = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      cartData.created_at = now.toISOString();
    }

    // Upsert cart session
    const { error } = await supabase
      .from("cart_sessions")
      .upsert(cartData, {
        onConflict: "session_id",
      });

    if (error) {
      console.error("Error saving cart:", error);
      throw error; // Re-throw to handle in calling function
    }
  } catch (error) {
    console.error("Error in saveCart:", error);
    throw error; // Re-throw to ensure errors are propagated
  }
}

export async function addToCart(item: Omit<CartItem, "id">): Promise<CartItem[]> {
  const supabase = await createClient();
  const sessionId = await getOrCreateSessionId();
  
  // Use a retry mechanism to handle race conditions
  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      // Fetch current cart fresh from database to avoid race conditions
      const { data: cartData, error: fetchError } = await supabase
        .from("cart_sessions")
        .select("items")
        .eq("session_id", sessionId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine
        throw new Error(`Failed to fetch cart: ${fetchError.message}`);
      }

      const currentCart: CartItem[] = (cartData?.items as CartItem[]) || [];

      // Check if item already exists (same dishId and variantId)
      const existingItemIndex = currentCart.findIndex(
        (cartItem) => 
          cartItem.dishId === item.dishId && 
          cartItem.variantId === item.variantId &&
          (!item.variantId || cartItem.variantId === item.variantId)
      );

      let updatedCart: CartItem[];

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        updatedCart = [...currentCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + item.quantity,
        };
      } else {
        // Add new item with unique ID
        const newItem: CartItem = {
          ...item,
          id: `${item.dishId}-${item.variantId || "default"}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };
        updatedCart = [...currentCart, newItem];
      }

      // Save cart atomically
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Check if cart exists to get the ID for updates
      const { data: existingCart, error: checkError } = await supabase
        .from("cart_sessions")
        .select("id, created_at")
        .eq("session_id", sessionId)
        .single();

      const cartDataToSave: any = {
        session_id: sessionId,
        items: updatedCart,
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      };

      if (existingCart && !checkError) {
        // Update existing cart - include the ID
        cartDataToSave.id = existingCart.id;
        // Keep the original created_at if it exists
        if (existingCart.created_at) {
          cartDataToSave.created_at = existingCart.created_at;
        }
      } else {
        // Create new cart - generate new ID
        cartDataToSave.id = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        cartDataToSave.created_at = now.toISOString();
      }

      // Upsert with conflict handling
      const { error: saveError } = await supabase
        .from("cart_sessions")
        .upsert(cartDataToSave, {
          onConflict: "session_id",
        });

      if (saveError) {
        throw new Error(`Failed to save cart: ${saveError.message}`);
      }

      return updatedCart;
    } catch (error) {
      lastError = error as Error;
      retries--;
      if (retries > 0) {
        // Wait a bit before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 100 * (4 - retries)));
      }
    }
  }

  // If all retries failed, throw the last error
  throw lastError || new Error("Failed to add item to cart after retries");
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<CartItem[]> {
  const currentCart = await getCart();

  if (quantity <= 0) {
    return removeFromCart(itemId);
  }

  const updatedCart = currentCart.map((item) =>
    item.id === itemId ? { ...item, quantity } : item
  );

  await saveCart(updatedCart);
  return updatedCart;
}

export async function removeFromCart(itemId: string): Promise<CartItem[]> {
  const currentCart = await getCart();
  const updatedCart = currentCart.filter((item) => item.id !== itemId);
  
  // If cart is empty after removal, clear it completely
  if (updatedCart.length === 0) {
    await clearCart();
    return [];
  }
  
  await saveCart(updatedCart);
  return updatedCart;
}

export async function clearCart(): Promise<void> {
  try {
    const supabase = await createClient();
    const sessionId = await getOrCreateSessionId();

    const { error } = await supabase
      .from("cart_sessions")
      .delete()
      .eq("session_id", sessionId);

    if (error) {
      console.error("Error clearing cart:", error);
    }
  } catch (error) {
    console.error("Error in clearCart:", error);
  }
}

export async function getCartItemCount(): Promise<number> {
  const cart = await getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

