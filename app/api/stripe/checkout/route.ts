import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createOrder } from "@/lib/db/order";
import { prisma } from "@/lib/prisma";
import { createAccountForUser } from "@/lib/auth/create-account";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";
import { sanitizeError, logError, ValidationError } from "@/lib/errors";
import { rateLimiters } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// Use Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

// Mock mode for development
const isMockMode = process.env.NODE_ENV === "development" && !process.env.STRIPE_SECRET_KEY;

export async function POST(req: NextRequest) {
  return rateLimiters.checkout(req, async () => {
    try {
    const body = await req.json();
    const {
      items,
      userId,
      customerInfo,
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
      customerInfo?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
      };
      createAccount?: boolean;
      locale?: string;
    } = body;

    if (!items || items.length === 0) {
      throw new ValidationError("No items in cart");
    }

    if (!customerInfo?.email) {
      throw new ValidationError("Email is required");
    }

    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.21; // 21% VAT for Belgium
    const taxes = subtotal * taxRate;
    const totalAmount = subtotal + taxes;

    // Create account if requested
    let finalUserId = userId;
    if (createAccount && customerInfo?.email) {
      try {
        const accountResult = await createAccountForUser({
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          phone: customerInfo.phone,
        });
        finalUserId = accountResult.userId;
        logger.log(`Account created for ${customerInfo.email}, userId: ${finalUserId}`);
      } catch (error: any) {
        logger.error("Failed to create account:", error);
        // Continue with order creation even if account creation fails
        // The order will still be created with temp-user-id
      }
    }

    // Create order in database (using customerInfo for backward compatibility with deliveryInfo structure)
    const order = await createOrder({
      userId: finalUserId,
      items,
      totalAmount,
      deliveryInfo: customerInfo, // Keep using deliveryInfo for backward compatibility with schema
    });

    // Fetch dish details for email and Stripe
    const dishIds = items.map((item) => item.dishId);
    const dishes = await prisma.dish.findMany({
      where: { id: { in: dishIds } },
    });

    // Send order confirmation email (in both mock and production mode)
    if (customerInfo?.email) {
      try {
        await sendOrderConfirmationEmail({
          orderId: order.id,
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          totalAmount,
          items: items.map((item) => {
            const dish = dishes.find((d) => d.id === item.dishId);
            const name =
              locale === "en"
                ? dish?.nameEn
                : locale === "nl"
                ? dish?.nameNl
                : dish?.nameFr || dish?.name || "Dish";
            return {
              name: name || "Unknown Dish",
              quantity: item.quantity,
              price: item.price,
              size: item.size || undefined,
            };
          }),
          locale,
        });
      } catch (error: any) {
        logger.error("Failed to send order confirmation email:", error);
        // Don't fail the checkout if email fails
      }
    }

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
              name: name || "Dish",
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
      customer_email: customerInfo?.email,
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
    } catch (error) {
      logError(error, { operation: "checkout" });
      const sanitized = sanitizeError(error);
      return NextResponse.json(
        { error: sanitized.message, code: sanitized.code },
        { status: sanitized.statusCode }
      );
    }
  });
}

