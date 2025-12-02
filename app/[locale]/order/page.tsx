import { getTranslations } from "next-intl/server";
import { getOrdersByEmail } from "@/lib/db/order";
import { OrderList } from "./order-list";
import { OrderSignInClient } from "./order-signin-client";
import { getSession } from "@/lib/auth";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { locale } = await params;
  const { email: emailParam } = await searchParams;
  const t = await getTranslations("order");

  // Check if user is authenticated
  const session = await getSession();
  let orders: Awaited<ReturnType<typeof getOrdersByEmail>> = [];
  let userEmail = emailParam;

  if (session?.user?.email) {
    // User is signed in - get orders by email
    userEmail = session.user.email;
    orders = await getOrdersByEmail(userEmail);
  } else if (emailParam) {
    // Not signed in but email provided - show orders by email (legacy support)
    orders = await getOrdersByEmail(emailParam);
  }

  // If user is authenticated, show orders directly
  if (session?.user) {
    return <OrderList orders={orders} locale={locale} email={userEmail} />;
  }

  // If no session, show sign-in form
  return <OrderSignInClient locale={locale} />;
}

