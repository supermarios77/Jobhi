import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updatePricingModels() {
  console.log("🔄 Updating pricing models for existing dishes...");

  try {
    // Update Spring Rolls to PER_PIECE (assuming it's the per-piece dish)
    const springRolls = await prisma.dish.findFirst({
      where: { nameEn: "Spring Rolls" },
    });

    if (springRolls) {
      await prisma.dish.update({
        where: { id: springRolls.id },
        data: { pricingModel: "PER_PIECE" },
      });
      console.log("✅ Updated Spring Rolls to PER_PIECE");
    } else {
      console.log("ℹ️  Spring Rolls not found");
    }

    // Update Samosas to FIXED (assuming it's the fixed price dish)
    const samosas = await prisma.dish.findFirst({
      where: { nameEn: "Samosas" },
    });

    if (samosas) {
      await prisma.dish.update({
        where: { id: samosas.id },
        data: { pricingModel: "FIXED" },
      });
      console.log("✅ Updated Samosas to FIXED");
    } else {
      console.log("ℹ️  Samosas not found");
    }

    // Update all other dishes to FIXED if they don't have pricingModel set
    // Note: Prisma doesn't allow null in enum where clauses, so we need to find dishes differently
    const allDishes = await prisma.dish.findMany({
      select: { id: true, pricingModel: true },
    });
    
    const dishesToUpdate = allDishes.filter(d => d.pricingModel === null);
    
    if (dishesToUpdate.length > 0) {
      // Update each dish individually since we can't use null in updateMany for enums
      for (const dish of dishesToUpdate) {
        await prisma.dish.update({
          where: { id: dish.id },
          data: { pricingModel: "FIXED" },
        });
      }
      console.log(`✅ Updated ${dishesToUpdate.length} dishes to FIXED (default)`);
    } else {
      console.log("ℹ️  No dishes with null pricingModel found");
    }
    console.log("\n🎉 Pricing models updated successfully!");
  } catch (error) {
    console.error("❌ Error updating pricing models:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePricingModels()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  });

