-- Seed initial lecturers
insert into public.lecturers (id, name, department, courses)
values
  (1, 'Dr. Kwame Asante', 'Computer Science', 'Data Structures, Algorithms, OOP'),
  (2, 'Prof. Ama Adjei', 'History', 'African History, World History'),
  (3, 'Mr. Samuel Boateng', 'Business', 'Business Analytics, Marketing')
on conflict (id) do nothing;

-- Seed lecturer reviews
insert into public.lecturer_reviews (lecturer_id, author, rating, title, content, helpful, created_at)
values
  (1, 'Benjamin Osei', 5, 'Makes complex topics simple', 'Dr. Asante has an amazing ability to break down complex concepts. His examples are relatable and his office hours are genuinely helpful.', 27, now() - interval '14 days'),
  (2, 'Esi Owusu', 5, 'The best lecturer on campus', 'Prof. Adjei is passionate about her subject and it shows in every class. Engaging, fair grading, and truly cares about student learning.', 38, now() - interval '7 days'),
  (3, 'Nii Armah', 4, 'Knowledgeable but demanding', 'Mr. Boateng knows business inside and out, but expects a lot from students. The course is challenging but definitely worth taking.', 14, now() - interval '21 days');


