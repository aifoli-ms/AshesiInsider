# Ashesi Insider

Student-built discovery platform for Ashesi University that curates honest reviews about courses, lecturers, restaurants, and hostels. The app is powered by Next.js 16 (App Router) on the frontend, a Supabase-managed Postgres database, and lightweight Edge-friendly API routes for authentication and session handling.

## Highlights

- 🧭 **Single-page navigation** with deep-linked sections for courses, restaurants, lecturers, and hostels plus responsive mobile navigation.
- 🔐 **Supabase-backed auth** flow that signs up/logs in users via RPC functions, stores HttpOnly JWT cookies, and guards protected sections client-side.
- ⭐ **Rich review UI** made with ShadCN/Radix primitives, reusable ratings and card components, and theme-aware Tailwind styling.
- 📦 **Seeded data** for courses, hostels, lecturers, and restaurants via SQL migrations under `supabase/migrations`.
- 🧰 **Full TypeScript tooling** (tsconfig, ESLint, Tailwind 4) and pnpm workspace lockfile for deterministic installs.

## Tech Stack

- Next.js 16 (App Router, client components)
- React 19, TypeScript, Tailwind CSS 4, Radix UI, Lucide icons
- Supabase (Postgres, RPCs `register_user` and `verify_user`)
- JWT sessions signed server-side
- pnpm (preferred) / npm scripts

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Set up environment variables**

   Create `.env.local` (Next.js) and add the variables below. Values shown are placeholders:

   | Variable | Description |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (also used server-side here) |
   | `JWT_SECRET` | Secret for signing session cookies (fallbacks to `dev-secret` in dev) |

3. **Run database locally (optional)**

   ```bash
   # using Supabase CLI
   supabase start              # boots local stack
   supabase db reset           # applies migrations & seeds
   ```

   Migrations live in `supabase/migrations`. Files such as `0003_seed_courses.sql` and `0004_seed_hostels.sql` populate the mock catalog data that the UI renders.

4. **Start the dev server**

   ```bash
   pnpm dev
   ```

   Open `http://localhost:3000` to view the app. Protected sections (courses, restaurants, lecturers, hostels) will prompt for sign-in if no valid session cookie is present.

## Available Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Start Next.js in development mode |
| `pnpm build` | Create an optimized production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint against the project |

## Project Structure

```
AshesiInsider/
├── app/                 # Next.js App Router entrypoints & API routes
│   ├── page.tsx         # Client shell controlling navigation and auth gating
│   └── api/auth/*       # login, logout, signup, session routes
├── components/
│   ├── navigation.tsx   # Responsive top nav bar
│   ├── sign-in-modal.tsx
│   ├── pages/           # Home, Courses, Restaurants, Lecturers, Hostels UIs
│   └── ui/              # ShadCN-style primitives (button, dialog, etc.)
├── lib/
│   ├── supabaseClient.ts
│   ├── supabaseServer.ts
│   └── session.ts       # JWT helpers + cookie config
├── supabase/migrations/ # SQL schema + seed data
├── public/              # Icons, placeholder imagery
└── package.json
```

## Authentication Flow

1. Users register or log in via `/api/auth/signup` and `/api/auth/login`.
2. Each route calls Supabase RPC functions (`register_user`, `verify_user`) which hash/check passwords inside Postgres using `pgcrypto`.
3. A short-lived JWT is signed in `lib/session.ts` and stored in an HttpOnly `session` cookie (`ONE_WEEK_SECONDS` max age).
4. Client-side navigation consults `/api/auth/session` to decide when to gate access or prompt the `SignInModal`.

## Supabase Notes

- The repo expects the RPC functions mentioned above; ensure they exist in your Supabase SQL or extend the migrations to include them.
- Additional tables for courses, restaurants, hostels, and lecturers are created and seeded by migrations `0003`–`0006`.
- If you deploy elsewhere, set `secure: true` cookies by running behind HTTPS (Next.js handles this automatically on Vercel).

## Contributing

1. Fork + clone the repo.
2. Create a feature branch.
3. Run `pnpm lint && pnpm build` before opening a PR.
4. Describe UI or schema changes in the PR template and attach screenshots when relevant.

## Troubleshooting

- **Missing Supabase client** – verify the public URL/key environment variables are set; the app intentionally treats them as nullable to avoid breaking the dev server.
- **Auth RPC errors** – ensure the SQL functions `register_user` and `verify_user` were deployed (see Supabase dashboard > SQL editor).
- **Seed data not appearing** – rerun `supabase db reset` or execute the seed scripts manually in the Supabase SQL editor.

---

Know more. Choose better. 🎓


