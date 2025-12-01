import { Hero } from "@/components/hero";
import { MenuSection } from "@/components/menu-section";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <main>
      <Hero />
      <MenuSection locale={locale} />
    </main>
  );
}

