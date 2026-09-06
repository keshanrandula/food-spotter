'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Star, Calendar, UtensilsCrossed, MapPin } from 'lucide-react';
import { Restaurant, SavedRestaurant, SearchFilters } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FilterBar } from '@/components/restaurant/FilterBar';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { RestaurantDetailModal } from '@/components/restaurant/RestaurantDetailModal';
import { SavedModal } from '@/components/restaurant/SavedModal';
import { NeuralSearchBanner } from '@/components/restaurant/NeuralSearchBanner';
import { GallerySection } from '@/components/restaurant/GallerySection';
import { AboutUsSection } from '@/components/restaurant/AboutUsSection';
import { PhotoGalleryModal } from '@/components/restaurant/PhotoGalleryModal';
import { getSavedPlaces, savePlace, deleteSavedPlace, getPlaces } from '@/services/api';
import { searchRestaurants } from '@/services/googleApi';

const DEFAULT_FILTERS: SearchFilters = {
  keyword: '',
  location: 'Colombo, Sri Lanka',
  radius: 15,
  minRating: 0,
  priceLevels: [],
  cuisine: '',
  openNow: false,
  userLat: 6.9271,
  userLng: 79.8450,
};

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [savedItems, setSavedItems] = useState<SavedRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [locationReady, setLocationReady] = useState<boolean>(false);
  const [locationDenied, setLocationDenied] = useState<boolean>(false);

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);

  // Active navigation tab
  const [activeNav, setActiveNav] = useState<string>('discover');

  // Photo Gallery Lightbox state
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryTitle, setGalleryTitle] = useState<string>('');
  const [galleryIndex, setGalleryIndex] = useState<number>(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  const openLightbox = (photos: string[], title: string, startIndex = 0) => {
    setGalleryPhotos(photos);
    setGalleryTitle(title);
    setGalleryIndex(startIndex);
    setIsGalleryOpen(true);
  };

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  // Request geolocation once on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFilters(prev => ({
            ...prev,
            userLat: pos.coords.latitude,
            userLng: pos.coords.longitude,
            location: 'My Current Location',
          }));
          setLocationReady(true);
        },
        () => {
          setLocationDenied(true);
          setLocationReady(true);
        },
        { timeout: 6000 }
      );
    } else {
      setLocationReady(true);
    }
  }, []);

  const handleUseMyLocation = () => {
    if (!('geolocation' in navigator)) return;
    setLocationDenied(false);
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFilters(prev => ({
          ...prev,
          userLat: pos.coords.latitude,
          userLng: pos.coords.longitude,
          location: 'My Current Location',
        }));
      },
      () => setLocationDenied(true),
      { timeout: 8000 }
    );
  };

  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    let data = await getPlaces(filters);
    if (!data || data.length === 0) {
      data = await searchRestaurants(filters);
    }
    setRestaurants(data);
    setIsLoading(false);
  }, [filters]);

  const fetchSaved = useCallback(async () => {
    const data = await getSavedPlaces();
    setSavedItems(data);
  }, []);

  useEffect(() => {
    if (!locationReady) return;
    fetchPlaces();
  }, [fetchPlaces, locationReady]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleGenerateAiSummary = async (restaurant: Restaurant) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: restaurant.name,
          reviews: restaurant.reviews,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const updated = { ...restaurant, aiSummary: data.data };
        setSelectedRestaurant(updated);
        setRestaurants(prev => prev.map(r => r.id === restaurant.id ? updated : r));
      }
    } catch (err) {
      console.error('Failed to summarize reviews:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleOpenAiModal = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDetailOpen(true);
    if (!restaurant.aiSummary) {
      await handleGenerateAiSummary(restaurant);
    }
  };

  const handleToggleSave = async (restaurant: Restaurant) => {
    const isAlreadySaved = savedItems.some(i => i.placeId === restaurant.id);
    if (isAlreadySaved) {
      await deleteSavedPlace(restaurant.id);
      setSavedItems(prev => prev.filter(i => i.placeId !== restaurant.id));
    } else {
      const saved = await savePlace(restaurant);
      if (saved) {
        setSavedItems(prev => [saved, ...prev]);
      }
    }
  };

  const handleRemoveSavedItem = async (placeId: string) => {
    await deleteSavedPlace(placeId);
    setSavedItems(prev => prev.filter(i => i.placeId !== placeId));
  };

  const isRestaurantSaved = (id: string) => savedItems.some(item => item.placeId === id);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header
        savedCount={savedItems.length}
        onOpenSavedModal={() => { setIsSavedModalOpen(true); setActiveNav('saved'); }}
        activeNav={activeNav}
        onNavigateDiscover={() => {
          setActiveNav('discover');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateGallery={() => {
          setActiveNav('gallery');
          document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onNavigateAbout={() => {
          setActiveNav('about');
          document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* HERO SECTION */}
      <section id="hero-section" className="relative w-full bg-gradient-to-b from-stone-900 via-stone-900/90 to-background text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-35 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80"
            alt="Warm Dining Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/40 to-background z-0" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-stone-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} className="text-savor-500" />
            NEXT-GEN CULINARY DISCOVERY ENGINE
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight font-serif">
            Discover Exceptional Dining <br />
            <span className="bg-gradient-to-r from-savor-500 via-amber-400 to-savor-600 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Real-time menus, sentiment analysis, and dish recommendations tailored to your exact taste.
          </p>

          {/* Location denied notice */}
          {locationDenied && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold backdrop-blur-md">
              <MapPin size={13} />
              <span>Location access denied — showing results for Colombo, Sri Lanka.</span>
              <button
                onClick={handleUseMyLocation}
                className="ml-2 underline underline-offset-2 hover:text-white transition-colors cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          <div className="pt-4">
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={() => setFilters(DEFAULT_FILTERS)}
              onUseMyLocation={handleUseMyLocation}
              totalResults={restaurants.length}
            />
          </div>
        </div>
      </section>

      {/* METRICS STAT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 w-full">
        <div className="bg-white border border-warm-200 rounded-3xl p-6 sm:p-8 shadow-savor grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 border-r border-warm-200/60 last:border-r-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">12,000+</div>
            <div className="text-xs text-stone-500 font-medium">Curated Epicurean Spots</div>
          </div>
          <div className="space-y-1 border-r border-warm-200/60 last:border-r-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif flex items-center justify-center gap-1">
              4.8 <Star size={18} className="fill-amber-400 text-amber-400" />
            </div>
            <div className="text-xs text-stone-500 font-medium">Community Verified Palates</div>
          </div>
          <div className="space-y-1 border-r border-warm-200/60 last:border-r-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">3.2M</div>
            <div className="text-xs text-stone-500 font-medium">Dishes Analyzed by AI</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-savor-600 font-serif flex items-center justify-center gap-1">
              <Calendar size={22} className="text-savor-600" /> Instant
            </div>
            <div className="text-xs text-stone-500 font-medium">VIP Table Bookings</div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-white border border-warm-200 animate-pulse p-4 space-y-4">
                <div className="h-48 bg-stone-200 rounded-2xl" />
                <div className="h-6 bg-stone-200 rounded w-3/4" />
                <div className="h-4 bg-stone-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-warm-200 space-y-4 shadow-sm">
            <UtensilsCrossed size={40} className="text-stone-400 mx-auto" />
            <h3 className="text-lg font-bold text-stone-900 font-serif">No Culinary Matches Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              We couldn't find restaurants matching your search filters. Try searching for "Pasta", "Sushi", or "Truffle".
            </p>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-savor-600 text-white shadow-sm"
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onSelect={(rest) => {
                  setSelectedRestaurant(rest);
                  setIsDetailOpen(true);
                }}
                onSummarizeAi={handleOpenAiModal}
                onToggleSave={handleToggleSave}
                isSaved={isRestaurantSaved(restaurant.id)}
              />
            ))}
          </div>
        )}

        {/* NEURAL SEARCH PROMPT BANNER */}
        <NeuralSearchBanner
          onSelectPrompt={(prompt) => {
            setFilters(prev => ({ ...prev, keyword: prompt }));
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
        />

        {/* INTERACTIVE ANIMATED GALLERY SECTION */}
        <GallerySection onOpenLightbox={openLightbox} />

        {/* ABOUT US SECTION */}
        <AboutUsSection />
      </main>

      <Footer />

      {/* RESTAURANT DETAIL MODAL */}
      <RestaurantDetailModal
        restaurant={selectedRestaurant}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        isSaved={selectedRestaurant ? isRestaurantSaved(selectedRestaurant.id) : false}
        onToggleSave={handleToggleSave}
        onGenerateAiSummary={handleGenerateAiSummary}
        isLoadingAi={isLoadingAi}
      />

      {/* SAVED MODAL */}
      <SavedModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedItems={savedItems}
        onRemoveSaved={handleRemoveSavedItem}
      />

      {/* PHOTO LIGHTBOX MODAL */}
      <PhotoGalleryModal
        photos={galleryPhotos}
        restaurantName={galleryTitle}
        isOpen={isGalleryOpen}
        initialIndex={galleryIndex}
        onClose={() => setIsGalleryOpen(false)}
      />
    </div>
  );
}
