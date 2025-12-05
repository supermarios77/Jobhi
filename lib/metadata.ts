import { Metadata } from "next";
import { routing } from "@/config/i18n/routing";

const siteName = "Jobhi";
const defaultDescription = {
  en: "Order delicious homemade meals online. Fresh, healthy, and ready in 48 hours. Pickup available in Brussels, Belgium.",
  nl: "Bestel heerlijke zelfgemaakte maaltijden online. Vers, gezond en klaar binnen 48 uur. Afhaling beschikbaar in Brussel, België.",
  fr: "Commandez de délicieux plats faits maison en ligne. Frais, sains et prêts en 48 heures. Retrait disponible à Bruxelles, Belgique.",
};

const defaultTitle = {
  en: "Jobhi - Delicious Homemade Meals Delivered",
  nl: "Jobhi - Heerlijke Zelfgemaakte Maaltijden",
  fr: "Jobhi - Délicieux Plats Maison",
};

export function getMetadata({
  title,
  description,
  locale = "en",
  path = "",
  image,
  noindex = false,
}: {
  title?: string;
  description?: string;
  locale?: string;
  path?: string;
  image?: string;
} & { noindex?: boolean }): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jobhi.be";
  const fullUrl = `${baseUrl}${path ? `/${locale}${path}` : `/${locale}`}`;
  const siteTitle = title
    ? `${title} | ${siteName}`
    : defaultTitle[locale as keyof typeof defaultTitle] || defaultTitle.en;
  const siteDescription =
    description ||
    defaultDescription[locale as keyof typeof defaultDescription] ||
    defaultDescription.en;
  const ogImage = image || `${baseUrl}/og-image.png`;

  return {
    title: siteTitle,
    description: siteDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        "en": `${baseUrl}/en${path}`,
        "nl": `${baseUrl}/nl${path}`,
        "fr": `${baseUrl}/fr${path}`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale,
      url: fullUrl,
      title: siteTitle,
      description: siteDescription,
      siteName: siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: [ogImage],
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

