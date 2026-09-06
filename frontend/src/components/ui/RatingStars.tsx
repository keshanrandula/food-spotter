import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
  showText?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, totalReviews, showText = true }) => {
  return (
    <div className="flex items-center gap-1 text-amber-700 font-bold text-xs">
      <Star size={14} className="fill-amber-400 text-amber-400" />
      <span>{rating.toFixed(1)}</span>
      {totalReviews !== undefined && <span className="text-stone-400 font-normal">({totalReviews})</span>}
    </div>
  );
};
