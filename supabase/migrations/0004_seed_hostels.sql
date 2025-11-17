-- Seed initial hostels
insert into public.hostels (id, name, location, price_range)
values
  (1, 'Berekuso Heights', 'Berekuso', '₵₵₵'),
  (2, 'Akwaaba Residence', 'Berekuso Junction', '₵₵'),
  (3, 'Horizon Lodge', 'North Legon', '₵₵₵')
on conflict (id) do nothing;

-- Seed hostel reviews
insert into public.hostel_reviews (hostel_id, author, rating, title, content, helpful, created_at)
values
  (1, 'Afia Nyarko', 5, 'Modern and clean', 'Spacious rooms, reliable Wi‑Fi, and quiet study spaces. A bit pricey but worth it.', 18, now() - interval '12 days'),
  (1, 'Yaw Owusu', 4, 'Great but far', 'Great facilities, but commuting can be a bit long during busy hours.', 9, now() - interval '25 days'),
  (2, 'Kojo Oppong', 4, 'Good value for money', 'Affordable and close to the junction. Rooms can get warm without AC.', 7, now() - interval '3 weeks'),
  (3, 'Esi Osei', 3, 'Decent overall', 'Nice location, average amenities. Could improve on maintenance.', 4, now() - interval '1 month');


