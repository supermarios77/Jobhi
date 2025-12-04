/**
 * Database seed script
 * 
 * Populates the database with initial data for development/testing
 * Run with: bun run db:seed
 */

import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

// Helper function to create or get category
async function getOrCreateCategory(
  nameEn: string,
  nameNl: string,
  nameFr: string,
  description?: string
) {
  const slug = generateSlug(nameEn);
  let category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: nameEn,
        nameEn,
        nameNl,
        nameFr,
        slug,
        description,
        isActive: true,
      },
    });
    console.log(`✅ Created category: ${nameEn}`);
  }

  return category;
}

// Helper function to create dish with variants
async function createDishWithVariants(
  categoryId: string | null,
  dishData: {
    nameEn: string;
    nameNl: string;
    nameFr: string;
    descriptionEn?: string;
    descriptionNl?: string;
    descriptionFr?: string;
    price: number;
    pricingModel?: "FIXED";
    quantity?: string;
    weight?: string;
    serves?: number; // Number of people this portion feeds
    allergens?: string[];
    ingredients?: string[];
    rating?: number;
  },
  variants?: Array<{
    nameEn: string;
    nameNl: string;
    nameFr: string;
    price?: number;
    sortOrder?: number;
  }>
) {
  const slug = generateSlug(dishData.nameEn);
  let dish = await prisma.dish.findUnique({
    where: { slug },
  });

  if (!dish) {
    dish = await prisma.dish.create({
      data: {
        name: dishData.nameEn,
        nameEn: dishData.nameEn,
        nameNl: dishData.nameNl,
        nameFr: dishData.nameFr,
        slug,
        description: dishData.descriptionEn,
        descriptionEn: dishData.descriptionEn,
        descriptionNl: dishData.descriptionNl,
        descriptionFr: dishData.descriptionFr,
        price: dishData.price,
        pricingModel: dishData.pricingModel || "FIXED",
        categoryId,
        rating: dishData.rating || 0,
        quantity: dishData.quantity || null,
        weight: dishData.weight || null,
        serves: dishData.serves || null,
        allergens: dishData.allergens || [],
        ingredients: dishData.ingredients || [],
        isActive: true,
        variants: variants
          ? {
              create: variants.map((variant, index) => ({
                name: variant.nameEn,
                nameEn: variant.nameEn,
                nameNl: variant.nameNl,
                nameFr: variant.nameFr,
                price: variant.price || null,
                sortOrder: variant.sortOrder ?? index,
                isActive: true,
              })),
            }
          : undefined,
      },
    });
    console.log(`✅ Created dish: ${dishData.nameEn}${variants ? ` (${variants.length} variants)` : ""}`);
  } else {
    console.log(`ℹ️  Dish already exists: ${dishData.nameEn}`);
  }

  return dish;
}

