-- Create dish_variants table
-- This table stores variant options for dishes (e.g., "Aloo", "Chicken", "Mince")
-- Run this SQL in Supabase SQL Editor if Prisma migrations fail due to connection pooler

-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS "dish_variants" (
  "id" TEXT NOT NULL,
  "dishId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameNl" TEXT NOT NULL,
  "nameFr" TEXT NOT NULL,
  "imageUrl" TEXT,
  "price" DOUBLE PRECISION,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "dish_variants_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create index on dishId for faster lookups
CREATE INDEX IF NOT EXISTS "dish_variants_dishId_idx" ON "dish_variants"("dishId");

-- Step 3: Add foreign key constraint (run only if constraint doesn't exist)
-- Check first: SELECT conname FROM pg_constraint WHERE conname = 'dish_variants_dishId_fkey';
-- If it doesn't exist, run:
ALTER TABLE "dish_variants" 
ADD CONSTRAINT "dish_variants_dishId_fkey" 
FOREIGN KEY ("dishId") 
REFERENCES "dishes"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

