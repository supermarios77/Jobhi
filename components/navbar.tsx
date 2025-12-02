"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { CartBadge } from "./cart-badge";
import { useState } from "react";

export function Navbar() {
  const t = useTranslations("common");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/#menu", label: t("menu") },
    { href: "/order", label: t("order") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <nav className="border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95 dark:bg-background/90 transition-colors">
      <div className="container mx-auto px-8 py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-normal text-foreground hover:opacity-70 transition-opacity tracking-widest uppercase"
          >
            FreshBite
          </Link>

          {/* Desktop Navigation Links - Center */}
          <div className="hidden lg:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-text-secondary transition-colors text-xs font-normal tracking-widest uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4 lg:gap-6">
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
              className="relative text-foreground hover:text-text-secondary transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-4 h-4" />
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
          <div className="lg:hidden pb-6 border-t border-border mt-4 pt-6">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground hover:text-text-secondary transition-colors text-xs font-normal tracking-widest uppercase py-2"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{t("theme")}</span>
                  <ThemeSwitcher />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{t("language")}</span>
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

