/**
 * Structured data (JSON-LD) for SEO
 */

export interface OrganizationStructuredData {
  "@context": string;
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  contactPoint?: {
    "@type": "ContactPoint";
    telephone?: string;
    contactType: string;
    areaServed: string;
    availableLanguage: string[];
  };
  sameAs?: string[];
}

export interface ProductStructuredData {
  "@context": string;
  "@type": "Product";
  name: string;
  description?: string;
  image?: string;
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}

export interface BreadcrumbStructuredData {
  "@context": string;
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export function getOrganizationStructuredData(
  locale: string = "en"
): OrganizationStructuredData {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jobhi.be";
  const name = "Jobhi";
  const areaServed = locale === "nl" ? "België" : locale === "fr" ? "Belgique" : "Belgium";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: baseUrl,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      areaServed,
      availableLanguage: ["en", "nl", "fr"],
    },
  };
}

export function getProductStructuredData(
  dish: {
    name: string;
    nameEn?: string | null;
    nameNl?: string | null;
    nameFr?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    descriptionNl?: string | null;
    descriptionFr?: string | null;
    price: number;
    imageUrl?: string | null;
    slug: string;
  },
  locale: string = "en"
): ProductStructuredData {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jobhi.be";
  const name =
    locale === "en"
      ? dish.nameEn || dish.name
      : locale === "nl"
      ? dish.nameNl || dish.name
      : dish.nameFr || dish.name;

  const description =
    locale === "en"
      ? dish.descriptionEn || dish.description
      : locale === "nl"
      ? dish.descriptionNl || dish.description
      : dish.descriptionFr || dish.description;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: name || dish.name,
    description: description || undefined,
    image: dish.imageUrl || undefined,
    offers: {
      "@type": "Offer",
      price: dish.price.toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/${locale}/menu/${dish.slug}`,
    },
  };
}

export function getBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
): BreadcrumbStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

