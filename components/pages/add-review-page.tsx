'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

interface AddReviewPageProps {
  reviewType: 'courses' | 'restaurants' | 'lecturers' | 'hostels';
  onNavigate: (page: string) => void;
  onCancel: () => void;
}

interface Item {
  id: number;
  name: string;
  code?: string;
  displayName: string;
}

export default function AddReviewPage({ reviewType, onNavigate, onCancel }: AddReviewPageProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const typeLabels = {
    courses: { singular: 'Course', plural: 'Courses', placeholder: 'Search for a course...' },
    restaurants: { singular: 'Restaurant', plural: 'Restaurants', placeholder: 'Search for a restaurant...' },
    lecturers: { singular: 'Lecturer', plural: 'Lecturers', placeholder: 'Search for a lecturer...' },
    hostels: { singular: 'Hostel', plural: 'Hostels', placeholder: 'Search for a hostel...' },
  };

  const labels = typeLabels[reviewType];

  useEffect(() => {
    const loadItems = async () => {
      try {
        if (!supabase) {
          setItems([]);
          setLoading(false);
          return;
        }

        let tableName = reviewType;
        let selectFields = 'id, name';

        if (reviewType === 'courses') {
          selectFields = 'id, name, code';
        }

        const { data, error } = await supabase
          .from(tableName)
          .select(selectFields)
          .order('name', { ascending: true });

        if (error) {
          setItems([]);
          setLoading(false);
          return;
        }

        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          code: item.code,
          displayName: reviewType === 'courses' && item.code
            ? `${item.code} - ${item.name}`
            : item.name,
        }));

        setItems(mapped);
        setLoading(false);
      } catch {
        setItems([]);
        setLoading(false);
      }
    };

    void loadItems();
  }, [reviewType]);

  const filteredItems = items.filter((item) =>
    item.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFormValid = selectedItem && rating > 0 && reviewTitle.trim() && reviewContent.trim();

  const handleSubmit = async () => {
    if (!isFormValid || !selectedItem) return;

    try {
      const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
      if (!sessionRes.ok) {
        alert('Please sign in to submit a review');
        return;
      }

      const sessionData = await sessionRes.json();
      const sessionUser = sessionData.user;


      const author = sessionUser?.firstName || sessionUser?.email?.split('@')[0] || 'Anonymous';


      const reviewTableMap = {
        courses: { table: 'course_reviews', field: 'course_id' },
        restaurants: { table: 'restaurant_reviews', field: 'restaurant_id' },
        lecturers: { table: 'lecturer_reviews', field: 'lecturer_id' },
        hostels: { table: 'hostel_reviews', field: 'hostel_id' },
      };

      const { table: reviewTable, field: itemIdField } = reviewTableMap[reviewType];


      if (!supabase) {
        alert('Database connection not available. Please try again later.');
        return;
      }

      const { error: reviewError } = await supabase
        .from(reviewTable)
        .insert({
          [itemIdField]: selectedItem.id,
          user_id: null,
          author,
          rating,
          title: reviewTitle.trim(),
          content: reviewContent.trim(),
        });

      if (reviewError) {
        console.error('Error submitting review:', reviewError);
        alert('Failed to submit review. Please try again.');
        return;
      }

      // Navigate back to the reviews page
      onNavigate(reviewType);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => onNavigate(reviewType)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Reviews</span>
        </button>

        {/* Review Form Card */}
        <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2 text-card-foreground">Add a Review</h1>
            <p className="text-muted-foreground">Share your experience to help fellow students</p>
          </div>

          <div className="space-y-6">
            {/* Select Item */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-card-foreground">
                Select {labels.singular} *
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-12 text-left font-normal"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className={selectedItem ? 'text-foreground' : 'text-muted-foreground'}>
                        {selectedItem ? selectedItem.displayName : labels.placeholder}
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder={labels.placeholder}
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {loading ? 'Loading...' : `No ${labels.plural.toLowerCase()} found.`}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredItems.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.displayName}
                            onSelect={() => {
                              setSelectedItem(item);
                              setOpen(false);
                              setSearchQuery('');
                            }}
                          >
                            {item.displayName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-card-foreground">
                Your Rating *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={cn(
                        'transition-colors',
                        star <= (hoveredRating || rating)
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-card-foreground">
                Review Title *
              </label>
              <Input
                type="text"
                placeholder="Summarize your experience..."
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Review Content */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-card-foreground">
                Your Review *
              </label>
              <div className="relative">
                <Textarea
                  placeholder={`Share details about your experience with this ${labels.singular.toLowerCase()}. What did you like? What could be improved?`}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="min-h-32 pr-20"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2 h-8"
                  onClick={() => {

                    alert('Preview functionality coming soon!');
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {reviewContent.length} characters
              </p>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="flex-1 h-12 font-semibold"
              >
                Submit Review
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 h-12 font-semibold"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Review Guidelines */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold mb-2 text-card-foreground">Review Guidelines</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Be honest and constructive in your feedback</li>
              <li>
                {reviewType === 'courses' && 'Focus on your learning experience and course content'}
                {reviewType === 'lecturers' && 'Focus on teaching style, clarity, and helpfulness'}
                {reviewType === 'restaurants' && 'Focus on food quality, service, and value'}
                {reviewType === 'hostels' && 'Focus on facilities, location, and living experience'}
              </li>
              <li>Avoid personal attacks or inappropriate language</li>
              <li>Your review will help other students make informed decisions</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

