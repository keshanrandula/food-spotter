'use client';

import React from 'react';
import { Heart, MapPin, Sparkles, Phone, ChevronRight } from 'lucide-react';
import { Restaurant } from '@/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
  onSummarizeAi: (restaurant: Restaurant) => void;
  onToggleSave: (restaurant: Restaurant) => void;
  isSaved?: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onSelect,
  onSummarizeAi,
  onToggleSave,
  isSaved = false,
}) => {
  const primaryPhoto = restaurant.photos[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';

  const badgeText = restaurant.tags.length > 0 
    ? `#${restaurant.tags[0]}` 
    : '🔥 Trending';

  return (
    <div className="group relative bg-white border border-warm-200/90 rounded-3xl overflow-hidden shadow-savor hover:shadow-savor-hover transition-all duration-300 flex flex-col h-full">
      {/* Thumbnail Section */}
      <div className="relative h-56 w-full overflow-hidden bg-stone-900">
        <img
          src={primaryPhoto}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-savor-600/90 text-white shadow-md backdrop-blur-md">
            🔥 {badgeText}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(restaurant);
            }}
            className={`pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md cursor-pointer ${
              isSaved
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 text-stone-700 hover:bg-white hover:text-rose-500'
            }`}
            title={isSaved ? 'Remove bookmark' : 'Save spot'}
          >
            <Heart size={16} className={isSaved ? 'fill-white' : ''} />
          </button>
        </div>

        {/* Bottom Operating Status Badge */}
        <div className="absolute bottom-3.5 left-3.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className={`w-2 h-2 rounded-full ${restaurant.openNow ? 'bg-emerald-400 animate-pulse' : 'bg-stone-400'}`} />
            {restaurant.openNow ? 'Open Now • Closes 11 PM' : 'Starting by Reservation'}
          </span>
        </div>
      </div>

      {/* Details Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              onClick={() => onSelect(restaurant)}
              className="text-lg font-bold text-stone-900 hover:text-savor-600 transition-colors cursor-pointer line-clamp-1 font-serif"
            >
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-xs font-bold flex-shrink-0">
              ★ {restaurant.rating.toFixed(1)} <span className="text-[10px] text-amber-600 font-normal">({restaurant.userRatingsTotal})</span>
            </div>
          </div>

          {/* Distance & Address */}
          <p className="text-xs text-stone-500 flex items-center gap-1 mb-2">
            <MapPin size={13} className="text-savor-600 flex-shrink-0" />
            <span>{restaurant.distance !== undefined ? `${restaurant.distance.toFixed(1)} miles away` : '0.8 miles away'} • {restaurant.address.split(',')[0]}</span>
          </p>

          {/* Price & Cuisine */}
          <p className="text-xs font-semibold text-stone-700 mb-4">
            {restaurant.priceString} • {restaurant.cuisine}
          </p>

          {/* AI REVIEW SUMMARY BOX */}
          <div className="rounded-2xl bg-[#fbf5ed] border border-[#f3e4d4] p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-savor-600 font-bold uppercase tracking-wider text-[10px]">
              <Sparkles size={13} />
              AI Review Summary
            </div>
            <p className="text-stone-700 leading-relaxed italic">
              "{restaurant.aiReviewSummary || restaurant.aiSummary?.overallSummary || 'Diners rave about the hand-rolled pasta, intimate candlelit ambience, and attentive pairings.'}"
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center gap-2.5">
          <button
            onClick={() => onSelect(restaurant)}
            className="flex-1 py-3 px-4 rounded-full text-xs font-bold bg-savor-600 hover:bg-savor-700 text-white shadow-md shadow-savor-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            View Menu & Reserve <ChevronRight size={14} />
          </button>
          <button
            onClick={() => onSelect(restaurant)}
            className="w-10 h-10 rounded-full bg-warm-100 hover:bg-warm-200 text-stone-700 flex items-center justify-center transition-colors border border-warm-200 cursor-pointer"
          >
            <Phone size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
