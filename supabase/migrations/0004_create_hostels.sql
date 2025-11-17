-- Hostels and Reviews schema
create table if not exists public.hostels (
  id bigserial primary key,
  name text not null,
  location text,
  price_range text, -- e.g. "₵₵", "₵₵₵"
  rating numeric not null default 0,
  reviews_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hostel_reviews (
  id bigserial primary key,
  hostel_id bigint not null references public.hostels(id) on delete cascade,
  user_id uuid default auth.uid() references public.profiles(id) on delete set null,
  author text,
  rating integer not null check (rating between 1 and 5),
  title text,
  content text,
  helpful integer not null default 0,
  created_at timestamptz not null default now()
);

-- updated_at trigger for hostels
create or replace function public.set_hostels_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_hostels_updated_at on public.hostels;
create trigger set_hostels_updated_at
before update on public.hostels
for each row execute function public.set_hostels_updated_at();

-- Aggregate ratings maintenance for hostels
create or replace function public.recompute_hostel_aggregates()
returns trigger
language plpgsql
as $$
begin
  update public.hostels h
  set
    reviews_count = sub.cnt,
    rating = coalesce(sub.avg_rating, 0)
  from (
    select hostel_id, count(*) as cnt, avg(rating)::numeric(10,2) as avg_rating
    from public.hostel_reviews
    where hostel_id = coalesce(new.hostel_id, old.hostel_id)
    group by hostel_id
  ) sub
  where h.id = sub.hostel_id;
  return null;
end;
$$;

drop trigger if exists trg_recompute_hostel_aggregates_ins on public.hostel_reviews;
drop trigger if exists trg_recompute_hostel_aggregates_upd on public.hostel_reviews;
drop trigger if exists trg_recompute_hostel_aggregates_del on public.hostel_reviews;
create trigger trg_recompute_hostel_aggregates_ins
after insert on public.hostel_reviews
for each row execute function public.recompute_hostel_aggregates();
create trigger trg_recompute_hostel_aggregates_upd
after update on public.hostel_reviews
for each row execute function public.recompute_hostel_aggregates();
create trigger trg_recompute_hostel_aggregates_del
after delete on public.hostel_reviews
for each row execute function public.recompute_hostel_aggregates();

-- RLS
alter table public.hostels enable row level security;
alter table public.hostel_reviews enable row level security;

-- Read for everyone
drop policy if exists "Hostels are readable by anyone" on public.hostels;
create policy "Hostels are readable by anyone"
on public.hostels for select
using (true);

drop policy if exists "Hostel reviews are readable by anyone" on public.hostel_reviews;
create policy "Hostel reviews are readable by anyone"
on public.hostel_reviews for select
using (true);

-- Inserts/updates only if logged in (owner can update their own reviews)
drop policy if exists "Users can insert hostel reviews" on public.hostel_reviews;
create policy "Users can insert hostel reviews"
on public.hostel_reviews for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Users can update their hostel reviews" on public.hostel_reviews;
create policy "Users can update their hostel reviews"
on public.hostel_reviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


