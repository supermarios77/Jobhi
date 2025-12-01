"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Clock, Package, Star } from "lucide-react";

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
    <section className="relative bg-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-20 lg:py-32 xl:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">
          {/* Left Column - Content */}
          <div className="space-y-10 lg:space-y-12 relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium w-fit">
              <Star className="w-4 h-4 fill-accent" />
              <span>Chef-Prepared Meals</span>
            </div>

            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground leading-[1.1] tracking-tight">
                {displayHeadline.includes(",") ? (
                  <>
                    <span className="block">{displayHeadline.split(",")[0]},</span>
                    <span className="block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {displayHeadline.split(",").slice(1).join(",")}
                    </span>
                  </>
                ) : (
                  <span className="block">{displayHeadline}</span>
                )}
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl text-text-secondary leading-relaxed max-w-2xl font-light">
                {displaySubheadline}
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6 lg:gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm text-text-secondary">Delivery</div>
                  <div className="text-base font-semibold text-foreground">48h Advance</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                  <Package className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm text-text-secondary">Fresh</div>
                  <div className="text-base font-semibold text-foreground">Frozen Meals</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href={ctaHref}>
                <Button
                  size="lg"
                  variant="accent"
                  className="text-base sm:text-lg px-8 py-7 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                  {displayCtaText}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base sm:text-lg px-8 py-7 rounded-xl border-2 hover:bg-accent/5 transition-all duration-300"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative w-full aspect-square lg:aspect-[4/5] max-w-lg mx-auto lg:max-w-none">
            {/* Main image container */}
            <div className="relative w-full h-full rounded-3xl lg:rounded-[2rem] overflow-hidden shadow-2xl bg-secondary group">
              {imageSrc && imageSrc !== "/placeholder-dish.jpg" ? (
                <Image
                  src={imageSrc}
                  alt={displayImageAlt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary via-accent/5 to-muted">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center border-4 border-accent/30">
                      <svg
                        className="w-16 h-16 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <p className="text-text-secondary text-base font-medium">Dish Image</p>
                  </div>
                </div>
              )}
              
              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl -z-10 hidden lg:block animate-pulse" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/10 rounded-full blur-xl -z-10 hidden lg:block" />
            
            {/* Floating badge */}
            <div className="absolute -bottom-4 left-4 lg:left-8 bg-card border-2 border-accent/30 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-foreground">Fresh Daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

