"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function Hero({
  headline,
  subheadline,
  ctaText,
  ctaHref = "/menu",
  imageSrc = "/placeholder-dish.jpg",
  imageAlt,
}: HeroProps = {}) {
  const t = useTranslations("hero");
  
  const displayHeadline = headline || t("headline");
  const displaySubheadline = subheadline || t("subheadline");
  const displayCtaText = ctaText || t("browseMenu");
  const displayImageAlt = imageAlt || displayHeadline;
  
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Headline - modern typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-[1.2] tracking-tight">
              {displayHeadline}
            </h1>

            {/* Subheadline - modern and clean */}
            <p className="text-lg sm:text-xl text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
              {displaySubheadline}
            </p>

            {/* Simple CTA */}
            <div className="pt-4">
              <Link href={ctaHref}>
                <Button
                  size="lg"
                  variant="accent"
                  className="text-base px-8 py-6 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {displayCtaText}
                </Button>
              </Link>
            </div>

            {/* Minimal note */}
            <p className="text-sm text-text-secondary pt-4">
              Made with care, delivered fresh
            </p>
          </div>

          {/* Right Column - Image - simpler presentation */}
          <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none">
            <div className="relative w-full h-full rounded-lg overflow-hidden bg-secondary">
              <Image
                src={imageSrc || "/placeholder-dish.jpg"}
                alt={displayImageAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 500px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

