'use client';

import ReviewCard from '../review-card';
import RatingStars from '../rating-stars';
import { Search, Plus, MapPin, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface RestaurantsPageProps {
  onNavigate?: (page: string) => void;
}

export default function RestaurantsPage({ onNavigate }: RestaurantsPageProps) {
  const [restaurants, setRestaurants] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!supabase) { setRestaurants([]); setLoading(false); return; }
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, name, location, cuisine, hours, rating, reviews_count, restaurant_reviews (author, rating, title, content, helpful, created_at)')
          .order('id', { ascending: true });
        if (error) { setRestaurants([]); setLoading(false); return; }
        const mapped = (data || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          location: r.location,
          cuisine: r.cuisine,
          hours: r.hours,
          rating: Number(r.rating ?? 0),
          reviews: Number(r.reviews_count ?? 0),
          reviews_list: (r.restaurant_reviews || []).map((rev: any) => ({
            author: rev.author ?? 'Anonymous',
            rating: rev.rating,
            title: rev.title,
            text: rev.content,
            date: new Date(rev.created_at).toDateString(),
            helpful: rev.helpful,
          })),
        }));
        setRestaurants(mapped);
        setLoading(false);
      } catch {
        setRestaurants([]);
        setLoading(false);
      }
    };
    void load();
  }, []);

  const restaurantData = restaurants ?? [];
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-4 text-secondary">Restaurant Reviews</h1>
          <p className="text-lg text-muted-foreground mb-8">Find the best dining spots around Ashesi</p>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search restaurants..."
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
              />
            </div>
            <button 
              onClick={() => onNavigate?.('add-review-restaurants')}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus size={20} />
              Add Review
            </button>
          </div>
        </div>

        {/* Restaurants Grid */}
        {loading ? (
          <div className="text-muted-foreground">Loading restaurants…</div>
        ) : restaurantData.length === 0 ? (
          <div className="text-muted-foreground">No restaurants found.</div>
        ) : (
        <div className="space-y-8">
          {restaurantData.map((restaurant: any) => (
            <div key={restaurant.id} className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">{restaurant.name}</h2>
                  <div className="flex flex-col gap-1 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {restaurant.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {restaurant.hours}
                    </div>
                    <p className="text-sm">{restaurant.cuisine}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-secondary mb-1">{restaurant.rating}</div>
                  <RatingStars rating={restaurant.rating} count={restaurant.reviews} />
                </div>
              </div>

              {/* Reviews */}
              <div className="space-y-4">
                {restaurant.reviews_list.map((review, idx) => (
                  <ReviewCard key={idx} {...review} />
                ))}
              </div>

              <button className="mt-6 text-primary font-semibold hover:underline">
                View all {restaurant.reviews} reviews →
              </button>
            </div>
          ))}
        </div>
        )}
      </div>
    </main>
  );
}
