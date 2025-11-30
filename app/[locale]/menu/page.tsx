import { MenuItemCard } from "@/components/menu-item-card";

// Mock data - will be replaced with Supabase integration later
const mockMeals = [
  {
    id: "1",
    name: "Grilled Salmon with Seasonal Vegetables",
    price: 18.99,
    imageSrc: undefined, // Will use placeholder
    rating: 4.5,
    isWishlisted: false,
  },
  {
    id: "2",
    name: "Beef Bourguignon with Mashed Potatoes",
    price: 22.50,
    imageSrc: undefined,
    rating: 4.8,
    isWishlisted: true,
  },
  {
    id: "3",
    name: "Mediterranean Quinoa Bowl",
    price: 15.99,
    imageSrc: undefined,
    rating: 4.2,
    isWishlisted: false,
  },
  {
    id: "4",
    name: "Chicken Tikka Masala with Basmati Rice",
    price: 17.99,
    imageSrc: undefined,
    rating: 4.7,
    isWishlisted: false,
  },
  {
    id: "5",
    name: "Vegetarian Lasagna",
    price: 16.50,
    imageSrc: undefined,
    rating: 4.4,
    isWishlisted: true,
  },
  {
    id: "6",
    name: "Thai Green Curry with Jasmine Rice",
    price: 19.99,
    imageSrc: undefined,
    rating: 4.6,
    isWishlisted: false,
  },
  {
    id: "7",
    name: "Mushroom Risotto",
    price: 16.99,
    imageSrc: undefined,
    rating: 4.3,
    isWishlisted: false,
  },
  {
    id: "8",
    name: "BBQ Pulled Pork with Coleslaw",
    price: 20.50,
    imageSrc: undefined,
    rating: 4.9,
    isWishlisted: false,
  },
  {
    id: "9",
    name: "Pasta Carbonara",
    price: 17.50,
    imageSrc: undefined,
    rating: 4.5,
    isWishlisted: true,
  },
];

export default function MenuPage() {
  const itemCount = mockMeals.length;

  const handleWishlistToggle = (id: string) => {
    // TODO: Integrate with Supabase to update wishlist
    console.log("Toggle wishlist for item:", id);
  };

  const handleOrderClick = (id: string) => {
    // TODO: Navigate to order page or add to cart
    console.log("Order item:", id);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 lg:py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 lg:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
              Menu
            </h1>
            <p className="text-base sm:text-lg text-text-secondary">
              {itemCount} {itemCount === 1 ? "item" : "items"} available
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg bg-accent text-foreground font-medium text-sm sm:text-base hover:bg-accent/90 transition-colors shadow-soft">
              Filter
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {mockMeals.map((meal) => (
            <MenuItemCard
              key={meal.id}
              id={meal.id}
              name={meal.name}
              price={meal.price}
              imageSrc={meal.imageSrc}
              imageAlt={meal.name}
              rating={meal.rating}
              isWishlisted={meal.isWishlisted}
              onWishlistToggle={handleWishlistToggle}
              onOrderClick={handleOrderClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

