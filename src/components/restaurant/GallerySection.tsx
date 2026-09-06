'use client';

import React, { useState } from 'react';
import { Camera, Sparkles, ZoomIn, Star, MapPin, Heart } from 'lucide-react';

export interface GalleryItem {
  id: string;
  title: string;
  restaurant: string;
  location: string;
  category: string;
  rating: number;
  imageUrl: string;
  sizeClass: string;
  aspect: string;
  tag: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Wagyu Truffle Steak with Micro-Herbs',
    restaurant: 'Ministry of Crab & Grill',
    location: 'Old Dutch Hospital, Colombo',
    category: 'Fine Dining',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80',
    sizeClass: 'col-span-1 md:col-span-2 row-span-2',
    aspect: 'min-h-[420px]',
    tag: 'Chef Signature',
  },
  {
    id: 'g2',
    title: 'Artisanal Smoked Salmon Toast',
    restaurant: 'Café Kumbuk',
    location: 'Horton Place, Colombo 07',
    category: 'Artisanal & Grill',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=800&auto=format&fit=crop&q=80',
    sizeClass: 'col-span-1 row-span-1',
    aspect: 'min-h-[220px]',
    tag: 'Brunch Special',
  },
  {
    id: 'g3',
    title: 'Smoked Botanical Negroni & Craft Spirits',
    restaurant: 'Smoke & Bitters Lounge',
    location: 'Peppercorn Grove, Galle',
    category: 'Cocktails & Lounges',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    sizeClass: 'col-span-1 row-span-1',
    aspect: 'min-h-[220px]',
    tag: 'Top 50 Bars',
  },
  {
    id: 'g4',
    title: 'Candlelight Coastal Dining by the Waves',
    restaurant: 'Ocean Terrace & Lounge',
    location: 'Bentota Beachfront',
    category: 'Ambiance & Views',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
    sizeClass: 'col-span-1 md:col-span-2 row-span-1',
    aspect: 'min-h-[260px]',
    tag: 'Romantic Spot',
  },
  {
    id: 'g5',
    title: 'Matcha Pistachio Mille-Feuille',
    restaurant: 'The French Baker Patisserie',
    location: 'Galle Face Terrace',
    category: 'Desserts & Bakeries',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop&q=80',
    sizeClass: 'col-span-1 row-span-2',
    aspect: 'min-h-[380px]',
    tag: 'Pastry Masterclass',
  },
  {
    id: 'g6',
    title: 'Handcrafted Woodfired Burrata Pizza',
    restaurant: 'Trattoria Bella Napoli',
    location: 'Park Street Mews, Colombo',
    category: 'Artisanal & Grill',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    sizeClass: 'col-span-1 row-span-1',
    aspect: 'min-h-[220px]',
    tag: 'Authentic Italian',
  },
  {
    id: 'g7',
    title: 'Sunset Rooftop Skyline Views',
    restaurant: 'Cloud Red Rooftop Bar',
    location: 'Cinnamon Red, Colombo 03',
    category: 'Ambiance & Views',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&auto=format&fit=crop&q=80',
    sizeClass: 'col-span-1 row-span-1',
    aspect: 'min-h-[220px]',
    tag: 'Skyline View',
  },
  {
    id: 'g8',
    title: 'Omakase Nigiri & Fresh Bluefin Toro',
    restaurant: 'Nihonbashi Japanese',
    location: 'Dharmapala Mawatha, Colombo',
    category: 'Fine Dining',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1000&auto=format&fit=crop&q=80',
    sizeClass: 'col-span-1 md:col-span-2 row-span-1',
    aspect: 'min-h-[260px]',
    tag: 'Authentic Omakase',
  },
];

const CATEGORIES = [
  'All Highlights',
  'Fine Dining',
  'Artisanal & Grill',
  'Cocktails & Lounges',
  'Desserts & Bakeries',
  'Ambiance & Views',
];

interface GallerySectionProps {
  onOpenLightbox?: (photos: string[], title: string, index?: number) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onOpenLightbox }) => {
  const [activeCategory, setActiveCategory] = useState('All Highlights');
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const filteredItems = activeCategory === 'All Highlights'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCardClick = (item: GalleryItem, index: number) => {
    if (onOpenLightbox) {
      const photos = filteredItems.map(i => i.imageUrl);
      onOpenLightbox(photos, item.restaurant, index);
    }
  };

  return (
    <section id="gallery-section" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-savor-600/10 border border-savor-600/20 text-savor-600 text-xs font-bold tracking-wide uppercase">
            <Camera size={14} className="text-savor-600" />
            Gastronomic Visual Showcase
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-900 dark:text-stone-100 font-serif tracking-tight leading-tight">
            Culinary Moments & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-savor-600 via-amber-500 to-savor-500 bg-clip-text text-transparent">
              Vibrant Atmospheres
            </span>
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Immerse yourself in handpicked delicacies, rooftop panoramas, and intimate dining spaces verified by our community.
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-savor-600 text-white shadow-md shadow-savor-600/25 scale-105'
                  : 'bg-warm-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-warm-200 dark:hover:bg-zinc-700 border border-warm-200/80 dark:border-zinc-700/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bento / Masonry Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 auto-rows-[220px]">
        {filteredItems.map((item, idx) => {
          const isLiked = likedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => handleCardClick(item, idx)}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 border border-warm-200/70 dark:border-zinc-800 bg-stone-900 ${item.sizeClass} ${item.aspect}`}
              style={{
                animation: `cardReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both`,
                animationDelay: `${idx * 70}ms`,
              }}
            >
              {/* Background Photo with Zoom on Hover */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-black/20 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/40 backdrop-blur-md text-amber-300 border border-white/20 flex items-center gap-1">
                  <Sparkles size={11} />
                  {item.tag}
                </span>

                <button
                  onClick={(e) => toggleLike(item.id, e)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-transform duration-300 cursor-pointer active:scale-90 ${
                    isLiked
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110'
                      : 'bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/20'
                  }`}
                >
                  <Heart size={16} className={isLiked ? 'fill-white' : ''} />
                </button>
              </div>

              {/* Bottom Details Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-5 z-10 space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <Star size={13} className="fill-amber-400" />
                    <span>{item.rating.toFixed(1)}</span>
                    <span className="text-stone-300 font-normal">&bull; {item.category}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center">
                    <ZoomIn size={15} />
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white font-serif line-clamp-1 leading-snug group-hover:text-amber-200 transition-colors">
                  {item.title}
                </h3>

                <div className="flex items-center gap-1 text-[11px] text-stone-300">
                  <MapPin size={12} className="text-savor-400 flex-shrink-0" />
                  <span className="font-semibold text-stone-100">{item.restaurant}</span>
                  <span className="opacity-70 truncate">&mdash; {item.location}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
