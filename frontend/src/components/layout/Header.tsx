'use client';

import React, { useState } from 'react';
import { UtensilsCrossed, Plus, User, Sparkles } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenSavedModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ savedCount, onOpenSavedModal }) => {
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setActiveToast(message);
    setTimeout(() => setActiveToast(null), 3000);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-warm-200/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-savor-600 flex items-center justify-center shadow-md shadow-savor-600/20 text-white group-hover:scale-105 transition-transform">
            <UtensilsCrossed size={20} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-stone-900 font-serif">
            Savor<span className="font-sans font-extrabold text-savor-600">AI</span>
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-warm-100/80 p-1.5 rounded-full border border-warm-200/60">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-savor-600 text-white shadow-sm transition-all cursor-pointer"
          >
            Discover
          </button>
          <button 
            onClick={() => showToast('Explore Top Cuisines: Italian, Japanese, Sri Lankan & Woodfired')}
            className="px-4 py-2 rounded-full text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-warm-200/50 transition-all cursor-pointer"
          >
            Cuisines
          </button>
          <button 
            onClick={() => showToast('Curated Lists: Top Michelin & Trending Spots 2026')}
            className="px-4 py-2 rounded-full text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-warm-200/50 transition-all cursor-pointer"
          >
            Curated Lists
          </button>
          <button
            onClick={onOpenSavedModal}
            className="px-4 py-2 rounded-full text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-warm-200/50 transition-all cursor-pointer flex items-center gap-1.5"
          >
            Saved Spots
            {savedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-savor-600 text-white text-[10px] font-bold flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => showToast('Sign In feature active in Epicurean Member Portal')}
            className="hidden sm:inline-block text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors cursor-pointer px-3 py-2"
          >
            Sign In
          </button>
          <button 
            onClick={() => showToast('Add Restaurant submitted for AI verification!')}
            className="px-4 py-2.5 rounded-full text-xs font-semibold bg-savor-600 hover:bg-savor-700 text-white shadow-md shadow-savor-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Plus size={14} /> Add Restaurant
          </button>
          <button 
            onClick={() => showToast('Member Profile: Epicurean Palate Level 4')}
            className="w-9 h-9 rounded-full bg-warm-200/80 hover:bg-warm-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer border border-warm-300/60 active:scale-95"
          >
            <User size={16} />
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-2 animate-slideUp">
          <Sparkles size={14} className="text-amber-400" />
          <span>{activeToast}</span>
        </div>
      )}
    </header>
  );
};
