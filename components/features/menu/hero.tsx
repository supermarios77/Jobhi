"use client";

import { Link } from "@/config/i18n/routing";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { smoothScrollToAnchor } from "@/lib/utils/smooth-scroll";

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
  ctaHref = "/#menu",
  imageSrc = "/placeholder-dish.png",
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
            {/* Headline - monospace uppercase */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-normal text-foreground leading-[1.1] tracking-widest uppercase">
              {displayHeadline}
            </h1>

            {/* Subheadline - monospace */}
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0 tracking-wide">
              {displaySubheadline}
            </p>

            {/* Simple CTA */}
            <div className="pt-2 sm:pt-4">
              {ctaHref.includes("#") ? (
                <a
                  href={ctaHref}
                  onClick={(e) => {
                    e.preventDefault();
                    if (ctaHref.startsWith("/")) {
                      const [path, hash] = ctaHref.split("#");
                      if (typeof window !== "undefined") {
                        const currentPath = window.location.pathname;
                        
                        // Check if we're on home page (root or locale root)
                        const isHome = currentPath === "/" || /^\/[a-z]{2}\/?$/.test(currentPath);
                        
                        // If path is "/" and we're on home page, just scroll
                        // Otherwise, only navigate if we're on a different page
                        if (path === "/" && isHome) {
                          smoothScrollToAnchor(ctaHref);
                        } else if (currentPath !== path && !isHome) {
                          window.location.href = ctaHref;
                          setTimeout(() => smoothScrollToAnchor(ctaHref), 100);
                        } else {
                          smoothScrollToAnchor(ctaHref);
                        }
                      }
                    } else {
                      smoothScrollToAnchor(ctaHref);
                    }
                  }}
                >
                  <Button
                    size="lg"
                    variant="accent"
                    className="text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-4 border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background dark:hover:bg-foreground dark:hover:text-background transition-all duration-200 tracking-widest uppercase rounded-none"
                  >
                    {displayCtaText}
                  </Button>
                </a>
              ) : (
                <Link href={ctaHref}>
                  <Button
                    size="lg"
                    variant="accent"
                    className="text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-4 border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background dark:hover:bg-foreground dark:hover:text-background transition-all duration-200 tracking-widest uppercase rounded-none"
                  >
                    {displayCtaText}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right Column - Image - circular presentation */}
          <div className="relative w-full flex items-center justify-center max-w-md mx-auto lg:max-w-lg order-1 lg:order-2">
            <div className="relative w-full">
              <Image
                src={imageSrc || "/placeholder-dish.png"}
                alt={displayImageAlt}
                width={500}
                height={500}
                className="w-full h-auto object-contain"
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

