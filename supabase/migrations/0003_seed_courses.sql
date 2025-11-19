-- Seed initial courses
insert into public.courses (id, code, name, instructor, semester)
values
  (1, 'CS 201', 'Data Structures & Algorithms', 'Dr. Kwame Asante', 'Fall 2024'),
  (2, 'HST 150', 'African History & Culture', 'Prof. Ama Adjei', 'Fall 2024'),
  (3, 'BUS 210', 'Business Analytics', 'Dr. Samuel Boateng', 'Fall 2024')
on conflict (id) do nothing;

-- Seed reviews
insert into public.course_reviews (course_id, author, rating, title, content, helpful, created_at)
values
  (1, 'Ama Sarpong', 5, 'Challenging but rewarding', 'Great course that really helps you understand the foundations of CS. Dr. Asante is very knowledgeable and makes complex topics understandable.', 24, now() - interval '14 days'),
  (1, 'Kofi Mensah', 4, 'Good content, heavy workload', 'The assignments are quite demanding, but the course material is well-structured. Definitely brought my algorithms game up.', 15, now() - interval '30 days'),
  (2, 'Nana Akosua', 5, 'Absolutely fascinating!', 'Prof. Adjei brings African history to life. Engaging lectures, thoughtful discussions, and really makes you think critically about our heritage.', 31, now() - interval '21 days'),
  (3, 'Kojo Ansah', 4, 'Practical skills for the real world', 'Very practical course with real-world applications. Dr. Boateng knows his stuff, though the Excel work can be tedious.', 12, now() - interval '30 days');


