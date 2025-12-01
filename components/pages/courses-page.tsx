

'use client';

import ReviewCard from '../review-card';
import RatingStars from '../rating-stars';
import { Search, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Slider } from '@/components/ui/slider';

interface CoursesPageProps {
  onNavigate?: (page: string) => void;
}

export default function CoursesPage({ onNavigate }: CoursesPageProps) {
  const [courses, setCourses] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [expandedCourses, setExpandedCourses] = useState<Record<number, boolean>>({});
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('liked_reviews');
    if (stored) {
      setLikedReviews(new Set(JSON.parse(stored)));
    }
  }, []);

  const toggleReviews = (courseId: number) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) { setCourses([]); setLoading(false); return; }
        const { data, error } = await supabase
          .from('courses')
          .select('id, name, code, instructor, semester, rating, reviews_count, course_reviews (id, author, rating, title, content, helpful, created_at)')
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
            id: r.id,
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

  const allCourses = courses ?? [];


  const courseData = allCourses.filter((course) => {
    const matchesSearch = (() => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.instructor?.toLowerCase().includes(query) ||
        course.semester?.toLowerCase().includes(query)
      );
    })();

    const matchesRating = course.rating >= ratingFilter;
    const hasReviews = course.reviews > 0;

    return matchesSearch && matchesRating && hasReviews;
  }).sort((a, b) => b.rating - a.rating);

  const handleHelpful = async (reviewId: number) => {
    const reviewKey = `course_${reviewId}`;
    const isLiked = likedReviews.has(reviewKey);
    const action = isLiked ? 'unlike' : 'like';

    try {
      const response = await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, type: 'course', action }),
      });

      if (response.ok) {
        const { count } = await response.json();


        const newLiked = new Set(likedReviews);
        if (isLiked) {
          newLiked.delete(reviewKey);
        } else {
          newLiked.add(reviewKey);
        }
        setLikedReviews(newLiked);
        localStorage.setItem('liked_reviews', JSON.stringify(Array.from(newLiked)));


        setCourses(prev => {
          if (!prev) return null;
          return prev.map(c => ({
            ...c,
            reviews_list: c.reviews_list.map((r: any) =>
              r.id === reviewId ? { ...r, helpful: count } : r
            )
          }));
        });
      }
    } catch (error) {
      console.error('Error updating helpful count:', error);
    }
  };

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-4 text-secondary">Course Reviews</h1>
          <p className="text-lg text-muted-foreground mb-8">Discover what your peers think about courses at Ashesi</p>

          {/* Search Bar */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>
              <button
                onClick={() => onNavigate?.('add-review-courses')}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Plus size={20} />
                Add Review
              </button>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-muted-foreground">Minimum Rating</span>
                <span className="text-lg font-bold text-secondary">{ratingFilter.toFixed(1)}+</span>
              </div>
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={[ratingFilter]}
                onValueChange={(value) => setRatingFilter(value[0] ?? 0)}
                className="w-full"
                aria-label="Minimum rating filter"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
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
                  {(expandedCourses[course.id] ? course.reviews_list : course.reviews_list.slice(0, 3)).map((review: any, idx: number) => (
                    <ReviewCard
                      key={idx}
                      {...review}
                      isLiked={likedReviews.has(`course_${review.id}`)}
                      onHelpful={() => handleHelpful(review.id)}
                    />
                  ))}
                </div>

                {course.reviews_list.length > 3 && (
                  <button
                    onClick={() => toggleReviews(course.id)}
                    className="mt-6 text-primary font-semibold hover:underline"
                  >
                    {expandedCourses[course.id]
                      ? 'Show less'
                      : `View all ${course.reviews} reviews →`}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
