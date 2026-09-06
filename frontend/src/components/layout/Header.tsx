'use client';

import React, { useState } from 'react';
import { UtensilsCrossed, Plus, User, Sparkles, Image as ImageIcon, Info, Bookmark, Compass } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenSavedModal: () => void;
  activeNav?: string;
  onNavigateDiscover?: () => void;
  onNavigateGallery?: () => void;
  onNavigateAbout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSavedModal,
  activeNav = 'discover',
  onNavigateDiscover,
  onNavigateGallery,
  onNavigateAbout,
}) => {
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setActiveToast(message);
    setTimeout(() => setActiveToast(null), 3000);
  };

  const handleDiscoverClick = () => {
    if (onNavigateDiscover) {
      onNavigateDiscover();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGalleryClick = () => {
    if (onNavigateGallery) {
      onNavigateGallery();
    } else {
      document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAboutClick = () => {
    if (onNavigateAbout) {
      onNavigateAbout();
    } else {
      document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navBase = "px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5";
  const navActive = "bg-savor-600 text-white shadow-md shadow-savor-600/20";
  const navInactive = "text-stone-700 hover:text-stone-900 hover:bg-warm-200/60";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-warm-200/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={handleDiscoverClick}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-savor-600 flex items-center justify-center shadow-md shadow-savor-600/25 text-white group-hover:scale-105 group-hover:bg-savor-700 transition-all">
            <UtensilsCrossed size={20} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-stone-900 font-serif">
            Food<span className="font-sans font-extrabold text-savor-600">Spotter</span>
          </span>
        </div>

        {/* Center Navigation Links: Discover | Gallery | About Us | Saved Spots */}
        <nav className="hidden md:flex items-center gap-1 bg-warm-100/90 p-1.5 rounded-full border border-warm-200/80 shadow-inner">
          <button 
            onClick={handleDiscoverClick}
            className={`${navBase} ${activeNav === 'discover' ? navActive : navInactive}`}
          >
            <Compass size={14} />
            <span>Discover</span>
          </button>

          <button 
            onClick={handleGalleryClick}
            className={`${navBase} ${activeNav === 'gallery' ? navActive : navInactive}`}
          >
            <ImageIcon size={14} />
            <span>Gallery</span>
          </button>

          <button 
            onClick={handleAboutClick}
            className={`${navBase} ${activeNav === 'about' ? navActive : navInactive}`}
          >
            <Info size={14} />
            <span>About Us</span>
          </button>

          <button
            onClick={onOpenSavedModal}
            className={`${navBase} ${activeNav === 'saved' ? navActive : navInactive}`}
          >
            <Bookmark size={14} />
            <span>Saved Spots</span>
            {savedCount > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-savor-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => showToast('Sign In feature active in Member Portal')}
            className="hidden sm:inline-block text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors cursor-pointer px-3 py-2"
          >
            Sign In
          </button>
          <button 
            onClick={() => showToast('Add Restaurant form submitted for AI verification!')}
            className="px-4 py-2.5 rounded-full text-xs font-bold bg-savor-600 hover:bg-savor-700 text-white shadow-md shadow-savor-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Plus size={14} /> Add Restaurant
          </button>
          <button 
            onClick={() => showToast('FoodSpotter Epicurean Member Level 5')}
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
