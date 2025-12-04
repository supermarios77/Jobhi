-- Add serves column to dishes table
-- Run this in Supabase SQL Editor if Prisma migrations fail

ALTER TABLE "dishes" 
ADD COLUMN IF NOT EXISTS "serves" INTEGER;

