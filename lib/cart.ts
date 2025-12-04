"use server";

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

const CART_COOKIE_NAME = "jobhi-cart";
const CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get(CART_COOKIE_NAME);

  if (!cartCookie?.value) {
    return [];
  }

  try {
    return JSON.parse(cartCookie.value) as CartItem[];
  } catch {
    return [];
  }
}

export async function addToCart(item: Omit<CartItem, "id">): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const currentCart = await getCart();

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
      id: `${item.dishId}-${item.variantId || "default"}-${Date.now()}`,
    };
    updatedCart = [...currentCart, newItem];
  }

  // Save to cookie
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(updatedCart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CART_MAX_AGE,
    path: "/",
  });

  return updatedCart;
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const currentCart = await getCart();

  if (quantity <= 0) {
    return removeFromCart(itemId);
  }

  const updatedCart = currentCart.map((item) =>
    item.id === itemId ? { ...item, quantity } : item
  );

  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(updatedCart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CART_MAX_AGE,
    path: "/",
  });

  return updatedCart;
}

export async function removeFromCart(itemId: string): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const currentCart = await getCart();

  const updatedCart = currentCart.filter((item) => item.id !== itemId);

  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(updatedCart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CART_MAX_AGE,
    path: "/",
  });

  return updatedCart;
}

export async function clearCart(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE_NAME);
}

export async function getCartItemCount(): Promise<number> {
  const cart = await getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

