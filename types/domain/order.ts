/**
 * Domain types for Order entities
 */

import type { Meal } from "./dish";

export type OrderStatus = "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  mealId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  meal?: Meal;
}

