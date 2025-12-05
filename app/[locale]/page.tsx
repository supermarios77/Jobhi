import { Hero } from "@/components/features/menu/hero";
import { MenuSection } from "@/components/features/menu/menu-section";
import { getMetadata } from "@/lib/metadata";
import { getOrganizationStructuredData } from "@/lib/structured-data";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return getMetadata({
    locale,
    path: "",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const organizationStructuredData = getOrganizationStructuredData(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      <main>
        <Hero />
        <MenuSection locale={locale} />
      </main>
    </>
  );
}

