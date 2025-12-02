"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface CartItem {
  id: string;
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  imageSrc?: string;
  size?: string;
}

const CART_COOKIE_NAME = "freshbite-cart-session";
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

    // Check if cart session already exists
    const { data: existingCart, error: fetchError } = await supabase
      .from("cart_sessions")
      .select("id")
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

    // If cart doesn't exist, we need to provide an ID and created_at
    // Generate a CUID-like ID (similar to Prisma's cuid())
    if (!existingCart) {
      cartData.id = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      cartData.created_at = now.toISOString(); // Include created_at for new records
    }

    // Upsert cart session
    const { error } = await supabase
      .from("cart_sessions")
      .upsert(cartData, {
        onConflict: "session_id",
      });

    if (error) {
      console.error("Error saving cart:", error);
    }
  } catch (error) {
    console.error("Error in saveCart:", error);
  }
}

export async function addToCart(item: Omit<CartItem, "id">): Promise<CartItem[]> {
  const currentCart = await getCart();

  // Check if item already exists (same dishId and size)
  const existingItemIndex = currentCart.findIndex(
    (cartItem) => cartItem.dishId === item.dishId && cartItem.size === item.size
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
      id: `${item.dishId}-${item.size || "default"}-${Date.now()}`,
    };
    updatedCart = [...currentCart, newItem];
  }

  await saveCart(updatedCart);
  return updatedCart;
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

