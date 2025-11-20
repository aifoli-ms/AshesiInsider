'use client';

import ReviewCard from '../review-card';
import RatingStars from '../rating-stars';
import { Search, Plus, MapPin, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface HostelsPageProps {
  onNavigate?: (page: string) => void;
}

export default function HostelsPage({ onNavigate }: HostelsPageProps) {
  const [hostels, setHostels] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) { setHostels([]); setLoading(false); return; }
        const { data, error } = await supabase
          .from('hostels')
          .select('id, name, location, price_range, rating, reviews_count, hostel_reviews (author, rating, title, content, helpful, created_at)')
          .order('id', { ascending: true });
        if (error) { setHostels([]); setLoading(false); return; }
        const mapped = (data || []).map((h: any) => ({
          id: h.id,
          name: h.name,
          location: h.location,
          price_range: h.price_range,
          rating: Number(h.rating ?? 0),
          reviews: Number(h.reviews_count ?? 0),
          reviews_list: (h.hostel_reviews || []).map((r: any) => ({
            author: r.author ?? 'Anonymous',
            rating: r.rating,
            title: r.title,
            text: r.content,
            date: new Date(r.created_at).toDateString(),
            helpful: r.helpful,
          })),
        }));
        setHostels(mapped);
        setLoading(false);
      } catch {
        setHostels([]);
        setLoading(false);
      }
    };
    void load();
  }, []);

  const allHostels = hostels ?? [];
  
  // Filter hostels based on search query
  const hostelData = allHostels.filter((hostel) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      hostel.name.toLowerCase().includes(query) ||
      hostel.location?.toLowerCase().includes(query) ||
      hostel.price_range?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-4 text-secondary">Hostel Reviews</h1>
          <p className="text-lg text-muted-foreground mb-8">Find the best hostel accommodation at Ashesi</p>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search hostels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
              />
            </div>
            <button 
              onClick={() => onNavigate?.('add-review-hostels')}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus size={20} />
              Add Review
            </button>
          </div>
        </div>

        {/* Loading / Empty / Hostels Grid */}
        {loading ? (
          <div className="text-muted-foreground">Loading hostels…</div>
        ) : hostelData.length === 0 ? (
          <div className="text-muted-foreground">No hostels found.</div>
        ) : (
        <div className="space-y-8">
          {hostelData.map((hostel: any) => (
            <div key={hostel.id} className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">{hostel.name}</h2>
                  <div className="flex flex-col gap-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {hostel.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      Price: {hostel.price_range ?? 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-secondary mb-1">{hostel.rating}</div>
                  <RatingStars rating={hostel.rating} count={hostel.reviews} />
                </div>
              </div>

              {/* Reviews */}
              <div className="space-y-4">
                {hostel.reviews_list.map((review: any, idx: number) => (
                  <ReviewCard key={idx} {...review} />
                ))}
              </div>

              <button className="mt-6 text-primary font-semibold hover:underline">
                View all {hostel.reviews} reviews →
              </button>
            </div>
          ))}
        </div>
        )}
      </div>
    </main>
  );
}