async function main() {
  console.log("🌱 Seeding database...\n");

  try {
    // Create categories
    const startersCategory = await getOrCreateCategory(
      "Starters",
      "Voorgerechten",
      "Entrées",
      "Delicious appetizers to start your meal"
    );

    const biryaniCategory = await getOrCreateCategory(
      "Biryani",
      "Biryani",
      "Biryani",
      "Aromatic rice dishes with meat or vegetables"
    );

    const pilauCategory = await getOrCreateCategory(
      "Pilau",
      "Pilau",
      "Pilau",
      "Fragrant rice dishes"
    );

    const curriesCategory = await getOrCreateCategory(
      "Curries",
      "Curry's",
      "Currys",
      "Rich and flavorful curry dishes"
    );

    const breadCategory = await getOrCreateCategory(
      "Bread",
      "Brood",
      "Pain",
      "Freshly baked bread"
    );

    const sidesCategory = await getOrCreateCategory(
      "Sides",
      "Bijgerechten",
      "Accompagnements",
      "Perfect accompaniments to your meal"
    );

    const dessertsCategory = await getOrCreateCategory(
      "Desserts",
      "Desserts",
      "Desserts",
      "Sweet treats to end your meal"
    );

    // STARTERS
    console.log("\n📦 Creating Starters...");
    
    await createDishWithVariants(startersCategory.id, {
        nameEn: "Spring Rolls",
        nameNl: "Loempia's",
        nameFr: "Rouleaux de printemps",
        descriptionEn: "Crispy golden spring rolls filled with fresh vegetables, served with sweet and sour dipping sauce.",
        descriptionNl: "Knapperige gouden loempia's gevuld met verse groenten, geserveerd met zoetzure dipsaus.",
        descriptionFr: "Rouleaux de printemps dorés et croustillants farcis de légumes frais, servis avec une sauce aigre-douce.",
        price: 1.50,
      quantity: "1 portion",
      weight: "50g",
      serves: 1,
      allergens: ["Gluten", "Wheat", "Soy"],
      rating: 4.5,
    });

    await createDishWithVariants(startersCategory.id, {
      nameEn: "Samosas",
      nameNl: "Samosas",
      nameFr: "Samoussas",
      descriptionEn: "Crispy triangular pastries filled with spiced filling, served with mint chutney.",
      descriptionNl: "Knapperige driehoekige pasteitjes gevuld met gekruide vulling, geserveerd met muntchutney.",
      descriptionFr: "Pâtisseries triangulaires croustillantes farcies de garniture épicée, servies avec chutney à la menthe.",
      price: 8.50,
      quantity: "6 pieces",
      weight: "300g",
      serves: 2,
      allergens: ["Gluten", "Wheat"],
      rating: 4.7,
    }, [
      { nameEn: "Aloo", nameNl: "Aloo", nameFr: "Aloo", sortOrder: 0 },
      { nameEn: "Chicken", nameNl: "Kip", nameFr: "Poulet", sortOrder: 1 },
      { nameEn: "Mince", nameNl: "Gehakt", nameFr: "Viande hachée", sortOrder: 2 },
    ]);

    await createDishWithVariants(startersCategory.id, {
      nameEn: "Patties",
      nameNl: "Pasteitjes",
      nameFr: "Pâtés",
      descriptionEn: "Flaky pastry filled with delicious spiced filling.",
      descriptionNl: "Bladerdeeg pasteitjes gevuld met heerlijke gekruide vulling.",
      descriptionFr: "Pâtisseries feuilletées farcies de garniture épicée délicieuse.",
      price: 2.50,
      quantity: "1 portion",
      weight: "80g",
      serves: 1,
      allergens: ["Gluten", "Wheat", "Dairy"],
      rating: 4.6,
    }, [
      { nameEn: "Cheese", nameNl: "Kaas", nameFr: "Fromage", sortOrder: 0 },
      { nameEn: "Chicken", nameNl: "Kip", nameFr: "Poulet", sortOrder: 1 },
    ]);

    await createDishWithVariants(startersCategory.id, {
      nameEn: "Kebab",
      nameNl: "Kebab",
      nameFr: "Kebab",
      descriptionEn: "Tender, spiced meat kebabs grilled to perfection.",
      descriptionNl: "Malse, gekruide vleeskebabs perfect gegrild.",
      descriptionFr: "Kebabs de viande tendre et épicée grillés à la perfection.",
      price: 6.00,
      quantity: "1 portion",
      weight: "100g",
      serves: 1,
      allergens: [],
      rating: 4.8,
    }, [
      { nameEn: "Shami", nameNl: "Shami", nameFr: "Shami", sortOrder: 0 },
      { nameEn: "Chapli", nameNl: "Chapli", nameFr: "Chapli", sortOrder: 1 },
      { nameEn: "Seekh", nameNl: "Seekh", nameFr: "Seekh", sortOrder: 2 },
    ]);

    await createDishWithVariants(startersCategory.id, {
      nameEn: "Aloo Tikki",
      nameNl: "Aloo Tikki",
      nameFr: "Aloo Tikki",
      descriptionEn: "Crispy potato patties spiced with aromatic herbs and served with chutney.",
      descriptionNl: "Knapperige aardappel pasteitjes gekruid met aromatische kruiden en geserveerd met chutney.",
      descriptionFr: "Galettes de pommes de terre croustillantes épicées aux herbes aromatiques, servies avec chutney.",
      price: 5.00,
      quantity: "4 pieces",
      weight: "200g",
      serves: 2,
      allergens: ["Gluten"],
      rating: 4.5,
    });

    await createDishWithVariants(startersCategory.id, {
      nameEn: "Chicken Malai Tikka",
      nameNl: "Kip Malai Tikka",
      nameFr: "Tikka Malai au Poulet",
      descriptionEn: "Tender chicken pieces marinated in creamy malai and grilled to perfection.",
      descriptionNl: "Malse kipstukjes gemarineerd in romige malai en perfect gegrild.",
      descriptionFr: "Morceaux de poulet tendres marinés dans du malai crémeux et grillés à la perfection.",
      price: 9.00,
      quantity: "6 pieces",
      weight: "250g",
      serves: 2,
      allergens: ["Dairy"],
      rating: 4.9,
    });

    await createDishWithVariants(startersCategory.id, {
      nameEn: "Chicken Roast",
      nameNl: "Geroosterde Kip",
      nameFr: "Poulet Rôti",
      descriptionEn: "Succulent roasted chicken with aromatic spices.",
      descriptionNl: "Malse geroosterde kip met aromatische kruiden.",
      descriptionFr: "Poulet rôti succulent aux épices aromatiques.",
      price: 12.00,
      quantity: "1 portion",
      weight: "300g",
      serves: 2,
      allergens: [],
      rating: 4.7,
    });

    // BIRYANI
    console.log("\n🍚 Creating Biryani...");

    await createDishWithVariants(biryaniCategory.id, {
      nameEn: "Chicken Biryani",
      nameNl: "Kip Biryani",
      nameFr: "Biryani au Poulet",
      descriptionEn: "Fragrant basmati rice cooked with tender chicken, aromatic spices, and herbs.",
      descriptionNl: "Geurige basmatirijst gekookt met malse kip, aromatische kruiden en specerijen.",
      descriptionFr: "Riz basmati parfumé cuit avec du poulet tendre, épices aromatiques et herbes.",
      price: 14.00,
      quantity: "1 portion",
      weight: "500g",
      serves: 3,
      allergens: [],
      rating: 4.8,
    });

    await createDishWithVariants(biryaniCategory.id, {
      nameEn: "Vegetable Biryani",
      nameNl: "Groente Biryani",
      nameFr: "Biryani aux Légumes",
      descriptionEn: "Aromatic basmati rice cooked with fresh vegetables and spices.",
      descriptionNl: "Geurige basmatirijst gekookt met verse groenten en specerijen.",
      descriptionFr: "Riz basmati parfumé cuit avec des légumes frais et des épices.",
      price: 12.00,
      quantity: "1 portion",
      weight: "500g",
      serves: 3,
      allergens: [],
      rating: 4.6,
    });

    await createDishWithVariants(biryaniCategory.id, {
      nameEn: "Keema Biryani",
      nameNl: "Gehakt Biryani",
      nameFr: "Biryani au Hachis",
      descriptionEn: "Fragrant rice cooked with spiced minced meat and aromatic spices.",
      descriptionNl: "Geurige rijst gekookt met gekruid gehakt en aromatische specerijen.",
      descriptionFr: "Riz parfumé cuit avec de la viande hachée épicée et des épices aromatiques.",
      price: 15.00,
      quantity: "1 portion",
      weight: "500g",
      serves: 3,
      allergens: [],
      rating: 4.7,
    });

    await createDishWithVariants(biryaniCategory.id, {
      nameEn: "Mutton Biryani",
      nameNl: "Lamsvlees Biryani",
      nameFr: "Biryani au Mouton",
      descriptionEn: "Traditional biryani with tender mutton, basmati rice, and rich spices.",
      descriptionNl: "Traditionele biryani met mals lamsvlees, basmatirijst en rijke specerijen.",
      descriptionFr: "Biryani traditionnel avec du mouton tendre, riz basmati et épices riches.",
      price: 16.00,
      quantity: "1 portion",
      weight: "500g",
      serves: 3,
      allergens: [],
      rating: 4.9,
    });

    // PILAU
    console.log("\n🍛 Creating Pilau...");

    await createDishWithVariants(pilauCategory.id, {
      nameEn: "Chicken Pilau",
      nameNl: "Kip Pilau",
      nameFr: "Pilau au Poulet",
      descriptionEn: "Fragrant rice cooked with chicken and aromatic spices.",
      descriptionNl: "Geurige rijst gekookt met kip en aromatische specerijen.",
      descriptionFr: "Riz parfumé cuit avec du poulet et des épices aromatiques.",
      price: 11.00,
      quantity: "1 portion",
      weight: "450g",
      serves: 2,
      allergens: [],
      rating: 4.6,
    });

    await createDishWithVariants(pilauCategory.id, {
      nameEn: "Mutton Pilau",
      nameNl: "Lamsvlees Pilau",
      nameFr: "Pilau au Mouton",
      descriptionEn: "Aromatic rice cooked with tender mutton and spices.",
      descriptionNl: "Aromatische rijst gekookt met mals lamsvlees en specerijen.",
      descriptionFr: "Riz aromatique cuit avec du mouton tendre et des épices.",
      price: 13.00,
      quantity: "1 portion",
      weight: "450g",
      serves: 2,
      allergens: [],
      rating: 4.7,
    });

    await createDishWithVariants(pilauCategory.id, {
      nameEn: "Channa Pilau",
      nameNl: "Kikkererwten Pilau",
      nameFr: "Pilau aux Pois Chiches",
      descriptionEn: "Fragrant rice cooked with chickpeas and aromatic spices.",
      descriptionNl: "Geurige rijst gekookt met kikkererwten en aromatische specerijen.",
      descriptionFr: "Riz parfumé cuit avec des pois chiches et des épices aromatiques.",
      price: 10.00,
      quantity: "1 portion",
      weight: "450g",
      serves: 2,
      allergens: [],
      rating: 4.5,
    });

    await createDishWithVariants(pilauCategory.id, {
      nameEn: "Mixed Vegetable Pilau",
      nameNl: "Gemengde Groente Pilau",
      nameFr: "Pilau aux Légumes Mixtes",
      descriptionEn: "Aromatic rice cooked with mixed vegetables and spices.",
      descriptionNl: "Aromatische rijst gekookt met gemengde groenten en specerijen.",
      descriptionFr: "Riz aromatique cuit avec des légumes mélangés et des épices.",
      price: 9.50,
      quantity: "1 portion",
      weight: "450g",
      serves: 2,
      allergens: [],
      rating: 4.4,
    });

    // CURRIES
    console.log("\n🍲 Creating Curries...");

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Chicken Karahi",
      nameNl: "Kip Karahi",
      nameFr: "Karahi au Poulet",
      descriptionEn: "Spicy chicken curry cooked in a traditional karahi with tomatoes and green chilies.",
      descriptionNl: "Pittige kipcurry gekookt in een traditionele karahi met tomaten en groene pepers.",
      descriptionFr: "Curry de poulet épicé cuit dans un karahi traditionnel avec tomates et piments verts.",
      price: 13.00,
      quantity: "1 portion",
      weight: "400g",
      serves: 2,
      allergens: [],
      rating: 4.8,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Mutton Karahi",
      nameNl: "Lamsvlees Karahi",
      nameFr: "Karahi au Mouton",
      descriptionEn: "Rich mutton curry cooked in a traditional karahi with aromatic spices.",
      descriptionNl: "Rijke lamsvleescurry gekookt in een traditionele karahi met aromatische specerijen.",
      descriptionFr: "Curry de mouton riche cuit dans un karahi traditionnel avec des épices aromatiques.",
      price: 15.00,
      quantity: "1 portion",
      weight: "400g",
      serves: 2,
      allergens: [],
      rating: 4.9,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Chicken Qorma",
      nameNl: "Kip Qorma",
      nameFr: "Qorma au Poulet",
      descriptionEn: "Creamy chicken curry with yogurt, cream, and aromatic spices.",
      descriptionNl: "Romige kipcurry met yoghurt, room en aromatische specerijen.",
      descriptionFr: "Curry de poulet crémeux avec yaourt, crème et épices aromatiques.",
      price: 13.50,
      quantity: "1 portion",
      weight: "400g",
      serves: 2,
      allergens: ["Dairy"],
      rating: 4.7,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Mutton Qorma",
      nameNl: "Lamsvlees Qorma",
      nameFr: "Qorma au Mouton",
      descriptionEn: "Rich and creamy mutton curry with yogurt and aromatic spices.",
      descriptionNl: "Rijke en romige lamsvleescurry met yoghurt en aromatische specerijen.",
      descriptionFr: "Curry de mouton riche et crémeux avec yaourt et épices aromatiques.",
      price: 15.50,
      quantity: "1 portion",
      weight: "400g",
      serves: 2,
      allergens: ["Dairy"],
      rating: 4.8,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Payee",
      nameNl: "Payee",
      nameFr: "Payee",
      descriptionEn: "Tender trotters curry cooked with rich spices and herbs.",
      descriptionNl: "Malse trotters curry gekookt met rijke specerijen en kruiden.",
      descriptionFr: "Curry de trotters tendres cuit avec des épices riches et des herbes.",
      price: 14.00,
      quantity: "1 portion",
      weight: "400g",
      serves: 2,
      allergens: [],
      rating: 4.6,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Nihari",
      nameNl: "Nihari",
      nameFr: "Nihari",
      descriptionEn: "Slow-cooked meat curry with rich, aromatic spices, traditionally served for breakfast.",
      descriptionNl: "Langzaam gekookte vleescurry met rijke, aromatische specerijen, traditioneel geserveerd als ontbijt.",
      descriptionFr: "Curry de viande mijotée avec des épices riches et aromatiques, traditionnellement servi au petit-déjeuner.",
      price: 14.50,
      quantity: "1 portion",
      weight: "400g",
      serves: 2,
      allergens: [],
      rating: 4.9,
    }, [
      { nameEn: "Chicken", nameNl: "Kip", nameFr: "Poulet", sortOrder: 0 },
      { nameEn: "Beef", nameNl: "Rundvlees", nameFr: "Bœuf", sortOrder: 1 },
    ]);

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Karele Gosht",
      nameNl: "Karele Gosht",
      nameFr: "Karele Gosht",
      descriptionEn: "Bitter gourd cooked with meat in a spicy curry.",
      descriptionNl: "Bittere pompoen gekookt met vlees in een pittige curry.",
      descriptionFr: "Courge amère cuite avec de la viande dans un curry épicé.",
      price: 13.00,
      quantity: "1 portion",
      weight: "400g",
      serves: 2,
      allergens: [],
      rating: 4.5,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Mixed Vegetable",
      nameNl: "Gemengde Groente",
      nameFr: "Légumes Mixtes",
      descriptionEn: "Assorted vegetables cooked in a flavorful curry sauce.",
      descriptionNl: "Gevarieerde groenten gekookt in een smaakvolle currysaus.",
      descriptionFr: "Légumes assortis cuits dans une sauce curry savoureuse.",
      price: 10.00,
      quantity: "1 portion",
      weight: "400g",
      serves: 2,
      allergens: [],
      rating: 4.4,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Bhindi",
      nameNl: "Okra",
      nameFr: "Gombo",
      descriptionEn: "Okra cooked with onions, tomatoes, and aromatic spices.",
      descriptionNl: "Okra gekookt met uien, tomaten en aromatische specerijen.",
      descriptionFr: "Gombo cuit avec oignons, tomates et épices aromatiques.",
      price: 9.50,
      quantity: "1 portion",
      weight: "350g",
      serves: 2,
      allergens: [],
      rating: 4.5,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Daal",
      nameNl: "Linzen",
      nameFr: "Lentilles",
      descriptionEn: "Traditional lentil curry cooked with spices and herbs.",
      descriptionNl: "Traditionele linzencurry gekookt met specerijen en kruiden.",
      descriptionFr: "Curry de lentilles traditionnel cuit avec des épices et des herbes.",
      price: 8.00,
      quantity: "1 portion",
      weight: "350g",
      serves: 2,
      allergens: [],
      rating: 4.6,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Lahori Chanay",
      nameNl: "Lahori Kikkererwten",
      nameFr: "Pois Chiches Lahori",
      descriptionEn: "Chickpeas cooked in a spicy Lahori-style curry.",
      descriptionNl: "Kikkererwten gekookt in een pittige Lahori-stijl curry.",
      descriptionFr: "Pois chiches cuits dans un curry épicé style Lahori.",
      price: 9.00,
      quantity: "1 portion",
      weight: "350g",
      serves: 2,
      allergens: [],
      rating: 4.7,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Daal Makhni",
      nameNl: "Linzen Makhni",
      nameFr: "Lentilles Makhni",
      descriptionEn: "Creamy black lentils cooked with butter, cream, and spices.",
      descriptionNl: "Romige zwarte linzen gekookt met boter, room en specerijen.",
      descriptionFr: "Lentilles noires crémeuses cuites avec beurre, crème et épices.",
      price: 9.50,
      quantity: "1 portion",
      weight: "350g",
      serves: 2,
      allergens: ["Dairy"],
      rating: 4.8,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Rajma",
      nameNl: "Kidneybonen",
      nameFr: "Haricots Rouges",
      descriptionEn: "Kidney beans cooked in a rich, spicy curry.",
      descriptionNl: "Kidneybonen gekookt in een rijke, pittige curry.",
      descriptionFr: "Haricots rouges cuits dans un curry riche et épicé.",
      price: 9.00,
      quantity: "1 portion",
      weight: "350g",
      serves: 2,
      allergens: [],
      rating: 4.6,
    });

    await createDishWithVariants(curriesCategory.id, {
      nameEn: "Daal Maash",
      nameNl: "Urad Linzen",
      nameFr: "Lentilles Urad",
      descriptionEn: "Black gram lentils cooked with spices and herbs.",
      descriptionNl: "Zwarte gram linzen gekookt met specerijen en kruiden.",
      descriptionFr: "Lentilles de gram noir cuites avec des épices et des herbes.",
      price: 8.50,
      quantity: "1 portion",
      weight: "350g",
      serves: 2,
      allergens: [],
        rating: 4.5,
    });

    // BREAD
    console.log("\n🍞 Creating Bread...");

    await createDishWithVariants(breadCategory.id, {
      nameEn: "Roti",
      nameNl: "Roti",
      nameFr: "Roti",
      descriptionEn: "Fresh, soft whole wheat flatbread.",
      descriptionNl: "Vers, zacht volkoren platbrood.",
      descriptionFr: "Pain plat de blé entier frais et moelleux.",
      price: 1.00,
      quantity: "1 portion",
        weight: "50g",
      serves: 1,
      allergens: ["Gluten", "Wheat"],
      rating: 4.5,
    });

    await createDishWithVariants(breadCategory.id, {
      nameEn: "Naan",
      nameNl: "Naan",
      nameFr: "Naan",
      descriptionEn: "Soft, fluffy leavened flatbread baked in a tandoor.",
      descriptionNl: "Zacht, luchtig gezuurd platbrood gebakken in een tandoor.",
      descriptionFr: "Pain plat levé moelleux et duveteux cuit dans un tandoor.",
      price: 2.00,
      quantity: "1 portion",
      weight: "80g",
      serves: 1,
      allergens: ["Gluten", "Wheat"],
      rating: 4.7,
    });

    // SIDES
    console.log("\n🥗 Creating Sides...");

    await createDishWithVariants(sidesCategory.id, {
      nameEn: "Raita",
      nameNl: "Raita",
      nameFr: "Raita",
      descriptionEn: "Cooling yogurt dip with vegetables, perfect to balance spicy dishes.",
      descriptionNl: "Verkoelende yoghurtdip met groenten, perfect om pittige gerechten in evenwicht te brengen.",
      descriptionFr: "Trempette de yaourt rafraîchissante aux légumes, parfaite pour équilibrer les plats épicés.",
      price: 3.00,
      quantity: "1 portion",
      weight: "200g",
      serves: 2,
      allergens: ["Dairy"],
      rating: 4.6,
    }, [
      { nameEn: "Baingan", nameNl: "Aubergine", nameFr: "Aubergine", sortOrder: 0 },
      { nameEn: "Cucumber", nameNl: "Komkommer", nameFr: "Concombre", sortOrder: 1 },
      { nameEn: "Mint", nameNl: "Munt", nameFr: "Menthe", sortOrder: 2 },
    ]);

    await createDishWithVariants(sidesCategory.id, {
      nameEn: "Chutney",
      nameNl: "Chutney",
      nameFr: "Chutney",
      descriptionEn: "Flavorful condiment made from fruits, vegetables, and spices.",
      descriptionNl: "Smaakvolle condiment gemaakt van fruit, groenten en specerijen.",
      descriptionFr: "Condiment savoureux à base de fruits, légumes et épices.",
      price: 2.50,
      quantity: "1 portion",
      weight: "100g",
      serves: 2,
      allergens: [],
      rating: 4.5,
    }, [
      { nameEn: "Green", nameNl: "Groen", nameFr: "Vert", sortOrder: 0 },
      { nameEn: "Red", nameNl: "Rood", nameFr: "Rouge", sortOrder: 1 },
      { nameEn: "Imli", nameNl: "Tamarinde", nameFr: "Tamarinde", sortOrder: 2 },
    ]);

    // DESSERTS
    console.log("\n🍰 Creating Desserts...");

    await createDishWithVariants(dessertsCategory.id, {
      nameEn: "Gajjar Ka Halwa",
      nameNl: "Wortel Halwa",
      nameFr: "Halwa aux Carottes",
      descriptionEn: "Sweet carrot pudding cooked with milk, sugar, and cardamom, garnished with nuts.",
      descriptionNl: "Zoete wortelpudding gekookt met melk, suiker en kardemom, gegarneerd met noten.",
      descriptionFr: "Pudding sucré aux carottes cuit avec du lait, du sucre et de la cardamome, garni de noix.",
      price: 6.00,
      quantity: "1 portion",
      weight: "200g",
      serves: 2,
      allergens: ["Dairy", "Nuts"],
      rating: 4.8,
    });

    await createDishWithVariants(dessertsCategory.id, {
      nameEn: "Gajrela",
      nameNl: "Gajrela",
      nameFr: "Gajrela",
      descriptionEn: "Traditional carrot dessert with condensed milk and nuts.",
      descriptionNl: "Traditioneel worteldessert met gecondenseerde melk en noten.",
      descriptionFr: "Dessert traditionnel aux carottes avec lait condensé et noix.",
      price: 6.50,
      quantity: "1 portion",
      weight: "200g",
      serves: 2,
      allergens: ["Dairy", "Nuts"],
      rating: 4.7,
    });

    await createDishWithVariants(dessertsCategory.id, {
      nameEn: "Zafrani Kheer",
      nameNl: "Zafrani Kheer",
      nameFr: "Kheer au Safran",
      descriptionEn: "Creamy rice pudding flavored with saffron and cardamom, garnished with nuts.",
      descriptionNl: "Romige rijstpudding op smaak gebracht met saffraan en kardemom, gegarneerd met noten.",
      descriptionFr: "Pudding de riz crémeux parfumé au safran et à la cardamome, garni de noix.",
      price: 5.50,
      quantity: "1 portion",
      weight: "200g",
      serves: 2,
      allergens: ["Dairy", "Nuts"],
      rating: 4.8,
    });

    await createDishWithVariants(dessertsCategory.id, {
      nameEn: "Shahi Tukray",
      nameNl: "Shahi Tukray",
      nameFr: "Shahi Tukray",
      descriptionEn: "Rich bread pudding soaked in sweetened milk, garnished with nuts and saffron.",
      descriptionNl: "Rijke broodpudding gedrenkt in gezoete melk, gegarneerd met noten en saffraan.",
      descriptionFr: "Pudding de pain riche trempé dans du lait sucré, garni de noix et de safran.",
      price: 6.00,
      quantity: "1 portion",
      weight: "200g",
      serves: 2,
      allergens: ["Gluten", "Wheat", "Dairy", "Nuts"],
      rating: 4.9,
    });

    await createDishWithVariants(dessertsCategory.id, {
      nameEn: "Rasmalai",
      nameNl: "Rasmalai",
      nameFr: "Rasmalai",
      descriptionEn: "Soft cheese dumplings soaked in sweetened, flavored milk.",
      descriptionNl: "Zachte kaasbolletjes gedrenkt in gezoete, gearomatiseerde melk.",
      descriptionFr: "Boulettes de fromage moelleuses trempées dans du lait sucré et parfumé.",
      price: 6.50,
      quantity: "1 portion",
      weight: "200g",
      serves: 2,
      allergens: ["Dairy", "Nuts"],
      rating: 4.9,
    });

    console.log("\n🎉 Database seeded successfully!");
    console.log("   All menu items have been added to the database.\n");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error seeding database:", errorMessage);
    if (error instanceof Error && error.stack && process.env.NODE_ENV === "development") {
      console.error(error.stack);
    }
    throw error;
  }
}

main()
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Fatal error seeding database:", errorMessage);
    if (error instanceof Error && error.stack && process.env.NODE_ENV === "development") {
      console.error(error.stack);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
