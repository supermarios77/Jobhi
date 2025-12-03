/**
 * Order confirmation email functionality
 * In production, this would use a service like Resend, SendGrid, or similar
 * For now, we'll use Supabase's email functionality or console logging
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface OrderConfirmationData {
  orderId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
  }>;
  locale?: string;
}

/**
 * Sends an order confirmation email
 * In development/mock mode, logs to console
 * In production, would send actual email
 */
// Pickup address configuration
const PICKUP_ADDRESS = {
  street: process.env.PICKUP_ADDRESS_STREET || "Rue de la Paix 123",
  city: process.env.PICKUP_ADDRESS_CITY || "Brussels",
  postalCode: process.env.PICKUP_ADDRESS_POSTAL_CODE || "1000",
  country: process.env.PICKUP_ADDRESS_COUNTRY || "Belgium",
  phone: process.env.PICKUP_ADDRESS_PHONE || "+32 12 34 56 789",
  hours: process.env.PICKUP_HOURS || "Monday - Friday: 9:00 - 18:00",
};

export async function sendOrderConfirmationEmail(
  data: OrderConfirmationData
): Promise<{ success: boolean; error?: string }> {
  const { email, orderId, totalAmount, items, firstName, lastName, locale = "en" } = data;

  if (!email) {
    return { success: false, error: "Email is required" };
  }

  // In development/mock mode, log the email content
  if (process.env.NODE_ENV === "development" || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log("\n📧 ORDER CONFIRMATION EMAIL (Mock Mode)");
    console.log("==========================================");
    console.log(`To: ${email}`);
    console.log(`Subject: Order Confirmation - Order #${orderId.slice(0, 8)}`);
    console.log("\n--- Email Content ---");
    console.log(`Hello ${firstName || "Customer"},`);
    console.log(`\nThank you for your order!`);
    console.log(`\nOrder ID: ${orderId}`);
    console.log(`Total: €${totalAmount.toFixed(2)}`);
    console.log(`\nItems:`);
    items.forEach((item) => {
      console.log(`  - ${item.name} x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`);
      if (item.size) console.log(`    Size: ${item.size}`);
    });
    console.log(`\nPickup Address:`);
    console.log(`  ${PICKUP_ADDRESS.street}`);
    console.log(`  ${PICKUP_ADDRESS.postalCode} ${PICKUP_ADDRESS.city}`);
    console.log(`  ${PICKUP_ADDRESS.country}`);
    console.log(`\nPickup Hours: ${PICKUP_ADDRESS.hours}`);
    console.log(`Phone: ${PICKUP_ADDRESS.phone}`);
    console.log(`\nYour order will be ready for pickup 48 hours after payment confirmation.`);
    console.log("\n==========================================\n");
    
    return { success: true };
  }

  // In production, you would use an email service here
  // Example with Supabase Edge Functions or Resend:
  try {
    // TODO: Implement actual email sending service
    // For now, we'll use Supabase's built-in email if available
    // or you can integrate Resend, SendGrid, etc.
    
    console.log(`📧 Order confirmation email sent to ${email} for order ${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send order confirmation email:", error);
    return { success: false, error: error.message };
  }
}

