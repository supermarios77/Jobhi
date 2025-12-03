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
    <section className="bg-background border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left order-2 lg:order-1">
            {/* Headline - monospace uppercase with warm accent */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-foreground leading-[1.1] tracking-widest uppercase">
              <span className="bg-gradient-to-r from-foreground via-amber-600 dark:via-amber-400 to-foreground bg-clip-text text-transparent">
                {displayHeadline}
              </span>
            </h1>

            {/* Subheadline - monospace */}
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0 tracking-wide">
              {displaySubheadline}
            </p>

            {/* Simple CTA */}
            <div className="pt-2 sm:pt-4">
              <Link href={ctaHref}>
                <Button
                  size="lg"
                  variant="accent"
                  className="text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-4 border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background dark:hover:bg-foreground dark:hover:text-background transition-all duration-200 tracking-widest uppercase rounded-none"
                >
                  {displayCtaText}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Image - appetizing presentation */}
          <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none order-1 lg:order-2">
            <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-border shadow-2xl shadow-amber-200/30 dark:shadow-amber-900/20">
              <Image
                src={imageSrc || "/placeholder-dish.jpg"}
                alt={displayImageAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 500px"
              />
              {/* Warm appetizing overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-orange-400/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

