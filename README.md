# Ashesi Insider

A student-built platform for Ashesi University where students share honest reviews about courses, lecturers, restaurants, and hostels.

## The Problem

At Ashesi, if you don't know the right people, it's difficult to find out:
- Which lecturers to choose (and which to avoid)
- Which courses are actually worth taking
- Which restaurants have good food (and what to order)
- Which hostels give you the best value

Ashesi Insider fixes this by giving students a place to share real experiences and help each other make better decisions.

## Features

**Course Reviews** - Search and filter courses by rating. Read what students say about workload, teaching quality, and assessments.

**Lecturer Reviews** - Honest feedback on teaching styles, clarity, and helpfulness.

**Restaurant Reviews** - Find the best food on and around campus. See locations, hours, and what's actually good.

**Hostel Reviews** - Compare housing options before you commit. Learn about facilities, management, and value.

**Admin Dashboard** - Manage users, moderate reviews, and view platform stats.

## Highlights

- **Single-page navigation** with deep-linked sections for courses, restaurants, lecturers, and hostels plus responsive mobile navigation.
- **Supabase-backed auth** flow that signs up/logs in users via RPC functions, stores HttpOnly JWT cookies, and guards protected sections client-side.
- **Rich review UI** made with ShadCN/Radix primitives, reusable ratings and card components, and theme-aware Tailwind styling.
- **Seeded data** for courses, hostels, lecturers, and restaurants via SQL migrations under `supabase/migrations`.
- **Full TypeScript tooling** (tsconfig, ESLint, Tailwind 4) and pnpm workspace lockfile for deterministic installs.

## Tech Stack

- Next.js 16 (App Router, client components)
- React 19, TypeScript, Tailwind CSS 4, Radix UI, Lucide icons
- Supabase (Postgres, RPCs `register_user` and `verify_user`)
- JWT sessions signed server-side
- pnpm (preferred) / npm scripts


## Getting Started

### Prerequisites
- Node.js 18+
- pnpm or npm
- Supabase account

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/divin081/AshesiInsider.git
   cd AshesiInsider
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. Create `.env.local` with your Supabase credentials
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   JWT_SECRET=your_jwt_secret
   ```

4. Set up the database

   Run the migrations in `supabase/migrations/` in order, or use:
   ```bash
   supabase start
   supabase db reset
   ```

5. Start the dev server
   ```bash
   pnpm dev
   ```

6. Open `http://localhost:3000` to view the app. Protected sections (courses, restaurants, lecturers, hostels) will prompt for sign-in if no valid session cookie is present.


## Project Structure

```
app/
  page.tsx              # Main app shell
  api/auth/             # Login, signup, logout, session endpoints
  api/admin/            # Admin-only endpoints
  admin/                # Admin dashboard page

components/
  pages/                # Course, lecturer, restaurant, hostel pages
  ui/                   # Reusable UI components
  navigation.tsx        # Top navbar
  sign-in-modal.tsx     # Login modal
  sign-up-modal.tsx     # Registration modal

lib/
  supabaseClient.ts     # Browser database client
  supabaseServer.ts     # Server database client
  session.ts            # JWT utilities
  validation.ts         # Input validation

supabase/migrations/    # Database schema and seed data
```

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run production |
| `pnpm lint` | Run linter |

## Database

The app uses four main entity types, each with their own reviews table:
- courses + course_reviews
- lecturers + lecturer_reviews  
- restaurants + restaurant_reviews
- hostels + hostel_reviews

Ratings are automatically aggregated using PostgreSQL triggers whenever a review is added, updated, or deleted.

## Authentication

- Users register with email and password
- Passwords must be 8+ characters with uppercase, lowercase, number, and special character
- Sessions use JWT stored in HttpOnly cookies (1 week expiry)
- Protected pages require authentication

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run `pnpm lint && pnpm build` before committing
4. Open a PR with a clear description

## Troubleshooting

**Can't connect to Supabase** - Check your .env.local values. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly. The app treats these as nullable to avoid breaking the dev server.

**Auth RPC errors** - Make sure the register_user and verify_user SQL functions exist in Supabase (check Dashboard > SQL editor).

**No data showing** - Run supabase db reset or execute the seed SQL files manually in the Supabase SQL editor.

---

Built by Ashesi students for Ashesi students.
