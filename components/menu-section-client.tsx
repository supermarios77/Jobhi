"use client";

import { useState, useMemo } from "react";
import { MenuItemCard } from "@/components/menu-item-card";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Search, X, ArrowUpDown } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Dish {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price: number;
  pricingModel?: "FIXED" | "PER_PIECE";
  imageUrl?: string | null;
  rating: number;
  ingredients?: string[];
  allergens?: string[];
  createdAt?: Date | string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variants?: Array<{
    id: string;
    name: string;
    nameEn: string;
    nameNl: string;
    nameFr: string;
    imageUrl?: string | null;
    price?: number | null;
    isActive: boolean;
  }>;
}

type SortOption = "price-asc" | "price-desc" | "rating-desc" | "name-asc" | "name-desc" | "newest";

interface MenuSectionClientProps {
  dishes: Dish[];
  categories: Category[];
  locale: string;
}

export function MenuSectionClient({ dishes, categories }: MenuSectionClientProps) {
  const t = useTranslations("menu");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleCategoryChange = (categoryId: string | null) => {
    setIsTransitioning(true);
    setSelectedCategoryId(categoryId);
    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Filter and sort dishes
  const filteredAndSortedDishes = useMemo(() => {
    // First, filter by category
    let filtered = selectedCategoryId
      ? dishes.filter((dish) => dish.category?.id === selectedCategoryId)
      : dishes;

    // Then, apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((dish) => {
        // Search in name
        const nameMatch = dish.name.toLowerCase().includes(query);
        
        // Search in description
        const descriptionMatch = dish.description?.toLowerCase().includes(query) || false;
        
        // Search in ingredients
        const ingredientsMatch = dish.ingredients?.some((ingredient) =>
          ingredient.toLowerCase().includes(query)
        ) || false;
        
        // Search in category name
        const categoryMatch = dish.category?.name.toLowerCase().includes(query) || false;

        return nameMatch || descriptionMatch || ingredientsMatch || categoryMatch;
      });
    }

    // Finally, sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "newest":
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        default:
          return 0;
      }
    });

    return sorted;
  }, [dishes, selectedCategoryId, debouncedSearchQuery, sortOption]);

  return (
    <section id="menu" className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-foreground mb-3 tracking-widest uppercase">
              {t("title")}
            </h2>
            <p className="text-sm sm:text-base text-text-secondary tracking-wide max-w-2xl mx-auto">
              {t("itemsAvailable", { count: filteredAndSortedDishes.length })}
            </p>
          </div>

          {/* Enhanced Controls */}
          <div className="space-y-6">
            {/* Search and Sort - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-text-secondary group-focus-within:text-foreground transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-11 pr-11 py-3 border-2 border-border bg-background text-foreground placeholder:text-text-secondary focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 text-sm tracking-wide transition-all"
                  aria-label={t("searchPlaceholder")}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-foreground transition-colors"
                    aria-label={t("clearSearch")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="relative sm:w-52">
                <select
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="w-full pl-4 pr-10 py-3 border-2 border-border bg-background text-foreground text-sm tracking-wide focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 cursor-pointer appearance-none transition-all"
                  aria-label={t("sortBy")}
                >
                  <option value="newest">{t("sortNewest")}</option>
                  <option value="price-asc">{t("sortPriceAsc")}</option>
                  <option value="price-desc">{t("sortPriceDesc")}</option>
                  <option value="rating-desc">{t("sortRating")}</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ArrowUpDown className="h-4 w-4 text-text-secondary" />
                </div>
              </div>
            </div>

            {/* Category Filters - Dropdown on mobile, buttons on desktop */}
            <div className="max-w-5xl mx-auto">
              {/* Mobile: Dropdown */}
              <div className="lg:hidden relative">
                <select
                  value={selectedCategoryId || ""}
                  onChange={(e) => handleCategoryChange(e.target.value || null)}
                  className="w-full pl-4 pr-10 py-3 border-2 border-border bg-background text-foreground text-sm tracking-wide focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 cursor-pointer appearance-none transition-all"
                  aria-label={t("filter")}
                >
                  <option value="">{t("allCategories")}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Desktop: Button Group */}
              <div className="hidden lg:flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`px-5 py-2.5 text-xs tracking-widest uppercase transition-all duration-200 ${
                    selectedCategoryId === null
                      ? "bg-foreground text-background border-2 border-foreground shadow-sm"
                      : "bg-transparent text-text-secondary border-2 border-border hover:border-foreground/50 hover:text-foreground"
                  }`}
                >
                  {t("allCategories")}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-5 py-2.5 text-xs tracking-widest uppercase transition-all duration-200 ${
                      selectedCategoryId === category.id
                        ? "bg-foreground text-background border-2 border-foreground shadow-sm"
                        : "bg-transparent text-text-secondary border-2 border-border hover:border-foreground/50 hover:text-foreground"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        {filteredAndSortedDishes.length === 0 ? (
          <div className={`text-center py-20 sm:py-24 transition-opacity duration-300 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-text-secondary text-sm sm:text-base tracking-wide mb-2">
                {debouncedSearchQuery.trim()
                  ? t("noSearchResults", { query: debouncedSearchQuery })
                  : selectedCategoryId
                  ? t("noDishesInCategory")
                  : "No dishes available yet. Check back soon!"}
              </p>
              {debouncedSearchQuery.trim() && (
                <button
                  onClick={clearSearch}
                  className="mt-4 px-6 py-2.5 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all text-xs tracking-widest uppercase"
                >
                  {t("clearSearch")}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 transition-opacity duration-300 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
            {filteredAndSortedDishes.map((dish) => (
              <MenuItemCard
                key={dish.id}
                id={dish.id}
                slug={dish.slug}
                name={dish.name}
                price={dish.price}
                pricingModel={dish.pricingModel}
                imageSrc={dish.imageUrl || "/placeholder-dish.png"}
                imageAlt={dish.name}
                rating={dish.rating || 0}
                variants={dish.variants || []}
                category={dish.category}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

