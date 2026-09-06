'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Star, Phone, Sparkles, Utensils, Compass } from 'lucide-react';
import { Restaurant } from '@/types';
import { RatingStars } from '../ui/RatingStars';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onSummarizeAi: (restaurant: Restaurant) => void;
}

export const RestaurantMap: React.FC<RestaurantMapProps> = ({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onSummarizeAi,
}) => {
  const [hoveredRestaurant, setHoveredRestaurant] = useState<Restaurant | null>(null);

  // Normalize lat/lng to fit canvas area visually
  const minLat = Math.min(...restaurants.map(r => r.lat), 6.85);
  const maxLat = Math.max(...restaurants.map(r => r.lat), 6.95);
  const minLng = Math.min(...restaurants.map(r => r.lng), 79.83);
  const maxLng = Math.max(...restaurants.map(r => r.lng), 79.88);

  const getPositionStyle = (lat: number, lng: number) => {
    const latSpan = maxLat - minLat || 0.05;
    const lngSpan = maxLng - minLng || 0.05;

    // Invert lat for Y percentage
    const top = Math.max(10, Math.min(85, 90 - ((lat - minLat) / latSpan) * 75));
    const left = Math.max(10, Math.min(85, ((lng - minLng) / lngSpan) * 75 + 10));

    return { top: `${top}%`, left: `${left}%` };
  };

  const activeRest = hoveredRestaurant || selectedRestaurant;

  return (
    <div className="relative w-full h-[520px] rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950 shadow-2xl flex flex-col">
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-zinc-900/90 border border-zinc-800 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg">
        <Compass size={16} className="text-rose-400 animate-spin" style={{ animationDuration: '10s' }} />
        <span className="text-xs font-bold text-zinc-200">Interactive Location Map</span>
        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-semibold">
          {restaurants.length} Places
        </span>
      </div>

      {/* Stylized Grid Canvas */}
      <div className="relative flex-1 w-full h-full bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] bg-zinc-950 overflow-hidden">
        {/* Decorative Roads & Coastline graphics */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 100 Q 150 200 300 150 T 600 300 T 900 200" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 200 0 Q 300 250 500 500" fill="none" stroke="#6366f1" strokeWidth="2" />
          <path d="M 50 0 C 40 180 80 350 120 520" fill="none" stroke="#38bdf8" strokeWidth="4" />
        </svg>

        {/* Map Markers */}
        {restaurants.map((rest) => {
          const isSelected = selectedRestaurant?.id === rest.id;
          const isHovered = hoveredRestaurant?.id === rest.id;
          const pos = getPositionStyle(rest.lat, rest.lng);

          return (
            <div
              key={rest.id}
              style={pos}
              onMouseEnter={() => setHoveredRestaurant(rest)}
              onMouseLeave={() => setHoveredRestaurant(null)}
              onClick={() => onSelectRestaurant(rest)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
            >
              {/* Marker Pin */}
              <div
                className={`relative flex items-center justify-center p-2 rounded-2xl transition-all duration-300 shadow-xl ${
                  isSelected || isHovered
                    ? 'bg-rose-500 text-white scale-125 z-30 shadow-rose-500/50'
                    : 'bg-zinc-900 border border-zinc-700 text-rose-400 hover:scale-110 hover:border-rose-500'
                }`}
              >
                <MapPin size={20} className={isSelected || isHovered ? 'fill-white' : ''} />
                <span className="ml-1 text-xs font-extrabold pr-1">{rest.rating.toFixed(1)}</span>

                {/* Pulse Ring */}
                {(isSelected || isHovered) && (
                  <span className="absolute -inset-1 rounded-2xl bg-rose-500/30 animate-ping" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Restaurant Floating Info Card */}
      {activeRest && (
        <div className="absolute bottom-4 left-4 right-4 z-30 bg-zinc-900/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-slideUp flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={activeRest.photos[0]}
              alt={activeRest.name}
              className="w-16 h-16 rounded-xl object-cover border border-zinc-800"
            />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="rose">{activeRest.priceString}</Badge>
                <Badge variant="indigo">{activeRest.cuisine}</Badge>
              </div>
              <h4 className="text-base font-bold text-zinc-100">{activeRest.name}</h4>
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <MapPin size={12} className="text-zinc-500" /> {activeRest.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSummarizeAi(activeRest)}
              className="flex-1 sm:flex-none text-xs gap-1.5"
            >
              <Sparkles size={13} className="text-rose-400" />
              AI Review
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSelectRestaurant(activeRest)}
              className="flex-1 sm:flex-none text-xs"
            >
              Full Details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
