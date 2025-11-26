-- Fix RLS policies to allow anonymous inserts for reviews
-- This is necessary because the app uses custom auth and the Supabase client is anonymous

-- Course Reviews
drop policy if exists "Users can insert reviews" on public.course_reviews;
create policy "Allow anonymous inserts for course reviews"
on public.course_reviews for insert
with check (true);

-- Restaurant Reviews
drop policy if exists "Users can insert restaurant reviews" on public.restaurant_reviews;
create policy "Allow anonymous inserts for restaurant reviews"
on public.restaurant_reviews for insert
with check (true);

-- Lecturer Reviews
drop policy if exists "Users can insert lecturer reviews" on public.lecturer_reviews;
create policy "Allow anonymous inserts for lecturer reviews"
on public.lecturer_reviews for insert
with check (true);

-- Hostel Reviews
drop policy if exists "Users can insert hostel reviews" on public.hostel_reviews;
create policy "Allow anonymous inserts for hostel reviews"
on public.hostel_reviews for insert
with check (true);
