-- Seed initial restaurants
insert into public.restaurants (id, name, location, cuisine, hours)
values
  (1, 'The Chill Spot', 'Campus Gate', 'Ghanaian & Continental', '7am - 10pm'),
  (2, 'Campus Café', 'Student Center', 'Coffee & Pastries', '6am - 8pm'),
  (3, 'Grillhouse Express', 'Main Street', 'Grilled Meats', '11am - 11pm')
on conflict (id) do nothing;

-- Seed restaurant reviews
insert into public.restaurant_reviews (restaurant_id, author, rating, title, content, helpful, created_at)
values
  (1, 'Abigail Aboagye', 5, 'Best jollof on campus!', 'Their jollof rice is absolutely incredible. Great service, fair prices, and the atmosphere is perfect for hanging with friends.', 42, now() - interval '7 days'),
  (2, 'Yaw Boadu', 4, 'Perfect for studying', 'Great coffee and a quiet study environment. WiFi is reliable too. A bit pricey for students but worth it sometimes.', 28, now() - interval '14 days'),
  (3, 'Akweley Mensah', 5, 'Suya night vibes!', 'Best place to grab suya after evening classes. The meat is always fresh and seasoned perfectly. Highly recommended!', 19, now() - interval '3 days');


