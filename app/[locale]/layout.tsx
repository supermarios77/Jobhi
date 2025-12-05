import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/config/i18n/routing";
import { Navbar } from "@/components/layout/navbar";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { getMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import "../globals.css";
import "@/lib/env"; // Validate environment variables on startup

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return getMetadata({ locale });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL || "https://jobhi.be"}/${locale}`} />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>
          <ToastProvider>
            <NextIntlClientProvider messages={messages}>
              <NavigationProgress />
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 animate-in fade-in duration-300" id="main-content">{children}</main>
                <Analytics />
              </div>
            </NextIntlClientProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

