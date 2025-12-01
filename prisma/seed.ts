import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Generate slug from name
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

async function main() {
  console.log("🌱 Seeding database...");

  // Check if samosas already exist
  let samosas = await prisma.dish.findFirst({
    where: { nameEn: "Samosas" },
  });

  if (!samosas) {
    samosas = await prisma.dish.create({
      data: {
        name: "Samosas",
        nameEn: "Samosas",
        nameNl: "Samosas",
        nameFr: "Samoussas",
        slug: generateSlug("Samosas"),
        description: "Crispy triangular pastries filled with spiced potatoes and peas, served with mint chutney.",
        descriptionEn: "Crispy triangular pastries filled with spiced potatoes and peas, served with mint chutney.",
        descriptionNl: "Knapperige driehoekige pasteitjes gevuld met gekruide aardappelen en erwten, geserveerd met muntchutney.",
        descriptionFr: "Pâtisseries triangulaires croustillantes farcies de pommes de terre épicées et de pois, servies avec chutney à la menthe.",
        price: 8.50,
        rating: 4.7,
        allergens: ["Gluten", "Wheat"],
        ingredients: [
          "All-purpose flour",
          "Potatoes",
          "Green peas",
          "Cumin seeds",
          "Coriander powder",
          "Turmeric",
          "Garam masala",
          "Fresh mint",
          "Vegetable oil",
          "Salt",
        ],
        isActive: true,
      },
    });
    console.log("✅ Created samosas:", samosas.id);
  } else {
    console.log("ℹ️  Samosas already exist:", samosas.id);
  }

  // Check if spring rolls already exist
  let springRolls = await prisma.dish.findFirst({
    where: { nameEn: "Spring Rolls" },
  });

  if (!springRolls) {
    springRolls = await prisma.dish.create({
      data: {
        name: "Spring Rolls",
        nameEn: "Spring Rolls",
        nameNl: "Loempia's",
        nameFr: "Rouleaux de printemps",
        slug: generateSlug("Spring Rolls"),
        description: "Crispy golden spring rolls filled with fresh vegetables, served with sweet and sour dipping sauce.",
        descriptionEn: "Crispy golden spring rolls filled with fresh vegetables, served with sweet and sour dipping sauce.",
        descriptionNl: "Knapperige gouden loempia's gevuld met verse groenten, geserveerd met zoetzure dipsaus.",
        descriptionFr: "Rouleaux de printemps dorés et croustillants farcis de légumes frais, servis avec une sauce aigre-douce.",
        price: 7.50,
        rating: 4.5,
        allergens: ["Gluten", "Wheat", "Soy"],
        ingredients: [
          "Spring roll wrappers",
          "Cabbage",
          "Carrots",
          "Bean sprouts",
          "Mushrooms",
          "Spring onions",
          "Soy sauce",
          "Ginger",
          "Garlic",
          "Vegetable oil",
        ],
        isActive: true,
      },
    });
    console.log("✅ Created spring rolls:", springRolls.id);
  } else {
    console.log("ℹ️  Spring rolls already exist:", springRolls.id);
  }

  console.log("\n🎉 Database seeded successfully!");
  console.log(`   - ${samosas.nameEn} (€${samosas.price})`);
  console.log(`   - ${springRolls.nameEn} (€${springRolls.price})`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

