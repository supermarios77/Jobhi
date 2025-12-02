import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createOrder } from "@/lib/db/order";
import { prisma } from "@/lib/prisma";
import { createAccountForUser } from "@/lib/auth/create-account";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";

// Use Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

// Mock mode for development
const isMockMode = process.env.NODE_ENV === "development" && !process.env.STRIPE_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      userId,
      deliveryInfo,
      createAccount = false,
      locale = "en",
    }: {
      items: Array<{
        dishId: string;
        quantity: number;
        price: number;
        size?: string;
      }>;
      userId: string;
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
      createAccount?: boolean;
      locale?: string;
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.21; // 21% VAT for Belgium
    const taxes = subtotal * taxRate;
    const totalAmount = subtotal + taxes;

    // Create account if requested
    let finalUserId = userId;
    if (createAccount && deliveryInfo?.email) {
      try {
        const accountResult = await createAccountForUser({
          email: deliveryInfo.email,
          firstName: deliveryInfo.firstName,
          lastName: deliveryInfo.lastName,
          phone: deliveryInfo.phone,
        });
        finalUserId = accountResult.userId;
        console.log(`Account created for ${deliveryInfo.email}, userId: ${finalUserId}`);
      } catch (error: any) {
        console.error("Failed to create account:", error);
        // Continue with order creation even if account creation fails
        // The order will still be created with temp-user-id
      }
    }

    // Create order in database
    const order = await createOrder({
      userId: finalUserId,
      items,
      totalAmount,
      deliveryInfo,
    });

    // Mock mode for development
    if (isMockMode) {
      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${locale}/checkout/success?orderId=${order.id}&mock=true`,
        orderId: order.id,
        mock: true,
      });
    }

    // Verify Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    // Dishes already fetched above for email, reuse them

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => {
        const dish = dishes.find((d) => d.id === item.dishId);
        const name =
          locale === "en"
            ? dish?.nameEn
            : locale === "nl"
            ? dish?.nameNl
            : dish?.nameFr || dish?.name || "Dish";

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name,
              description: item.size ? `Size: ${item.size}` : undefined,
              images: dish?.imageUrl ? [dish.imageUrl] : undefined,
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        };
      }),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/checkout?canceled=true`,
      customer_email: deliveryInfo?.email,
      metadata: {
        orderId: order.id,
        userId: finalUserId,
      },
      shipping_address_collection: {
        allowed_countries: ["BE"], // Belgium only
      },
    });

    // Update order with session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: session.id },
    });

    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

