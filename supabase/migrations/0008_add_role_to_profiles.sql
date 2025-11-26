-- Add role column to profiles table
alter table public.profiles 
add column if not exists role text not null default 'user' check (role in ('user', 'admin'));

-- Policy: Admins can view all profiles
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
on public.profiles for select
using (
  auth.uid() in (
    select id from public.profiles where role = 'admin'
  )
);

-- Index for faster role lookups
create index if not exists idx_profiles_role on public.profiles (role);
