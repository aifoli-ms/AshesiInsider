'use client';

import ReviewCard from '../review-card';
import RatingStars from '../rating-stars';
import { Search, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Slider } from '@/components/ui/slider';

interface LecturersPageProps {
  onNavigate?: (page: string) => void;
}

export default function LecturersPage({ onNavigate }: LecturersPageProps) {
  const [lecturers, setLecturers] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [expandedLecturers, setExpandedLecturers] = useState<Record<number, boolean>>({});
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('liked_reviews');
    if (stored) {
      setLikedReviews(new Set(JSON.parse(stored)));
    }
  }, []);

  const toggleReviews = (lecturerId: number) => {
    setExpandedLecturers((prev) => ({
      ...prev,
      [lecturerId]: !prev[lecturerId],
    }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) { setLecturers([]); setLoading(false); return; }
        const { data, error } = await supabase
          .from('lecturers')
          .select('id, name, department, courses, rating, reviews_count, lecturer_reviews (id, author, rating, title, content, helpful, created_at)')
          .order('id', { ascending: true });
        if (error) { setLecturers([]); setLoading(false); return; }
        const mapped = (data || []).map((l: any) => ({
          id: l.id,
          name: l.name,
          department: l.department,
          courses: l.courses,
          rating: Number(l.rating ?? 0),
          reviews: Number(l.reviews_count ?? 0),
          reviews_list: (l.lecturer_reviews || []).map((r: any) => ({
            id: r.id,
            author: r.author ?? 'Anonymous',
            rating: r.rating,
            title: r.title,
            text: r.content,
            date: new Date(r.created_at).toDateString(),
            helpful: r.helpful,
          })),
        }));
        setLecturers(mapped);
        setLoading(false);
      } catch {
        setLecturers([]);
        setLoading(false);
      }
    };
    void load();
  }, []);

  const allLecturers = lecturers ?? [];

  
  const lecturerData = allLecturers.filter((lecturer) => {
    const matchesSearch = (() => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        lecturer.name.toLowerCase().includes(query) ||
        lecturer.department?.toLowerCase().includes(query) ||
        lecturer.courses?.toLowerCase().includes(query)
      );
    })();

    const matchesRating = lecturer.rating >= ratingFilter;
    const hasReviews = lecturer.reviews > 0;

    return matchesSearch && matchesRating && hasReviews;
  }).sort((a, b) => b.rating - a.rating);

  const handleHelpful = async (reviewId: number) => {
    const reviewKey = `lecturer_${reviewId}`;
    const isLiked = likedReviews.has(reviewKey);
    const action = isLiked ? 'unlike' : 'like';

    try {
      const response = await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, type: 'lecturer', action }),
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

        
        setLecturers(prev => {
          if (!prev) return null;
          return prev.map(l => ({
            ...l,
            reviews_list: l.reviews_list.map((r: any) =>
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
          <h1 className="text-4xl font-black mb-4 text-secondary">Lecturer Reviews</h1>
          <p className="text-lg text-muted-foreground mb-8">Rate and review your favorite lecturers</p>

          {/* Search Bar */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search lecturers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>
              <button
                onClick={() => onNavigate?.('add-review-lecturers')}
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

        {/* Lecturers Grid */}
        {loading ? (
          <div className="text-muted-foreground">Loading lecturers…</div>
        ) : lecturerData.length === 0 ? (
          <div className="text-muted-foreground">No lecturers found.</div>
        ) : (
          <div className="space-y-8">
            {lecturerData.map((lecturer: any) => (
              <div key={lecturer.id} className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-14 h-14 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                        {lecturer.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-card-foreground">{lecturer.name}</h2>
                        <p className="text-muted-foreground text-sm">{lecturer.department}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-3">Teaches: {lecturer.courses}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-secondary mb-1">{lecturer.rating}</div>
                    <RatingStars rating={lecturer.rating} count={lecturer.reviews} />
                  </div>
                </div>

                {/* Reviews */}
                <div className="space-y-4">
                  {(expandedLecturers[lecturer.id] ? lecturer.reviews_list : lecturer.reviews_list.slice(0, 3)).map((review: any, idx: number) => (
                    <ReviewCard
                      key={idx}
                      {...review}
                      isLiked={likedReviews.has(`lecturer_${review.id}`)}
                      onHelpful={() => handleHelpful(review.id)}
                    />
                  ))}
                </div>

                {lecturer.reviews_list.length > 3 && (
                  <button
                    onClick={() => toggleReviews(lecturer.id)}
                    className="mt-6 text-primary font-semibold hover:underline"
                  >
                    {expandedLecturers[lecturer.id]
                      ? 'Show less'
                      : `View all ${lecturer.reviews} reviews →`}
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
