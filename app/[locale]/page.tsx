import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("common");

  return (
    <main className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          {t("welcome")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Premium frozen meals delivered to your door
        </p>
      </div>
    </main>
  );
}

