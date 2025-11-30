# FreshBite

A modern frozen-meal ordering platform with multi-language support (English, Dutch, French) for the Belgian market.

## Tech Stack

- **Next.js 16** (App Router)
- **TailwindCSS** with custom design system
- **Shadcn UI** (light usage)
- **Supabase** (Database + Authentication)
- **Prisma ORM** (with Supabase Postgres)
- **Stripe** (Payments)
- **next-intl** (Internationalization)
- **Bun** (Package manager)

## Design System

- Pure white backgrounds (`#FFFFFF`)
- Soft yellow accent color (`#F9D97F`)
- Rounded corners: 12-20px
- Ultra-light shadows: `rgba(0,0,0,0.04)`
- Generous spacing and airy layouts
- Food photos as main visual anchor

## Getting Started

### Prerequisites

- Bun installed ([getbun.sh](https://bun.sh))
- Supabase account
- Stripe account

### Installation

1. Clone the repository and install dependencies:

```bash
bun install
```

2. Set up environment variables:

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `DATABASE_URL` - Your Supabase Postgres connection string
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `NEXT_PUBLIC_APP_URL` - Your app URL (e.g., `http://localhost:3000`)

3. Set up the database:

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Or run migrations
bun run db:migrate
```

4. Run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── admin/         # Admin panel
│   │   └── page.tsx       # Home page
│   ├── globals.css        # Global styles
│   └── layout.tsx          # Root layout
├── components/
│   └── ui/                # Shadcn UI components
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── stripe.ts          # Stripe client
│   ├── supabase/          # Supabase clients (client/server)
│   └── utils.ts           # Utility functions
├── messages/              # Translation files
│   ├── en.json
│   ├── nl.json
│   └── fr.json
├── prisma/
│   └── schema.prisma      # Database schema
├── i18n.ts                # i18n configuration
└── middleware.ts          # Next.js middleware for i18n
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run db:generate` - Generate Prisma client
- `bun run db:push` - Push schema changes to database
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Prisma Studio

## Internationalization

The app supports three languages:
- English (`/en`)
- Dutch (`/nl`)
- French (`/fr`)

Translation files are located in the `messages/` directory. Add new translations by updating the JSON files.

## Database Schema

The Prisma schema includes:
- `User` - User accounts
- `Meal` - Frozen meal products
- `Order` - Customer orders
- `OrderItem` - Items in each order

## Features

- ✅ Multi-language support (EN, NL, FR)
- ✅ Supabase authentication
- ✅ Stripe payment integration
- ✅ Admin panel structure
- ✅ Image optimization
- ✅ Responsive design
- ✅ Clean, scalable architecture

## License

Private project
