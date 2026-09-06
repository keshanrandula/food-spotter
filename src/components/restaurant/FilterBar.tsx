'use client';

import React from 'react';
import { Search, MapPin, Compass, RotateCw } from 'lucide-react';
import { SearchFilters } from '@/types';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (newFilters: SearchFilters) => void;
  onSearchSubmit: (newFilters: SearchFilters) => void;
  onResetFilters: () => void;
  totalResults: number;
}

const TRENDING_TAGS = [
  { label: 'Truffle Pasta', icon: '🔥' },
  { label: 'Omakase', icon: '🍣' },
  { label: 'Wood-Fired Pizza', icon: '🍕' },
  { label: 'Wine Bars', icon: '🍷' },
  { label: 'Organic Farm-to-Table', icon: '🌱' },
];

const CATEGORY_TABS = [
  'All',
  'Michelin Guide',
  'Trending This Week',
  'Hidden Gems',
  'Outdoor Dining',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onSearchSubmit,
  onResetFilters,
  totalResults,
}) => {
  return (
    <div className="space-y-6">
      {/* FLOATING GLASS SEARCH BAR CONTAINER */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-3 sm:p-4 rounded-3xl shadow-xl max-w-4xl mx-auto space-y-3">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit({ ...filters });
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
        >
          {/* Keyword Search */}
          <div className="relative md:col-span-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Cuisine, signature dish, or vibe..."
              value={filters.keyword}
              onChange={(e) => onFilterChange({ ...filters, keyword: e.target.value })}
              className="w-full pl-11 pr-4 py-3.5 bg-stone-100/70 border border-stone-200/80 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-savor-600/30"
            />
          </div>

          {/* Location Input */}
          <div className="relative md:col-span-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-savor-600">
              <MapPin size={18} />
            </div>
            <input
              type="text"
              placeholder="Colombo, Sri Lanka"
              value={filters.location}
              onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
              className="w-full pl-11 pr-10 py-3.5 bg-stone-100/70 border border-stone-200/80 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-savor-600/30"
            />
            <button 
              type="button"
              onClick={onResetFilters}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
              title="Reset location"
            >
              <RotateCw size={16} />
            </button>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-savor-600 hover:bg-savor-700 text-white shadow-md shadow-savor-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search size={16} />
              <span>Find</span>
            </button>
          </div>
        </form>

        {/* Trending Tags Row */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 custom-scrollbar text-xs">
          <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] whitespace-nowrap mr-1">
            TRENDING NOW:
          </span>
          {TRENDING_TAGS.map((tag, idx) => {
            const isSelected = filters.keyword.toLowerCase().includes(tag.label.toLowerCase());
            return (
              <button
                key={idx}
                onClick={() => {
                  const updated = { ...filters, keyword: isSelected ? '' : tag.label };
                  onFilterChange(updated);
                  onSearchSubmit(updated);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-savor-600 text-white shadow-sm'
                    : 'bg-stone-100/80 hover:bg-stone-200/80 text-stone-700 border border-stone-200/60'
                }`}
              >
                <span>{tag.icon}</span>
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TRENDING SPOTS SECTION HEADER & FILTER PILLS */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-6">
        <div>
          <span className="text-[10px] font-bold text-savor-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Compass size={14} className="text-savor-600" /> REAL-TIME PALATE FEED
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif tracking-tight">
            Trending Spots Near You
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Curated based on verified diner sentiment and real-time culinary ratings.
          </p>
        </div>

        {/* Filter Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = (tab === 'All' && !filters.cuisine) || filters.cuisine === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  const updated = { ...filters, cuisine: tab === 'All' ? '' : tab };
                  onFilterChange(updated);
                  onSearchSubmit(updated);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-savor-700 text-white shadow-md'
                    : 'bg-warm-100 hover:bg-warm-200 text-stone-700 border border-warm-200'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
