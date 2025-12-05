/**
 * Domain types for Dish/Category entities
 */

export interface Meal {
  id: string;
  name: string;
  nameEn: string;
  nameNl: string;
  nameFr: string;
  description?: string;
  descriptionEn?: string;
  descriptionNl?: string;
  descriptionFr?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  nameNl: string;
  nameFr: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

