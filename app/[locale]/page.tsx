import { Hero } from "@/components/hero";
import { MenuSection } from "@/components/menu-section";
import { DebugDishes } from "@/components/debug-dishes";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <main>
      <Hero />
      <DebugDishes />
      <MenuSection locale={locale} />
    </main>
  );
}

