/**
 * Type definitions for the Jobhi application
 * 
 * This file serves as a barrel export for all types.
 * Import types from their specific domain files for better organization.
 */

// Domain types
export type { Meal, Category } from "./domain/dish";
export type { Order, OrderItem, OrderStatus } from "./domain/order";
export type { User, UserRole } from "./domain/user";

// I18n types
export type { Locale } from "./i18n";
