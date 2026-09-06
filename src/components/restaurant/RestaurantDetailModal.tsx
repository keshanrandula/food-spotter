'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Globe, Bookmark, Sparkles, Navigation, Clock, User, Star, Share2 } from 'lucide-react';
import { Restaurant, AiSummary } from '@/types';
import { Modal } from '../ui/Modal';
import { RatingStars } from '../ui/RatingStars';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AiSummaryBox } from './AiSummaryBox';
import { formatDistance } from '@/utils/formatters';

interface RestaurantDetailModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave: (restaurant: Restaurant) => void;
  onGenerateAiSummary: (restaurant: Restaurant) => Promise<void>;
  isLoadingAi?: boolean;
}

export const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  isSaved = false,
  onToggleSave,
  onGenerateAiSummary,
  isLoadingAi = false,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'ai'>('info');

  if (!restaurant) return null;

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${restaurant.name} ${restaurant.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="space-y-6">
        {/* Cover Photo & Header */}
        <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-zinc-950 -mt-2">
          <img
            src={restaurant.photos[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Action Overlay */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => onToggleSave(restaurant)}
              className={`p-3 rounded-full transition-all duration-200 backdrop-blur-md cursor-pointer ${
                isSaved
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                  : 'bg-black/60 text-zinc-300 hover:text-white'
              }`}
            >
              <Bookmark size={18} className={isSaved ? 'fill-white' : ''} />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="rose">{restaurant.priceString}</Badge>
                <Badge variant="indigo">{restaurant.cuisine}</Badge>
                {restaurant.openNow ? (
                  <Badge variant="emerald">Open Now</Badge>
                ) : (
                  <Badge variant="zinc">Closed</Badge>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {restaurant.name}
              </h2>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenMaps}
              className="gap-1.5 self-start sm:self-auto shadow-lg"
            >
              <Navigation size={15} />
              Get Directions
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Overview & Details
          </button>
          <button
            onClick={() => {
              setActiveTab('ai');
              if (!restaurant.aiSummary) {
                onGenerateAiSummary(restaurant);
              }
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles size={15} className="text-rose-400" />
            AI Review Summary
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Diner Reviews ({restaurant.reviews.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & DETAILS */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Quick Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Star size={18} className="fill-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-100">{restaurant.rating.toFixed(1)} / 5.0</div>
                  <div className="text-xs text-zinc-400">{restaurant.userRatingsTotal} Total Reviews</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Navigation size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-100">
                    {restaurant.distance !== undefined ? `${restaurant.distance.toFixed(1)} km` : 'Near City'}
                  </div>
                  <div className="text-xs text-zinc-400">Distance from current location</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-100">
                    {restaurant.openNow ? 'Open Now' : 'Closed Today'}
                  </div>
                  <div className="text-xs text-zinc-400">Standard Business Hours</div>
                </div>
              </div>
            </div>

            {/* Address & Contact Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-zinc-200">Location & Contact Information</h4>
              <div className="space-y-2 text-sm text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="text-rose-400 flex-shrink-0" />
                  <span>{restaurant.address}</span>
                </div>
                {restaurant.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-emerald-400 flex-shrink-0" />
                    <a href={`tel:${restaurant.phone}`} className="hover:underline text-zinc-200">
                      {restaurant.phone}
                    </a>
                  </div>
                )}
                {restaurant.website && (
                  <div className="flex items-center gap-2.5">
                    <Globe size={16} className="text-indigo-400 flex-shrink-0" />
                    <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-rose-400">
                      {restaurant.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Photo Gallery Grid */}
            {restaurant.photos.length > 1 && (
              <div>
                <h4 className="text-sm font-bold text-zinc-200 mb-3">Photo Gallery</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {restaurant.photos.map((photo, idx) => (
                    <div key={idx} className="h-32 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                      <img src={photo} alt={`${restaurant.name} photo ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI REVIEW SUMMARY */}
        {activeTab === 'ai' && (
          <div>
            {isLoadingAi ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto" />
                <h4 className="text-base font-bold text-zinc-200">Synthesizing Diner Reviews with AI...</h4>
                <p className="text-xs text-zinc-400">Analyzing customer sentiment, top dishes, pros and cons via OpenRouter AI</p>
              </div>
            ) : restaurant.aiSummary ? (
              <AiSummaryBox summary={restaurant.aiSummary} />
            ) : (
              <div className="p-8 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-3">
                <Sparkles size={32} className="text-rose-400 mx-auto" />
                <h4 className="text-base font-bold text-zinc-200">Generate AI Summary</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Let AI analyze all diner reviews for {restaurant.name} and provide key highlights, pros, cons, and recommended dishes.
                </p>
                <Button
                  variant="primary"
                  onClick={() => onGenerateAiSummary(restaurant)}
                  className="gap-2"
                >
                  <Sparkles size={16} />
                  Analyze Reviews Now
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DINER REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {restaurant.reviews.length === 0 ? (
              <p className="text-sm text-zinc-400 py-6 text-center">No reviews available for this restaurant yet.</p>
            ) : (
              restaurant.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {rev.authorPhoto ? (
                        <img src={rev.authorPhoto} alt={rev.authorName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                          <User size={16} />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-zinc-200">{rev.authorName}</div>
                        <div className="text-[11px] text-zinc-500">{rev.relativeTime}</div>
                      </div>
                    </div>

                    <RatingStars rating={rev.rating} showText={false} />
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                    "{rev.text}"
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
