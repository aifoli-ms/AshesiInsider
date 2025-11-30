//@Shaun Esua - Mensah
'use client';

import RatingStars from './rating-stars';
import { ThumbsUp } from 'lucide-react';

interface ReviewCardProps {
  author: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  helpful?: number;
  isLiked?: boolean;
  onHelpful?: () => void;
}

export default function ReviewCard({ author, rating, title, text, date, helpful = 0, isLiked = false, onHelpful }: ReviewCardProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-card-foreground">{author}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        <RatingStars rating={rating} />
      </div>
      <h3 className="font-bold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{text}</p>
      <button
        onClick={onHelpful}
        className={`flex items-center gap-2 text-xs transition-colors ${isLiked
          ? 'text-red-500 hover:text-red-600'
          : 'text-muted-foreground hover:text-accent'
          }`}
      >
        <ThumbsUp size={14} fill={isLiked ? "currentColor" : "none"} />
        <span>Helpful ({helpful})</span>
      </button>
    </div>
  );
}
