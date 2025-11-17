-- Restaurants and Reviews schema
create table if not exists public.restaurants (
  id bigserial primary key,
  name text not null,
  location text,
  cuisine text,
  hours text,
  rating numeric not null default 0,
  reviews_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_reviews (
  id bigserial primary key,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
  user_id uuid default auth.uid() references public.profiles(id) on delete set null,
  author text,
  rating integer not null check (rating between 1 and 5),
  title text,
  content text,
  helpful integer not null default 0,
  created_at timestamptz not null default now()
);

-- updated_at trigger for restaurants
create or replace function public.set_restaurants_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_restaurants_updated_at on public.restaurants;
create trigger set_restaurants_updated_at
before update on public.restaurants
for each row execute function public.set_restaurants_updated_at();

-- Aggregate ratings maintenance for restaurants
create or replace function public.recompute_restaurant_aggregates()
returns trigger
language plpgsql
as $$
begin
  update public.restaurants r
  set
    reviews_count = sub.cnt,
    rating = coalesce(sub.avg_rating, 0)
  from (
    select restaurant_id, count(*) as cnt, avg(rating)::numeric(10,2) as avg_rating
    from public.restaurant_reviews
    where restaurant_id = coalesce(new.restaurant_id, old.restaurant_id)
    group by restaurant_id
  ) sub
  where r.id = sub.restaurant_id;
  return null;
end;
$$;

drop trigger if exists trg_recompute_restaurant_aggregates_ins on public.restaurant_reviews;
drop trigger if exists trg_recompute_restaurant_aggregates_upd on public.restaurant_reviews;
drop trigger if exists trg_recompute_restaurant_aggregates_del on public.restaurant_reviews;
create trigger trg_recompute_restaurant_aggregates_ins
after insert on public.restaurant_reviews
for each row execute function public.recompute_restaurant_aggregates();
create trigger trg_recompute_restaurant_aggregates_upd
after update on public.restaurant_reviews
for each row execute function public.recompute_restaurant_aggregates();
create trigger trg_recompute_restaurant_aggregates_del
after delete on public.restaurant_reviews
for each row execute function public.recompute_restaurant_aggregates();

-- RLS
alter table public.restaurants enable row level security;
alter table public.restaurant_reviews enable row level security;

-- Read for everyone
drop policy if exists "Restaurants are readable by anyone" on public.restaurants;
create policy "Restaurants are readable by anyone"
on public.restaurants for select using (true);

drop policy if exists "Restaurant reviews are readable by anyone" on public.restaurant_reviews;
create policy "Restaurant reviews are readable by anyone"
on public.restaurant_reviews for select using (true);

-- Inserts/updates only if logged in (owner can update their own reviews)
drop policy if exists "Users can insert restaurant reviews" on public.restaurant_reviews;
create policy "Users can insert restaurant reviews"
on public.restaurant_reviews for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Users can update their restaurant reviews" on public.restaurant_reviews;
create policy "Users can update their restaurant reviews"
on public.restaurant_reviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


