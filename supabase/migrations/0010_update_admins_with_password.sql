-- Enable pgcrypto extension for password hashing
create extension if not exists pgcrypto;

-- Alter admins table
-- 1. Drop the foreign key constraint to auth.users (since admins are now standalone)
alter table public.admins drop constraint if exists admins_id_fkey;

-- 2. Add password_hash column
alter table public.admins add column if not exists password_hash text;

-- 3. Make id a default uuid if not provided (optional, but good for standalone inserts)
alter table public.admins alter column id set default gen_random_uuid();

-- 4. Update RLS policies
-- We need to ensure public can still read for login check (already done in 0009)
-- But we might want to restrict reading password_hash? 
-- Supabase doesn't support column-level RLS easily for select.
-- However, our login route runs on server (using supabaseServer), so it can bypass RLS if using service role, 
-- OR if using anon key, it relies on the "Public can view admins" policy.
-- If we allow public to view admins, they can see password hashes! This is bad.
-- We should RESTRICT public access to admins table, and rely on a secure RPC or Service Role for login.
-- Since `supabaseServer` in `lib/supabaseServer.ts` uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`, it behaves as anon.
-- We MUST NOT expose password hashes to anon.

-- Solution:
-- 1. Create a secure RPC function `verify_admin` similar to `verify_user`.
-- 2. Revoke public access to `admins` table.

-- Let's create the RPC function.
create or replace function public.verify_admin(
  _email text,
  _password text
)
returns table (
  id uuid,
  email text
)
security definer
as $$
begin
  return query
  select a.id, a.email
  from public.admins a
  where a.email = _email
  and a.password_hash = crypt(_password, a.password_hash);
end;
$$ language plpgsql;

-- Now secure the table
-- Drop the public view policy created in 0009
drop policy if exists "Public can view admins" on public.admins;

-- Ensure only admins can view/manage admins (using session auth)
-- But wait, if I am an admin logged in, I have role='admin' in my JWT?
-- My session logic puts `role: 'admin'` in the JWT claims.
-- But Supabase Auth (GoTrue) doesn't know about my custom `role` claim unless I use custom claims and RLS involves them.
-- Standard RLS uses `auth.uid()`.
-- If I am logged in as an admin, my `auth.uid()` matches my ID in `admins` table.
-- So `auth.uid() in (select id from public.admins)` works for self-access.
-- To allow admins to view ALL admins:
-- `auth.uid() in (select id from public.admins)` checks if *current user* is an admin.
-- Yes, that works.

-- So we just need to drop the "Public can view admins" policy to secure it.
-- And use `verify_admin` RPC for login.

-- RPC to create a new admin with hashed password
create or replace function public.create_admin(
  _email text,
  _password text
)
returns void
security definer
as $$
begin
  insert into public.admins (email, password_hash)
  values (_email, crypt(_password, gen_salt('bf')));
end;
$$ language plpgsql;
