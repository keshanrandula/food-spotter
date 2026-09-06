'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Globe, Bookmark, Sparkles, Navigation, Clock, User, Star } from 'lucide-react';
import { Restaurant } from '@/types';
import { Modal } from '../ui/Modal';
import { RatingStars } from '../ui/RatingStars';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AiSummaryBox } from './AiSummaryBox';

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
        <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-stone-900 -mt-2">
          <img
            src={restaurant.photos[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
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
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'bg-savor-100 text-savor-700 border border-savor-200'
                : 'text-stone-500 hover:text-stone-900'
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-savor-100 text-savor-700 border border-savor-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Sparkles size={14} className="text-savor-600" />
            AI Review Summary
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'info' && (
          <div className="space-y-4 text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-savor-600" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-amber-700">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span>{restaurant.rating.toFixed(1)} / 5.0 ({restaurant.userRatingsTotal} Diner Reviews)</span>
            </div>
            <p className="leading-relaxed text-stone-600 bg-stone-50 p-4 rounded-xl border border-stone-200">
              "{restaurant.aiReviewSummary || restaurant.aiSummary?.overallSummary || 'Diners rave about the hand-rolled pasta, intimate candlelit ambience, and attentive pairings.'}"
            </p>
          </div>
        )}

        {/* TAB 2: AI SUMMARY */}
        {activeTab === 'ai' && (
          <div>
            {isLoadingAi ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-8 h-8 border-4 border-savor-600/30 border-t-savor-600 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-stone-500">Generating AI Sentiment Summary...</p>
              </div>
            ) : restaurant.aiSummary ? (
              <AiSummaryBox summary={restaurant.aiSummary} />
            ) : (
              <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <p className="text-xs text-stone-600">Click below to synthesize diner reviews with AI.</p>
                <Button variant="primary" size="sm" onClick={() => onGenerateAiSummary(restaurant)}>
                  Synthesize Reviews
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
