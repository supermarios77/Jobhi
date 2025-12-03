import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderStatus, getOrderByStripeSessionId } from "@/lib/db/order";
import { OrderStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

// Use Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

// Mock mode for development
const isMockMode = process.env.NODE_ENV === "development" && !process.env.STRIPE_SECRET_KEY;

export async function POST(req: Request) {
  // Mock mode: skip webhook verification
  if (isMockMode) {
    const body = await req.json();
    const { orderId, type } = body;

    if (type === "checkout.session.completed" && orderId) {
      await updateOrderStatus(orderId, "PAID" as OrderStatus);
      return NextResponse.json({ received: true, mock: true });
    }

    return NextResponse.json({ received: true, mock: true });
  }

  // Production: verify webhook signature
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await updateOrderStatus(orderId, "PAID" as OrderStatus, session.id);
          // Order marked as paid
        } else {
          // Fallback: try to find order by session ID
          const order = await getOrderByStripeSessionId(session.id);
          if (order) {
            await updateOrderStatus(order.id, "PAID" as OrderStatus, session.id);
            // Order marked as paid (found by session ID)
          } else {
            logger.warn(`Order not found for session ${session.id}`);
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // If using Payment Intents directly (not Checkout Sessions)
        const order = await getOrderByStripeSessionId(paymentIntent.id);
        if (order) {
          await updateOrderStatus(order.id, "PAID" as OrderStatus, paymentIntent.id);
        }
        break;
      }

      default:
        // Unhandled event type - log for monitoring
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

