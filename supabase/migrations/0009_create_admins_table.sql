-- Create admins table
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admins enable row level security;

-- Allow public read for login check (since we use anon key in backend)
create policy "Public can view admins"
on public.admins for select
using (true);

-- Admins can insert new admins
create policy "Admins can insert admins"
on public.admins for insert
with check (
  auth.uid() in (select id from public.admins)
);

-- Admins can delete admins
create policy "Admins can delete admins"
on public.admins for delete
using (
  auth.uid() in (select id from public.admins)
);

-- Allow public read for login check (or use service role in backend)
-- Actually, for login route we use supabaseServer which might use service role or anon.
-- If anon, we need a policy to allow reading if we want to check existence.
-- But usually we don't want to expose the admin list to public.
-- The login route runs on server, so we can use service role if configured, 
-- OR we can just allow the user to read their own record? 
-- No, the login route checks if *that* user is an admin.
-- If the login route uses `supabaseServer` which is initialized with `SUPABASE_SERVICE_ROLE_KEY` (if available) or just anon key.
-- Let's check `lib/supabaseServer.ts`.
