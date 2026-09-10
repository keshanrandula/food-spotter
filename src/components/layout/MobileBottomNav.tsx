'use client';

import React from 'react';
import { 
  Compass, 
  Map, 
  LayoutGrid, 
  Mic, 
  Camera, 
  UtensilsCrossed, 
  Bookmark, 
  User 
} from 'lucide-react';
import { UserProfile } from '@/types';

interface MobileBottomNavProps {
  activeNav: string;
  onNavigateDiscover: () => void;
  viewMode: 'grid' | 'map';
  onToggleView: () => void;
  onOpenVoiceSearch: () => void;
  onOpenMenuScanner: () => void;
  onOpenReservationsModal: () => void;
  reservationsCount: number;
  onOpenSavedModal: () => void;
  savedCount: number;
  onOpenAuthModal: () => void;
  currentUser: UserProfile | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeNav,
  onNavigateDiscover,
  viewMode,
  onToggleView,
  onOpenVoiceSearch,
  onOpenMenuScanner,
  onOpenReservationsModal,
  reservationsCount,
  onOpenSavedModal,
  savedCount,
  onOpenAuthModal,
  currentUser,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-800/80 px-2 py-1.5 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Discover */}
        <button
          onClick={onNavigateDiscover}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'discover'
              ? 'text-rose-500 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Compass size={20} className={activeNav === 'discover' ? 'text-rose-500 scale-110 transition-transform' : ''} />
          <span className="text-[10px] mt-0.5">Discover</span>
        </button>

        {/* 2. Map / Grid Toggle */}
        <button
          onClick={onToggleView}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          {viewMode === 'grid' ? (
            <Map size={20} className="text-indigo-400" />
          ) : (
            <LayoutGrid size={20} className="text-indigo-400" />
          )}
          <span className="text-[10px] mt-0.5">{viewMode === 'grid' ? 'Map' : 'Grid'}</span>
        </button>

        {/* 3. Central AI Voice / Scanner Action Button */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700/60 rounded-full p-0.5 shadow-lg">
          <button
            onClick={onOpenVoiceSearch}
            className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            title="Voice Search (සිංහල / English)"
          >
            <Mic size={17} />
          </button>
          <button
            onClick={onOpenMenuScanner}
            className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            title="Scan Food / Menu"
          >
            <Camera size={17} />
          </button>
        </div>

        {/* 4. Table Bookings */}
        <button
          onClick={onOpenReservationsModal}
          className="relative flex flex-col items-center justify-center p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <UtensilsCrossed size={20} className="text-amber-400" />
          <span className="text-[10px] mt-0.5">Bookings</span>
          {reservationsCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm">
              {reservationsCount}
            </span>
          )}
        </button>

        {/* 5. Saved Places */}
        <button
          onClick={onOpenSavedModal}
          className="relative flex flex-col items-center justify-center p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <Bookmark size={20} className="text-rose-400" />
          <span className="text-[10px] mt-0.5">Saved</span>
          {savedCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm">
              {savedCount}
            </span>
          )}
        </button>

        {/* 6. Profile / Auth */}
        <button
          onClick={onOpenAuthModal}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          {currentUser ? (
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover border border-rose-500"
            />
          ) : (
            <User size={20} />
          )}
          <span className="text-[10px] mt-0.5">{currentUser ? 'Profile' : 'Sign In'}</span>
        </button>
      </div>
    </div>
  );
};
