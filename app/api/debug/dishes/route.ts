import { NextResponse } from "next/server";
import { getDishes } from "@/lib/db/dish";
import { prisma } from "@/lib/prisma";

// Use Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

export async function GET() {
  try {
    const locale = "en"; // Default locale for debug
    
    // Get dishes
    let dishesCount = 0;
    let error: string | null = null;
    let queryParams: any = null;
    
    try {
      const dishes = await getDishes({ isActive: true, locale });
      dishesCount = dishes.length;
      queryParams = { isActive: true, locale };
    } catch (err: any) {
      error = err.message || String(err);
      console.error("[Debug] Error fetching dishes:", err);
      
      // Try to get total dishes count
      try {
        const allDishes = await prisma.dish.findMany({ select: { id: true, isActive: true } });
        queryParams = {
          totalDishes: allDishes.length,
          activeDishes: allDishes.filter(d => d.isActive).length,
          error: error,
        };
      } catch (dbErr: any) {
        console.error("[Debug] Error querying database:", dbErr);
      }
    }
    
    // Check database URL type (without exposing the full URL)
    const databaseUrl = process.env.DATABASE_URL || null;
    const dbUrlType = databaseUrl
      ? databaseUrl.includes("pooler") 
        ? "pooler" 
        : databaseUrl.includes("supabase.co") 
        ? "direct-supabase" 
        : "other"
      : "not-set";
    
    return NextResponse.json({
      dishesCount,
      error,
      queryParams,
      databaseUrl: dbUrlType, // Only return type, not full URL
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        dishesCount: 0,
        error: error.message || "Unknown error",
        queryParams: null,
        databaseUrl: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

