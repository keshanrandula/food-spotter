'use client';

import React, { useState } from 'react';
import { UtensilsCrossed, Plus, User, Sun, Moon, LayoutGrid, Map, X, Send, Utensils } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

interface HeaderProps {
  savedCount: number;
  onOpenSavedModal: () => void;
  viewMode?: 'grid' | 'map';
  onToggleView?: () => void;
  activeNav?: string;
  onNavigateDiscover?: () => void;
  onNavigateCuisines?: () => void;
  onNavigateCurated?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSavedModal,
  viewMode = 'grid',
  onToggleView,
  activeNav = 'discover',
  onNavigateDiscover,
  onNavigateCuisines,
  onNavigateCurated,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', location: '', cuisine: '', phone: '', website: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsAddModalOpen(false);
      setAddForm({ name: '', location: '', cuisine: '', phone: '', website: '' });
    }, 2000);
  };

  const nb = 'px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer';
  const nbActive = 'bg-savor-600 text-white shadow-sm';
  const nbInactive = 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-warm-200/50 dark:hover:bg-white/10';

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full backdrop-blur-md border-b shadow-sm transition-all duration-300"
        style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--header-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button onClick={onNavigateDiscover} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-savor-600 flex items-center justify-center shadow-md shadow-savor-600/20 text-white group-hover:bg-savor-700 transition-colors">
              <UtensilsCrossed size={20} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif">
              Savor<span className="font-sans font-extrabold text-savor-600">AI</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1.5 bg-warm-100/80 dark:bg-white/5 p-1.5 rounded-full border border-warm-200/60 dark:border-white/10">
            <button onClick={onNavigateDiscover} className={`${nb} ${activeNav === 'discover' ? nbActive : nbInactive}`}>Discover</button>
            <button onClick={onNavigateCuisines} className={`${nb} ${activeNav === 'cuisines' ? nbActive : nbInactive}`}>Cuisines</button>
            <button onClick={onNavigateCurated} className={`${nb} ${activeNav === 'curated' ? nbActive : nbInactive}`}>Curated Lists</button>
            <button onClick={onOpenSavedModal} className={`${nb} ${activeNav === 'saved' ? nbActive : nbInactive} flex items-center gap-1.5`}>
              Saved Spots
              {savedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-savor-600 text-white text-[10px] font-bold flex items-center justify-center">{savedCount}</span>
              )}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {onToggleView && (
              <button onClick={onToggleView} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-warm-100 dark:bg-white/5 hover:bg-warm-200 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300 border border-warm-200 dark:border-white/10 transition-all cursor-pointer">
                {viewMode === 'grid' ? <Map size={15} /> : <LayoutGrid size={15} />}
                <span className="hidden sm:inline">{viewMode === 'grid' ? 'Map View' : 'Grid View'}</span>
              </button>
            )}
            <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border bg-warm-100 dark:bg-white/5 hover:bg-warm-200 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200 border-warm-200 dark:border-white/10">
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2.5 rounded-full text-xs font-semibold bg-savor-600 hover:bg-savor-700 text-white shadow-md shadow-savor-600/20 flex items-center gap-1.5 transition-all cursor-pointer">
              <Plus size={14} /> <span className="hidden sm:inline">Add Restaurant</span>
            </button>
            <button className="w-9 h-9 rounded-full bg-warm-200/80 dark:bg-white/5 hover:bg-warm-300 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer border border-warm-300/60 dark:border-white/10">
              <User size={16} />
            </button>
          </div>
        </div>
      </header>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={() => setIsAddModalOpen(false)}>
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-8 animate-slideUp border border-warm-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer">
              <X size={16} className="text-stone-500 dark:text-stone-400" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-savor-600 flex items-center justify-center text-white shadow-md shadow-savor-600/20"><Utensils size={18} /></div>
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif">Add Your Restaurant</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Submit your restaurant to our culinary directory</p>
              </div>
            </div>
            {submitted ? (
              <div className="py-10 text-center space-y-3 animate-fadeIn">
                <div className="text-4xl">🎉</div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Thank you!</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Your restaurant has been submitted for review.</p>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Restaurant Name *</label>
                  <input required type="text" placeholder="e.g. The Cinnamon Grand" value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-savor-600/30 transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Location / Address *</label>
                  <input required type="text" placeholder="e.g. Colombo 03, Sri Lanka" value={addForm.location} onChange={e => setAddForm(p => ({ ...p, location: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-savor-600/30 transition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Cuisine Type</label>
                    <input type="text" placeholder="e.g. Sri Lankan" value={addForm.cuisine} onChange={e => setAddForm(p => ({ ...p, cuisine: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-savor-600/30 transition" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Phone Number</label>
                    <input type="tel" placeholder="+94 11 234 5678" value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-savor-600/30 transition" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Website (optional)</label>
                  <input type="url" placeholder="https://yourrestaurant.lk" value={addForm.website} onChange={e => setAddForm(p => ({ ...p, website: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-savor-600/30 transition" />
                </div>
                <button type="submit" className="w-full py-3.5 rounded-2xl bg-savor-600 hover:bg-savor-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-savor-600/20 cursor-pointer mt-2">
                  <Send size={15} /> Submit Restaurant
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
