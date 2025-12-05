# Architecture Documentation

## Overview

Jobhi is a modern meal ordering platform built with Next.js 16, featuring multi-language support, Supabase authentication, and Stripe payments.

## Project Structure

```
jobhi/
├── app/                      # Next.js App Router pages and API routes
│   ├── [locale]/            # Localized routes (en, nl, fr)
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Checkout flow
│   │   ├── menu/            # Menu browsing
│   │   └── order/           # Order management
│   └── api/                 # API routes
│       ├── admin/           # Admin API endpoints
│       ├── cart/            # Cart API
│       └── stripe/          # Stripe webhooks
│
├── components/              # React components
│   ├── features/           # Feature-specific components
│   │   ├── admin/         # Admin components
│   │   ├── cart/          # Cart & checkout components
│   │   └── menu/          # Menu-related components
│   ├── layout/            # Layout components (navbar, footer, etc.)
│   ├── shared/            # Shared/common components
│   └── ui/                # Reusable UI primitives
│
├── config/                 # Configuration files
│   ├── i18n/              # Internationalization config
│   └── proxy.ts            # Next.js proxy (request interceptor)
│
├── database/               # Database-related files
│   ├── migrations/        # SQL migration files
│   └── scripts/           # Database utility scripts
│
├── lib/                    # Core libraries and utilities
│   ├── auth/              # Authentication utilities
│   ├── db/                 # Database query functions
│   ├── email/             # Email utilities
│   ├── hooks/              # Custom React hooks
│   ├── supabase/          # Supabase client configurations
│   └── utils/             # General utilities
│
├── messages/               # Translation files (i18n)
│   ├── en.json
│   ├── nl.json
│   └── fr.json
│
├── prisma/                 # Prisma ORM
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
│
├── scripts/                # Utility scripts
│   ├── database/          # Database migration/setup scripts
│   ├── setup/             # Initial setup scripts
│   └── utils/             # Utility scripts
│
├── types/                  # TypeScript type definitions
│   ├── domain/            # Domain-specific types
│   │   ├── dish.ts        # Dish/Category types
│   │   ├── order.ts       # Order types
│   │   └── user.ts        # User types
│   └── i18n.ts            # Internationalization types
│
└── public/                 # Static assets
```

## Key Technologies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Prisma** - ORM for database access
- **Supabase** - Database, authentication, and storage
- **Stripe** - Payment processing
- **next-intl** - Internationalization
- **TailwindCSS** - Styling

## Architecture Patterns

### 1. Feature-Based Component Organization

Components are organized by feature domain:
- `components/features/menu/` - Menu browsing and display
- `components/features/cart/` - Shopping cart functionality
- `components/features/admin/` - Admin dashboard components

### 2. Domain-Driven Types

Type definitions are organized by domain:
- `types/domain/dish.ts` - Dish and category types
- `types/domain/order.ts` - Order and order item types
- `types/domain/user.ts` - User and authentication types

### 3. Layered API Structure

API routes follow RESTful conventions:
- `/api/admin/*` - Admin-only endpoints
- `/api/cart/*` - Cart management
- `/api/stripe/*` - Payment processing

### 4. Configuration Management

All configuration is centralized:
- `config/i18n/` - Internationalization settings
- `config/proxy.ts` - Security headers and request routing

## Database Schema

The application uses Prisma ORM with the following main models:

- **User** - User accounts with roles (CUSTOMER, ADMIN)
- **Category** - Menu categories
- **Dish** - Menu items with multi-language support
- **DishVariant** - Variants for dishes (e.g., different sizes)
- **Order** - Customer orders
- **OrderItem** - Items within orders

## Authentication & Authorization

- **Supabase Auth** - Handles user authentication
- **Role-Based Access Control** - Users have CUSTOMER or ADMIN roles
- **Row Level Security (RLS)** - Database-level security policies

## Internationalization

The app supports three languages:
- English (`/en`)
- Dutch (`/nl`)
- French (`/fr`)

All user-facing text is stored in `messages/*.json` files and accessed via `next-intl`.

## Environment Variables

See `.env.example` for required environment variables:
- Supabase configuration
- Stripe API keys
- Database connection string
- Application URL

## Development Workflow

1. **Database Changes**: Update `prisma/schema.prisma`, then run migrations
2. **New Features**: Create components in appropriate `components/features/` directory
3. **API Endpoints**: Add routes in `app/api/`
4. **Types**: Add domain types in `types/domain/`
5. **Translations**: Update `messages/*.json` files

## Scripts

- `bun run dev` - Start development server
- `bun run db:seed` - Seed database with initial data
- `bun run db:migrate` - Run database migrations
- `bun run setup:admin` - Create admin user
- `bun run setup:rls` - Set up Row Level Security policies

## Best Practices

1. **Type Safety**: Always use TypeScript types, avoid `any`
2. **Component Organization**: Group by feature, not by type
3. **API Routes**: Keep server-side logic in API routes, not in components
4. **Error Handling**: Use custom error classes from `lib/errors.ts`
5. **Logging**: Use the logger from `lib/logger.ts`
6. **Environment Variables**: Validate with `lib/env.ts`

