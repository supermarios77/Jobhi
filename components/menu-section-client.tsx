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
    <section id="menu" className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-normal text-foreground mb-2 tracking-widest uppercase">
                {t("title")}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary tracking-wide">
                {t("itemsAvailable", { count: filteredAndSortedDishes.length })}
              </p>
            </div>
          </div>

          {/* Controls Section - Clean and organized */}
          <div className="space-y-6">
            {/* Search and Sort Row - One line on desktop */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search Bar */}
              <div className="flex-1 w-full sm:max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-text-secondary" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full pl-10 pr-10 py-3 border-2 border-foreground bg-background text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-foreground text-sm sm:text-base tracking-wide"
                    aria-label={t("searchPlaceholder")}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-foreground transition-colors"
                      aria-label={t("clearSearch")}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {/* Search Results Message */}
                {debouncedSearchQuery.trim() && (
                  <p className="mt-2 text-xs text-text-secondary tracking-wide">
                    {t("searchResults", { 
                      count: filteredAndSortedDishes.length, 
                      query: debouncedSearchQuery 
                    })}
                  </p>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3 sm:shrink-0">
                <label htmlFor="sort-select" className="text-xs sm:text-sm text-text-secondary tracking-wide uppercase whitespace-nowrap hidden sm:block">
                  {t("sortBy")}
                </label>
                <div className="relative">
                  <select
                    id="sort-select"
                    value={sortOption}
                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                    className="appearance-none pl-4 pr-10 py-3 border-2 border-foreground bg-background text-foreground text-xs sm:text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-foreground cursor-pointer min-w-[180px] sm:min-w-[200px]"
                    aria-label={t("sortBy")}
                  >
                    <option value="newest">{t("sortNewest")}</option>
                    <option value="price-asc">{t("sortPriceAsc")}</option>
                    <option value="price-desc">{t("sortPriceDesc")}</option>
                    <option value="rating-desc">{t("sortRating")}</option>
                    <option value="name-asc">{t("sortNameAsc")}</option>
                    <option value="name-desc">{t("sortNameDesc")}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ArrowUpDown className="h-4 w-4 text-text-secondary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter Buttons - Clean row */}
            <div className="border-t border-border pt-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-text-secondary tracking-wide uppercase mr-1 hidden sm:inline">
                  {t("filter")}:
                </span>
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`px-4 py-2.5 border-2 font-normal text-xs tracking-widest uppercase transition-all duration-200 ${
                    selectedCategoryId === null
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  {t("allCategories")}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-4 py-2.5 border-2 font-normal text-xs tracking-widest uppercase transition-all duration-200 ${
                      selectedCategoryId === category.id
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-background"
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
          <div className={`text-center py-12 sm:py-16 lg:py-20 transition-opacity duration-300 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
            <p className="text-text-secondary text-sm sm:text-base tracking-wide">
              {debouncedSearchQuery.trim()
                ? t("noSearchResults", { query: debouncedSearchQuery })
                : selectedCategoryId
                ? t("noDishesInCategory")
                : "No dishes available yet. Check back soon!"}
            </p>
            {debouncedSearchQuery.trim() && (
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all text-xs tracking-widest uppercase"
              >
                {t("clearSearch")}
              </button>
            )}
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 transition-opacity duration-300 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
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

