'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Compass, Star, Calendar, UtensilsCrossed } from 'lucide-react';
import { Restaurant, SavedRestaurant, SearchFilters } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FilterBar } from '@/components/restaurant/FilterBar';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { RestaurantDetailModal } from '@/components/restaurant/RestaurantDetailModal';
import { SavedModal } from '@/components/restaurant/SavedModal';
import { NeuralSearchBanner } from '@/components/restaurant/NeuralSearchBanner';
import { ChefAiChatbot } from '@/components/restaurant/ChefAiChatbot';
import { RestaurantMap } from '@/components/restaurant/RestaurantMap';
import { PhotoGalleryModal } from '@/components/restaurant/PhotoGalleryModal';
import { GallerySection } from '@/components/restaurant/GallerySection';
import { AboutUsSection } from '@/components/restaurant/AboutUsSection';
import { geocodeLocationClient, fetchOsmRestaurantsClient } from '@/services/osmClient';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type DataSource = 'osm' | 'server' | 'loading';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [savedItems, setSavedItems] = useState<SavedRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<DataSource>('loading');

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);

  // View mode: grid or map
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [activeNav, setActiveNav] = useState<string>('discover');

  // Photo gallery lightbox state
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryRestaurantName, setGalleryRestaurantName] = useState('');

  const openGallery = (photos: string[], name: string, startIndex = 0) => {
    setGalleryPhotos(photos);
    setGalleryRestaurantName(name);
    setGalleryIndex(startIndex);
    setIsGalleryOpen(true);
  };

  const defaultSearchFilters: SearchFilters = {
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

  // Draft filters — updated on every input change (does NOT trigger search)
  const [filters, setFilters] = useState<SearchFilters>(defaultSearchFilters);

  // Committed filters — only updated when user explicitly submits search
  const [committedFilters, setCommittedFilters] = useState<SearchFilters>(defaultSearchFilters);

  // --- Scroll Reveal refs ---
  const statBanner    = useScrollReveal({ threshold: 0.1 });
  const heroText      = useScrollReveal({ threshold: 0.05 });
  const listingHeader = useScrollReveal({ threshold: 0.1 });
  const neuralBanner  = useScrollReveal({ threshold: 0.1 });

  // Get user's GPS location on first load
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
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  /**
   * AI-enrich a batch of restaurants via /api/places (POST) with pre-fetched data.
   */
  const enrichWithAi = useCallback(async (rawRestaurants: Restaurant[]): Promise<Restaurant[]> => {
    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurants: rawRestaurants }),
      });
      if (!res.ok) return rawRestaurants;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) return data.data;
    } catch (e) {
      console.warn('AI enrichment failed:', e);
    }
    return rawRestaurants;
  }, []);

  /**
   * Main search: first tries client-side OSM, falls back to server-side /api/places GET.
   */
  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    setDataSource('loading');

    let resolvedLat = committedFilters.userLat || 6.9271;
    let resolvedLng = committedFilters.userLng || 79.8450;

    // 1. Client-side geocode the location string
    if (committedFilters.location && committedFilters.location !== 'My Current Location') {
      const geo = await geocodeLocationClient(committedFilters.location);
      if (geo) {
        resolvedLat = geo.lat;
        resolvedLng = geo.lng;
      }
    }

    // 2. Try client-side OpenStreetMap Overpass fetch
    const kw = committedFilters.keyword || committedFilters.cuisine || 'restaurant';
    let osmResults: Restaurant[] = [];
    try {
      osmResults = await fetchOsmRestaurantsClient(resolvedLat, resolvedLng, kw, committedFilters.radius || 15);
    } catch (e) {
      console.warn('[OSM] Client fetch error:', e);
    }

    if (osmResults.length > 0) {
      // Got real OSM data — enrich with AI summaries
      setDataSource('osm');
      const enriched = await enrichWithAi(osmResults);
      let filtered = enriched;
      if (committedFilters.minRating > 0) filtered = filtered.filter(r => r.rating >= committedFilters.minRating);
      if (committedFilters.priceLevels.length > 0) filtered = filtered.filter(r => committedFilters.priceLevels.includes(r.priceLevel));
      if (committedFilters.openNow) filtered = filtered.filter(r => r.openNow);
      setRestaurants(filtered);
      setIsLoading(false);
      return;
    }

    // 3. Fall back to server-side /api/places GET
    setDataSource('server');
    try {
      const queryParams = new URLSearchParams({
        keyword: kw,
        location: committedFilters.location,
        radius: committedFilters.radius.toString(),
        minRating: committedFilters.minRating.toString(),
        priceLevels: committedFilters.priceLevels.join(','),
        cuisine: committedFilters.cuisine,
        openNow: committedFilters.openNow.toString(),
        lat: resolvedLat.toString(),
        lng: resolvedLng.toString(),
      });
      const res = await fetch(`/api/places?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRestaurants(data.data);
      }
    } catch (err) {
      console.error('Server-side fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [committedFilters, enrichWithAi]);

  // Fetch saved items
  const fetchSaved = useCallback(async () => {
    try {
      const res = await fetch('/api/saved');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setSavedItems(data.data);
    } catch (err) {}
  }, []);

  useEffect(() => { fetchPlaces(); }, [fetchPlaces]);
  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  // Trigger AI Summary Generation for a restaurant
  const handleGenerateAiSummary = async (restaurant: Restaurant) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantName: restaurant.name, reviews: restaurant.reviews }),
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
      try {
        await fetch(`/api/saved?placeId=${restaurant.id}`, { method: 'DELETE' });
        setSavedItems(prev => prev.filter(i => i.placeId !== restaurant.id));
      } catch (err) {}
    } else {
      try {
        const res = await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placeId: restaurant.id,
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            rating: restaurant.rating,
            priceLevel: restaurant.priceLevel,
            address: restaurant.address,
            photoUrl: restaurant.photos[0] || '',
            tags: restaurant.tags,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) setSavedItems(prev => [data.data, ...prev]);
      } catch (err) {}
    }
  };

  const handleRemoveSavedItem = async (placeId: string) => {
    try {
      await fetch(`/api/saved?placeId=${placeId}`, { method: 'DELETE' });
      setSavedItems(prev => prev.filter(i => i.placeId !== placeId));
    } catch (err) {}
  };

  const isRestaurantSaved = (id: string) => savedItems.some(item => item.placeId === id);

  const handleSearchSubmit = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCommittedFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(defaultSearchFilters);
    setCommittedFilters(defaultSearchFilters);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header
        savedCount={savedItems.length}
        onOpenSavedModal={() => { setIsSavedModalOpen(true); setActiveNav('saved'); }}
        viewMode={viewMode}
        onToggleView={() => setViewMode(v => v === 'grid' ? 'map' : 'grid')}
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

        <div
          ref={heroText.ref}
          className={`relative z-10 max-w-5xl mx-auto text-center space-y-6 pt-4 reveal-fade-up ${heroText.isVisible ? 'reveal-visible' : ''}`}
        >
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
            Real-time restaurant discovery via OpenStreetMap & AI-powered review insights.
          </p>

          <div id="filter-section" className="pt-4">
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onSearchSubmit={handleSearchSubmit}
              onResetFilters={handleResetFilters}
              totalResults={restaurants.length}
            />
          </div>
        </div>
      </section>

      {/* METRICS STAT BANNER */}
      <section
        ref={statBanner.ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 w-full reveal-fade-up ${statBanner.isVisible ? 'reveal-visible' : ''}`}
      >
        <div className="bg-white dark:bg-zinc-900 border border-warm-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-savor grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Data source status badge */}
        {!isLoading && (
          <div
            ref={listingHeader.ref}
            className={`flex items-center gap-2 reveal-fade-left ${listingHeader.isVisible ? 'reveal-visible' : ''}`}
          >
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${dataSource === 'osm' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              <span className={`w-2 h-2 rounded-full ${dataSource === 'osm' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              {dataSource === 'osm' ? '🗺️ Live OpenStreetMap Data — Real Places Near You' : '📚 Curated Restaurant Data'}
            </span>
            <span className="text-xs text-stone-400">{restaurants.length} results</span>
          </div>
        )}

        {/* RESTAURANT LISTINGS */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-white dark:bg-zinc-900 border border-warm-200 dark:border-zinc-800 animate-pulse p-4 space-y-4">
                <div className="h-48 bg-stone-200 dark:bg-zinc-800 rounded-2xl" />
                <div className="h-6 bg-stone-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-stone-200 dark:bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-warm-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <UtensilsCrossed size={40} className="text-stone-400 mx-auto" />
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">No Culinary Matches Found</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              We couldn't find restaurants matching your search. Try a different city or keyword.
            </p>
            <button
              onClick={() => setFilters(defaultSearchFilters)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-savor-600 text-white shadow-sm"
            >
              Reset Search Filters
            </button>
          </div>
        ) : viewMode === 'map' ? (
          <RestaurantMap
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={(rest) => {
              setSelectedRestaurant(rest);
              setIsDetailOpen(true);
            }}
            onSummarizeAi={handleOpenAiModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {restaurants.map((restaurant, idx) => (
              <div
                key={restaurant.id}
                style={{
                  animation: `cardReveal 0.55s cubic-bezier(0.16, 1, 0.3, 1) both`,
                  animationDelay: `${idx * 80}ms`,
                }}
              >
                <RestaurantCard
                  restaurant={restaurant}
                  onSelect={(rest) => {
                    setSelectedRestaurant(rest);
                    setIsDetailOpen(true);
                  }}
                  onSummarizeAi={handleOpenAiModal}
                  onToggleSave={handleToggleSave}
                  isSaved={isRestaurantSaved(restaurant.id)}
                  onOpenGallery={(photos, name, i) => openGallery(photos, name, i)}
                />
              </div>
            ))}
          </div>
        )}

        {/* NEURAL SEARCH PROMPT BANNER */}
        <div
          ref={neuralBanner.ref}
          className={`reveal-zoom ${neuralBanner.isVisible ? 'reveal-visible' : ''}`}
        >
          <NeuralSearchBanner
            onSelectPrompt={(prompt) => {
              const updated = { ...filters, keyword: prompt };
              setFilters(updated);
              setCommittedFilters(updated);
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
          />
        </div>

        {/* INTERACTIVE ANIMATED GALLERY */}
        <GallerySection onOpenLightbox={openGallery} />

        {/* ABOUT US SECTION */}
        <AboutUsSection />
      </main>

      <Footer />

      {/* DETAIL MODAL */}
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

      {/* CHEF AI CHATBOT */}
      <ChefAiChatbot
        restaurants={restaurants}
        onSelectRestaurant={(rest) => {
          setSelectedRestaurant(rest);
          setIsDetailOpen(true);
        }}
      />

      {/* PHOTO GALLERY LIGHTBOX */}
      <PhotoGalleryModal
        photos={galleryPhotos}
        restaurantName={galleryRestaurantName}
        isOpen={isGalleryOpen}
        initialIndex={galleryIndex}
        onClose={() => setIsGalleryOpen(false)}
      />
    </div>
  );
}
