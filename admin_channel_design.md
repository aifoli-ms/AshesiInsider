# Admin Channel Design Document

## Overview
The Admin Channel will be a centralized dashboard for administrators to manage the application's content (Restaurants, Hostels, Courses) and users. It will be secured so that only users with an `admin` role can access it.

## 1. Database Schema Changes
To distinguish between regular users and admins, we need to update the `profiles` table.

### Migration Plan
- **Add `role` column to `profiles` table.**
  - Type: `text` or `enum` ('user', 'admin', 'moderator').
  - Default: `'user'`.
  - Security: Update RLS policies to ensure only admins can update roles.

```sql
-- Example Migration
alter table public.profiles 
add column role text not null default 'user' check (role in ('user', 'admin'));

-- Policy: Only admins can view all profiles (optional, depending on privacy)
create policy "Admins can view all profiles"
on public.profiles for select
using (auth.uid() in (select id from public.profiles where role = 'admin'));
```

## 2. Authentication & Authorization
We need to protect the admin routes and API endpoints.

### Middleware
- Create a Next.js Middleware or a utility function `requireAdmin` that checks the user's session and role before rendering the page or processing an API request.
- If a non-admin user attempts to access `/admin`, they should be redirected to `/` or shown a 403 Forbidden page.

## 3. Frontend Architecture
The admin section will live under the `/admin` route.

### Route Structure
- `/admin`: Dashboard Overview (Stats, recent activity).
- `/admin/users`: User management (list, ban, promote).
- `/admin/restaurants`: Manage restaurants (add, edit, delete).
- `/admin/hostels`: Manage hostels.
- `/admin/courses`: Manage courses.

### Layout
- **Sidebar**: Persistent navigation on the left.
- **Header**: User profile and logout.
- **Content Area**: The main view for the selected category.

### UI Components
- **Stats Cards**: Show total users, total restaurants, etc.
- **Data Tables**: Sortable and filterable tables for listing content.
- **Forms**: Modals or pages for creating/editing content.

## 4. API Endpoints
Secure API routes are needed to perform admin actions.

- `GET /api/admin/stats`: Fetch dashboard statistics.
- `GET /api/admin/users`: List all users.
- `PATCH /api/admin/users/:id`: Update user role or status.
- `POST /api/restaurants`: Create a new restaurant (already likely exists, but ensure admin-only for creation).
- `DELETE /api/restaurants/:id`: Delete a restaurant.

## 5. Implementation Steps
1.  **Database**: Create migration to add `role` column.
2.  **Seed**: Manually update your own user to 'admin' in Supabase dashboard.
3.  **Auth**: Implement `useAdmin` hook or server-side check.
4.  **Layout**: Build `AdminLayout` component.
5.  **Pages**: Build the Dashboard and Management pages.
