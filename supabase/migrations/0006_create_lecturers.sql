-- Lecturers and Reviews schema
create table if not exists public.lecturers (
  id bigserial primary key,
  name text not null,
  department text,
  courses text,
  rating numeric not null default 0,
  reviews_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lecturer_reviews (
  id bigserial primary key,
  lecturer_id bigint not null references public.lecturers(id) on delete cascade,
  user_id uuid default auth.uid() references public.profiles(id) on delete set null,
  author text,
  rating integer not null check (rating between 1 and 5),
  title text,
  content text,
  helpful integer not null default 0,
  created_at timestamptz not null default now()
);

-- updated_at trigger for lecturers
create or replace function public.set_lecturers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_lecturers_updated_at on public.lecturers;
create trigger set_lecturers_updated_at
before update on public.lecturers
for each row execute function public.set_lecturers_updated_at();

-- Aggregate ratings maintenance for lecturers
create or replace function public.recompute_lecturer_aggregates()
returns trigger
language plpgsql
as $$
begin
  update public.lecturers l
  set
    reviews_count = sub.cnt,
    rating = coalesce(sub.avg_rating, 0)
  from (
    select lecturer_id, count(*) as cnt, avg(rating)::numeric(10,2) as avg_rating
    from public.lecturer_reviews
    where lecturer_id = coalesce(new.lecturer_id, old.lecturer_id)
    group by lecturer_id
  ) sub
  where l.id = sub.lecturer_id;
  return null;
end;
$$;

drop trigger if exists trg_recompute_lecturer_aggregates_ins on public.lecturer_reviews;
drop trigger if exists trg_recompute_lecturer_aggregates_upd on public.lecturer_reviews;
drop trigger if exists trg_recompute_lecturer_aggregates_del on public.lecturer_reviews;
create trigger trg_recompute_lecturer_aggregates_ins
after insert on public.lecturer_reviews
for each row execute function public.recompute_lecturer_aggregates();
create trigger trg_recompute_lecturer_aggregates_upd
after update on public.lecturer_reviews
for each row execute function public.recompute_lecturer_aggregates();
create trigger trg_recompute_lecturer_aggregates_del
after delete on public.lecturer_reviews
for each row execute function public.recompute_lecturer_aggregates();

-- RLS
alter table public.lecturers enable row level security;
alter table public.lecturer_reviews enable row level security;

-- Read for everyone
drop policy if exists "Lecturers are readable by anyone" on public.lecturers;
create policy "Lecturers are readable by anyone"
on public.lecturers for select using (true);

drop policy if exists "Lecturer reviews are readable by anyone" on public.lecturer_reviews;
create policy "Lecturer reviews are readable by anyone"
on public.lecturer_reviews for select using (true);

-- Inserts/updates only if logged in (owner can update their own reviews)
drop policy if exists "Users can insert lecturer reviews" on public.lecturer_reviews;
create policy "Users can insert lecturer reviews"
on public.lecturer_reviews for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Users can update their lecturer reviews" on public.lecturer_reviews;
create policy "Users can update their lecturer reviews"
on public.lecturer_reviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


