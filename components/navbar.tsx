"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { CartBadge } from "./cart-badge";
import { useState } from "react";
import { smoothScrollToAnchor } from "@/lib/utils/smooth-scroll";

export function Navbar() {
  const t = useTranslations("common");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/#menu", label: t("menu") },
    { href: "/order", label: t("order") },
    { href: "/contact", label: t("contact") },
  ];


  return (
    <nav className="border-b border-border sticky top-0 z-50 backdrop-blur-md bg-background/95 dark:bg-background/90 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg sm:text-xl font-normal text-foreground hover:opacity-70 transition-opacity tracking-widest uppercase"
          >
            FreshBite
          </Link>

          {/* Desktop Navigation Links - Center */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-12">
            {navLinks.map((link) => {
              if (link.href.includes("#")) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      if (link.href.startsWith("/")) {
                        const [path, hash] = link.href.split("#");
                        const currentPath = window.location.pathname;
                        
                        // Check if we're on home page (root or locale root)
                        const isHome = currentPath === "/" || /^\/[a-z]{2}\/?$/.test(currentPath);
                        
                        // If path is "/" and we're on home page, just scroll
                        // Otherwise, only navigate if we're on a different page
                        if (path === "/" && isHome) {
                          smoothScrollToAnchor(link.href);
                        } else if (currentPath !== path && !isHome) {
                          window.location.href = link.href;
                          setTimeout(() => smoothScrollToAnchor(link.href), 100);
                        } else {
                          smoothScrollToAnchor(link.href);
                        }
                      } else {
                        smoothScrollToAnchor(link.href);
                      }
                    }}
                    className="text-foreground hover:text-text-secondary transition-colors text-xs font-normal tracking-widest uppercase"
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-text-secondary transition-colors text-xs font-normal tracking-widest uppercase"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            {/* Theme Switcher */}
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LocaleSwitcher />
            </div>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-foreground hover:text-accent transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <CartBadge />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:text-accent transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-border mt-4 pt-4 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                if (link.href.includes("#")) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        if (link.href.startsWith("/")) {
                          const [path, hash] = link.href.split("#");
                          const currentPath = window.location.pathname;
                          
                          // Check if we're on home page (root or locale root)
                          const isHome = currentPath === "/" || /^\/[a-z]{2}\/?$/.test(currentPath);
                          
                          // If path is "/" and we're on home page, just scroll
                          // Otherwise, only navigate if we're on a different page
                          if (path === "/" && isHome) {
                            smoothScrollToAnchor(link.href);
                          } else if (currentPath !== path && !isHome) {
                            window.location.href = link.href;
                            setTimeout(() => smoothScrollToAnchor(link.href), 100);
                          } else {
                            smoothScrollToAnchor(link.href);
                          }
                        } else {
                          smoothScrollToAnchor(link.href);
                        }
                      }}
                      className="text-foreground hover:text-text-secondary transition-colors text-xs font-normal tracking-widest uppercase py-2 px-1"
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-foreground hover:text-text-secondary transition-colors text-xs font-normal tracking-widest uppercase py-2 px-1"
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-border space-y-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs sm:text-sm text-text-secondary">{t("theme")}</span>
                  <ThemeSwitcher />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs sm:text-sm text-text-secondary">{t("language")}</span>
                  <LocaleSwitcher />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


