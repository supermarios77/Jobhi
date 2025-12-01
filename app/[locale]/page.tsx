import { Hero } from "@/components/hero";
import { MenuSection } from "@/components/menu-section";

export default async function HomePage() {
  return (
    <main>
      <Hero />
      <MenuSection />
    </main>
  );
}

