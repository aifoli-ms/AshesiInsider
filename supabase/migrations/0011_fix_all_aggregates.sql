-- Recalculate aggregates for courses
update public.courses c
set
  reviews_count = sub.cnt,
  rating = coalesce(sub.avg_rating, 0)
from (
  select course_id, count(*) as cnt, avg(rating)::numeric(10,2) as avg_rating
  from public.course_reviews
  group by course_id
) sub
where c.id = sub.course_id;

-- Recalculate aggregates for hostels
update public.hostels h
set
  reviews_count = sub.cnt,
  rating = coalesce(sub.avg_rating, 0)
from (
  select hostel_id, count(*) as cnt, avg(rating)::numeric(10,2) as avg_rating
  from public.hostel_reviews
  group by hostel_id
) sub
where h.id = sub.hostel_id;

-- Recalculate aggregates for restaurants
update public.restaurants r
set
  reviews_count = sub.cnt,
  rating = coalesce(sub.avg_rating, 0)
from (
  select restaurant_id, count(*) as cnt, avg(rating)::numeric(10,2) as avg_rating
  from public.restaurant_reviews
  group by restaurant_id
) sub
where r.id = sub.restaurant_id;

-- Recalculate aggregates for lecturers
update public.lecturers l
set
  reviews_count = sub.cnt,
  rating = coalesce(sub.avg_rating, 0)
from (
  select lecturer_id, count(*) as cnt, avg(rating)::numeric(10,2) as avg_rating
  from public.lecturer_reviews
  group by lecturer_id
) sub
where l.id = sub.lecturer_id;
