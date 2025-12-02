import { getTranslations } from "next-intl/server";
import { getOrdersByEmail, getOrdersByUserId } from "@/lib/db/order";
import { OrderList } from "./order-list";
import { OrderSignInClient } from "./order-signin-client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  let orders = [];
  let userEmail = emailParam;

  if (session?.user?.email) {
    // User is signed in - get orders by user ID
    userEmail = session.user.email;
    
    // Get Prisma user by email to get userId
    const prismaUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (prismaUser) {
      orders = await getOrdersByUserId(prismaUser.id);
    } else {
      // Fallback to email lookup if Prisma user not found
      orders = await getOrdersByEmail(userEmail);
    }
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

