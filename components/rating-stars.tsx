//@Shaun Esua - Mensah
'use client';

import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
}

export default function RatingStars({ rating, count }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < Math.round(rating) ? 'fill-primary text-primary' : 'text-muted'}
        />
      ))}
      {count && <span className="text-xs text-muted-foreground ml-1">({count})</span>}
    </div>
  );
}
