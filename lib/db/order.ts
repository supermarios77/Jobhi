import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export interface CreateOrderData {
  userId: string;
  items: {
    dishId: string;
    quantity: number;
    price: number;
    size?: string;
  }[];
  totalAmount: number;
  deliveryInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    deliveryInstructions?: string;
  };
}

export async function createOrder(data: CreateOrderData) {
  const order = await prisma.order.create({
    data: {
      userId: data.userId,
      totalAmount: data.totalAmount,
      status: "PENDING", // Use string literal - Prisma accepts enum values as strings
      firstName: data.deliveryInfo?.firstName,
      lastName: data.deliveryInfo?.lastName,
      email: data.deliveryInfo?.email,
      phone: data.deliveryInfo?.phone,
      address: data.deliveryInfo?.address,
      city: data.deliveryInfo?.city,
      postalCode: data.deliveryInfo?.postalCode,
      country: data.deliveryInfo?.country,
      deliveryInstructions: data.deliveryInfo?.deliveryInstructions,
      items: {
        create: data.items.map((item) => ({
          dishId: item.dishId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
      },
    },
    include: {
      items: {
        include: {
          dish: true,
        },
      },
    },
  });

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  stripePaymentIntentId?: string
) {
  return await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(stripePaymentIntentId && { stripePaymentIntentId }),
    },
  });
}

export async function getOrderById(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          dish: true,
        },
      },
      user: true,
    },
  });
}

export async function getOrderByStripeSessionId(sessionId: string) {
  // Note: You may want to store sessionId in the order model
  // For now, we'll use stripePaymentIntentId
  return await prisma.order.findFirst({
    where: {
      stripePaymentIntentId: sessionId,
    },
    include: {
      items: {
        include: {
          dish: true,
        },
      },
      user: true,
    },
  });
}

