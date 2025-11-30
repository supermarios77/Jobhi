export type Locale = "en" | "nl" | "fr";

export interface Meal {
  id: string;
  name: string;
  nameEn: string;
  nameNl: string;
  nameFr: string;
  description?: string;
  descriptionEn?: string;
  descriptionNl?: string;
  descriptionFr?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled";
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

