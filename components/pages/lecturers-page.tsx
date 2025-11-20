'use client';

import ReviewCard from '../review-card';
import RatingStars from '../rating-stars';
import { Search, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface LecturersPageProps {
  onNavigate?: (page: string) => void;
}

export default function LecturersPage({ onNavigate }: LecturersPageProps) {
  const [lecturers, setLecturers] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) { setLecturers([]); setLoading(false); return; }
        const { data, error } = await supabase
          .from('lecturers')
          .select('id, name, department, courses, rating, reviews_count, lecturer_reviews (author, rating, title, content, helpful, created_at)')
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

  const lecturerData = lecturers ?? [];
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-4 text-secondary">Lecturer Reviews</h1>
          <p className="text-lg text-muted-foreground mb-8">Rate and review your favorite lecturers</p>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search lecturers..."
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
                {lecturer.reviews_list.map((review, idx) => (
                  <ReviewCard key={idx} {...review} />
                ))}
              </div>

              <button className="mt-6 text-primary font-semibold hover:underline">
                View all {lecturer.reviews} reviews →
              </button>
            </div>
          ))}
        </div>
        )}
      </div>
    </main>
  );
}
