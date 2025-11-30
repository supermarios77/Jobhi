"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ShoppingCart, User } from "lucide-react";
import { LocaleSwitcher } from "./locale-switcher";
import { useState } from "react";

export function Navbar() {
  const t = useTranslations("common");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/order", label: "Order" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl lg:text-3xl font-bold text-foreground hover:opacity-80 transition-opacity"
          >
            FreshBite
          </Link>

          {/* Desktop Navigation Links - Center */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-accent transition-colors text-base font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4 lg:gap-6">
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
              <ShoppingCart className="w-6 h-6" />
              {/* Cart badge - optional, can be dynamic */}
              {/* <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full text-xs flex items-center justify-center text-foreground">
                0
              </span> */}
            </Link>

            {/* Sign In Button */}
            <Link
              href="/sign-in"
              className="px-6 py-2.5 rounded-lg text-base font-medium text-foreground bg-white border border-border hover:bg-accent hover:border-accent transition-all duration-200 hidden sm:inline-flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Sign In
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
                  className="text-foreground hover:text-accent transition-colors text-base font-medium py-2"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Language</span>
                  <LocaleSwitcher />
                </div>
              </div>
              <Link
                href="/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-6 py-2.5 rounded-lg text-base font-medium text-foreground bg-white border border-border hover:bg-accent hover:border-accent transition-all duration-200 inline-flex items-center justify-center gap-2 mt-2"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

