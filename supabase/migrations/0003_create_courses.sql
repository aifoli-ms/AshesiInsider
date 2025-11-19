-- Courses and Reviews schema
create table if not exists public.courses (
  id bigserial primary key,
  code text not null,
  name text not null,
  instructor text,
  semester text,
  rating numeric not null default 0,
  reviews_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_reviews (
  id bigserial primary key,
  course_id bigint not null references public.courses(id) on delete cascade,
  user_id uuid default auth.uid() references public.profiles(id) on delete set null,
  author text,
  rating integer not null check (rating between 1 and 5),
  title text,
  content text,
  helpful integer not null default 0,
  created_at timestamptz not null default now()
);

-- updated_at trigger for courses
create or replace function public.set_courses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row execute function public.set_courses_updated_at();

-- Aggregate ratings maintenance
create or replace function public.recompute_course_aggregates()
returns trigger
language plpgsql
as $$
begin
  update public.courses c
  set
    reviews_count = sub.cnt,
    rating = coalesce(sub.avg_rating, 0)
  from (
    select course_id, count(*) as cnt, avg(rating)::numeric(10,2) as avg_rating
    from public.course_reviews
    where course_id = coalesce(new.course_id, old.course_id)
    group by course_id
  ) sub
  where c.id = sub.course_id;
  return null;
end;
$$;

drop trigger if exists trg_recompute_course_aggregates_ins on public.course_reviews;
drop trigger if exists trg_recompute_course_aggregates_upd on public.course_reviews;
drop trigger if exists trg_recompute_course_aggregates_del on public.course_reviews;
create trigger trg_recompute_course_aggregates_ins
after insert on public.course_reviews
for each row execute function public.recompute_course_aggregates();
create trigger trg_recompute_course_aggregates_upd
after update on public.course_reviews
for each row execute function public.recompute_course_aggregates();
create trigger trg_recompute_course_aggregates_del
after delete on public.course_reviews
for each row execute function public.recompute_course_aggregates();

-- RLS
alter table public.courses enable row level security;
alter table public.course_reviews enable row level security;

-- Read for everyone
drop policy if exists "Courses are readable by anyone" on public.courses;
create policy "Courses are readable by anyone"
on public.courses for select
using (true);

drop policy if exists "Reviews are readable by anyone" on public.course_reviews;
create policy "Reviews are readable by anyone"
on public.course_reviews for select
using (true);

-- Inserts/updates only if logged in (owner can update their own reviews)
drop policy if exists "Users can insert reviews" on public.course_reviews;
create policy "Users can insert reviews"
on public.course_reviews for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Users can update their reviews" on public.course_reviews;
create policy "Users can update their reviews"
on public.course_reviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


