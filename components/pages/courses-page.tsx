'use client';

import ReviewCard from '../review-card';
import RatingStars from '../rating-stars';
import { Search, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) { setCourses([]); setLoading(false); return; }
        const { data, error } = await supabase
          .from('courses')
          .select('id, name, code, instructor, semester, rating, reviews_count, course_reviews (author, rating, title, content, helpful, created_at)')
          .order('id', { ascending: true });
        if (error) { setCourses([]); setLoading(false); return; }
        const mapped = (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          rating: Number(c.rating ?? 0),
          reviews: Number(c.reviews_count ?? 0),
          instructor: c.instructor,
          semester: c.semester,
          reviews_list: (c.course_reviews || []).map((r: any) => ({
            author: r.author ?? 'Anonymous',
            rating: r.rating,
            title: r.title,
            text: r.content,
            date: new Date(r.created_at).toDateString(),
            helpful: r.helpful,
          })),
        }));
        setCourses(mapped);
        setLoading(false);
      } catch {
        setCourses([]);
        setLoading(false);
      }
    };
    void load();
  }, []);

  const courseData = courses ?? [];

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-4 text-secondary">Course Reviews</h1>
          <p className="text-lg text-muted-foreground mb-8">Discover what your peers think about courses at Ashesi</p>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
              />
            </div>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus size={20} />
              Add Review
            </button>
          </div>
        </div>

        {/* Loading / Empty / Courses Grid */}
        {loading ? (
          <div className="text-muted-foreground">Loading courses…</div>
        ) : courseData.length === 0 ? (
          <div className="text-muted-foreground">No courses found.</div>
        ) : (
        <div className="space-y-8">
          {courseData.map((course: any) => (
            <div key={course.id} className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/20 px-4 py-2 rounded-lg">
                      <span className="text-primary font-bold">{course.code}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground">{course.name}</h2>
                  <p className="text-muted-foreground">Instructor: {course.instructor}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-secondary mb-1">{course.rating}</div>
                  <RatingStars rating={course.rating} count={course.reviews} />
                </div>
              </div>

              {/* Reviews */}
              <div className="space-y-4">
                {course.reviews_list.map((review: any, idx: number) => (
                  <ReviewCard key={idx} {...review} />
                ))}
              </div>

              <button className="mt-6 text-primary font-semibold hover:underline">
                View all {course.reviews} reviews →
              </button>
            </div>
          ))}
        </div>
        )}
      </div>
    </main>
  );
}
