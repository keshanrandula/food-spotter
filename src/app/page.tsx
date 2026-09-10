'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Compass, Star, Calendar, UtensilsCrossed, Navigation, Bookmark, User } from 'lucide-react';
import { 
  Restaurant, 
  SavedRestaurant, 
  SearchFilters, 
  UserProfile, 
  TableReservation 
} from '@/types';
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
import { MenuScannerModal } from '@/components/restaurant/MenuScannerModal';
import { VoiceSearchModal } from '@/components/restaurant/VoiceSearchModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { TableBookingModal } from '@/components/restaurant/TableBookingModal';
import { MyReservationsModal } from '@/components/restaurant/MyReservationsModal';
import { RouteNavigationModal } from '@/components/restaurant/RouteNavigationModal';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { geocodeLocationClient, fetchOsmRestaurantsClient } from '@/services/osmClient';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type DataSource = 'osm' | 'server' | 'loading';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [savedItems, setSavedItems] = useState<SavedRestaurant[]>([]);
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<DataSource>('loading');

  // Restaurant Detail & Lightbox state
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  
  // Modals state
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingRestaurant, setBookingRestaurant] = useState<Restaurant | null>(null);
  const [isReservationsModalOpen, setIsReservationsModalOpen] = useState<boolean>(false);
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [navRestaurant, setNavRestaurant] = useState<Restaurant | null>(null);

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

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

  // Initialize User from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('foodspotter_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
    }
  }, []);

  // Fetch initial reservations
  useEffect(() => {
    fetch('/api/reservations')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setReservations(data.data);
        }
      })
      .catch(e => console.warn('Failed to load reservations:', e));
  }, []);

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
  const fetchPlaces = useCallback(async (searchFilters: SearchFilters) => {
    setIsLoading(true);
    setDataSource('loading');

    const kw = searchFilters.keyword.trim();
    const loc = searchFilters.location.trim();
    const radiusMeters = Math.min((searchFilters.radius || 15) * 1000, 25000);

    let lat = searchFilters.userLat;
    let lng = searchFilters.userLng;

    // If a text location is provided and coords are missing or location changed from GPS default
    if (loc && (!lat || !lng || loc.toLowerCase() !== 'my current location')) {
      const geo = await geocodeLocationClient(loc);
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
      }
    }

    // Default to Colombo coordinates if still unavailable
    if (!lat || !lng) {
      lat = 6.9271;
      lng = 79.8450;
    }

    // 1. Try Client-side OpenStreetMap Overpass query
    const osmResults = await fetchOsmRestaurantsClient(lat, lng, kw || '', searchFilters.radius || 15);

    if (osmResults.length > 0) {
      setRestaurants(osmResults);
      setDataSource('osm');
      setIsLoading(false);

      // Async AI enrichment in background
      enrichWithAi(osmResults).then(enriched => {
        setRestaurants(enriched);
      });
      return;
    }

    // 2. Server-side API fallback
    try {
      const params = new URLSearchParams({
        keyword: kw,
        location: loc || 'Colombo, Sri Lanka',
        radius: (searchFilters.radius || 15).toString(),
        minRating: (searchFilters.minRating || 0).toString(),
        priceLevels: searchFilters.priceLevels.join(','),
        cuisine: searchFilters.cuisine || '',
        openNow: searchFilters.openNow ? 'true' : 'false',
        lat: (lat ?? 6.9271).toString(),
        lng: (lng ?? 79.8450).toString(),
      });

      const res = await fetch(`/api/places?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setRestaurants(data.data);
        setDataSource('server');
        return;
      }
    } catch (serverErr) {
      console.warn('Server fallback search failed:', serverErr);
    } finally {
      setIsLoading(false);
    }
  }, [enrichWithAi]);

  // Initial load
  useEffect(() => {
    fetchPlaces(committedFilters);
  }, []);

  // Fetch saved places from database
  useEffect(() => {
    fetch('/api/saved')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setSavedItems(data.data);
        }
      })
      .catch(e => console.warn('Failed to load saved places:', e));
  }, []);

  const handleSearchSubmit = (committed: SearchFilters) => {
    setCommittedFilters(committed);
    fetchPlaces(committed);
  };

  const handleResetFilters = () => {
    setFilters(defaultSearchFilters);
    setCommittedFilters(defaultSearchFilters);
    fetchPlaces(defaultSearchFilters);
  };

  const handleRemoveSaved = async (placeId: string) => {
    try {
      const res = await fetch(`/api/saved?placeId=${placeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSavedItems(prev => prev.filter(i => i.placeId !== placeId));
      }
    } catch (err) {
      console.error('Failed to remove saved restaurant:', err);
    }
  };

  const handleToggleSave = async (restaurant: Restaurant) => {
    const isCurrentlySaved = savedItems.some(i => i.placeId === restaurant.id);
    if (isCurrentlySaved) {
      handleRemoveSaved(restaurant.id);
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
        if (data.success && data.data) {
          setSavedItems(prev => [data.data, ...prev]);
        }
      } catch (err) {
        console.error('Failed to save restaurant:', err);
      }
    }
  };

  const handleGenerateAiSummary = async (restaurant: Restaurant) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: restaurant.name,
          reviews: restaurant.reviews,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const updated = {
          ...restaurant,
          aiSummary: data.data,
          aiReviewSummary: data.data.overallSummary,
        };
        setSelectedRestaurant(updated);
        setRestaurants(prev => prev.map(r => r.id === restaurant.id ? updated : r));
      }
    } catch (err) {
      console.error('AI summary generation failed:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDetailOpen(true);
  };

  const handleOpenBooking = (restaurant: Restaurant) => {
    setBookingRestaurant(restaurant);
    setIsBookingModalOpen(true);
  };

  const handleOpenNavigation = (restaurant: Restaurant) => {
    setNavRestaurant(restaurant);
    setIsNavOpen(true);
  };

  const handleCancelReservation = async (id: string) => {
    try {
      const res = await fetch(`/api/reservations?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
      }
    } catch (err) {
      console.error('Failed to cancel reservation:', err);
    }
  };

  const handleUserLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('foodspotter_user', JSON.stringify(user));
    }
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('foodspotter_user');
    }
  };

  // Filter restaurants based on client criteria
  const displayedRestaurants = restaurants.filter(r => {
    if (committedFilters.minRating > 0 && r.rating < committedFilters.minRating) return false;
    if (committedFilters.priceLevels.length > 0 && !committedFilters.priceLevels.includes(r.priceLevel)) return false;
    if (committedFilters.cuisine && r.cuisine.toLowerCase() !== committedFilters.cuisine.toLowerCase()) return false;
    if (committedFilters.openNow && !r.openNow) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Universal Header */}
      <Header
        savedCount={savedItems.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        viewMode={viewMode}
        onToggleView={() => setViewMode(prev => prev === 'grid' ? 'map' : 'grid')}
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
        onOpenMenuScanner={() => setIsScannerOpen(true)}
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
        currentUser={currentUser}
        reservationsCount={reservations.filter(r => r.status === 'confirmed').length}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenReservationsModal={() => setIsReservationsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8 space-y-12">
        
        {/* Hero & Search Area */}
        <div ref={heroText.ref} className={`transition-all duration-700 ${heroText.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
              AI-Powered Culinary Intelligence
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif text-white">
              Discover & Book Exceptional Restaurants in Sri Lanka
            </h1>
            
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Real-time restaurant exploration, multilingual voice queries, instant menu OCR breakdown, live GPS routing, and VIP table reservations.
            </p>
          </div>

          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onSearchSubmit={handleSearchSubmit}
            onResetFilters={handleResetFilters}
            totalResults={displayedRestaurants.length}
            onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
            onOpenMenuScanner={() => setIsScannerOpen(true)}
          />
        </div>

        {/* Neural Smart Search Quick Banner */}
        <div ref={neuralBanner.ref} className={`transition-all duration-700 delay-100 ${neuralBanner.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <NeuralSearchBanner
            onSelectPrompt={(query: string) => {
              const updated = { ...committedFilters, keyword: query };
              setFilters(updated);
              setCommittedFilters(updated);
              fetchPlaces(updated);
            }}
          />
        </div>

        {/* Dynamic View: Map vs Grid */}
        <section className="space-y-6">
          <div ref={listingHeader.ref} className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold font-serif text-zinc-100">
                  {committedFilters.keyword ? `Search Results for "${committedFilters.keyword}"` : 'Curated Dining Spots'}
                </h2>
                <span className="px-3 py-1 rounded-full bg-zinc-800 text-rose-400 text-xs font-extrabold border border-zinc-700">
                  {displayedRestaurants.length} Places Found
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Near {committedFilters.location} • Sorted by distance & culinary rating
              </p>
            </div>

            {/* View Toggle Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                }`}
              >
                Interactive Map
              </button>
            </div>
          </div>

          {/* Main Display: Map or Grid */}
          {isLoading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto" />
              <h3 className="text-base font-bold text-zinc-300">Discovering Dining Gems...</h3>
              <p className="text-xs text-zinc-500">Querying real-time geo-coordinates and sentiment scores</p>
            </div>
          ) : viewMode === 'map' ? (
            <RestaurantMap
              restaurants={displayedRestaurants}
              selectedRestaurant={selectedRestaurant}
              onSelectRestaurant={handleSelectRestaurant}
              onSummarizeAi={handleGenerateAiSummary}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  isSaved={savedItems.some(i => i.placeId === restaurant.id)}
                  onToggleSave={handleToggleSave}
                  onSelect={handleSelectRestaurant}
                  onSummarizeAi={handleGenerateAiSummary}
                />
              ))}
            </div>
          )}
        </section>

        {/* Visual Culinary Gallery */}
        <GallerySection
          onOpenLightbox={openGallery}
        />

        {/* About Platform */}
        <AboutUsSection />

      </main>

      {/* Universal Footer */}
      <Footer />

      {/* --- ALL POPUPS & MODALS --- */}

      {/* 1. Restaurant Details Modal */}
      <RestaurantDetailModal
        restaurant={selectedRestaurant}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        isSaved={selectedRestaurant ? savedItems.some(i => i.placeId === selectedRestaurant.id) : false}
        onToggleSave={handleToggleSave}
        onGenerateAiSummary={handleGenerateAiSummary}
        isLoadingAi={isLoadingAi}
        onBookTable={(r) => {
          setIsDetailOpen(false);
          handleOpenBooking(r);
        }}
        onOpenLiveRoute={(r) => {
          setIsDetailOpen(false);
          handleOpenNavigation(r);
        }}
      />

      {/* 2. VIP Table Booking & Pre-Order Modal */}
      <TableBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        restaurant={bookingRestaurant}
        currentUser={currentUser}
        onBookingSuccess={(newRes) => {
          setReservations(prev => [newRes, ...prev]);
        }}
      />

      {/* 3. My Reservations History Modal */}
      <MyReservationsModal
        isOpen={isReservationsModalOpen}
        onClose={() => setIsReservationsModalOpen(false)}
        currentUser={currentUser}
        reservations={reservations}
        onCancelReservation={handleCancelReservation}
      />

      {/* 4. Live GPS Turn-by-Turn Navigation Modal */}
      <RouteNavigationModal
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        restaurant={navRestaurant}
        userLat={committedFilters.userLat}
        userLng={committedFilters.userLng}
        userLocationName={committedFilters.location}
      />

      {/* 5. Saved Places & Wishlist Modal */}
      <SavedModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedItems={savedItems}
        onRemoveSaved={handleRemoveSaved}
      />

      {/* 6. AI Vision Menu Scanner Modal */}
      <MenuScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onFindDishNearMe={(dishName: string) => {
          setIsScannerOpen(false);
          const updated = { ...committedFilters, keyword: dishName };
          setFilters(updated);
          setCommittedFilters(updated);
          fetchPlaces(updated);
        }}
      />

      {/* 7. Sinhala / Singlish Multilingual Voice Query Modal */}
      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onApplyVoiceSearch={(res) => {
          const updated: SearchFilters = {
            ...filters,
            keyword: res.keyword || filters.keyword,
            location: res.location || filters.location,
            cuisine: res.cuisine || filters.cuisine,
          };
          setFilters(updated);
          setCommittedFilters(updated);
          fetchPlaces(updated);
        }}
        onAskChefAi={(q) => {
          setIsVoiceSearchOpen(false);
          // Handled by Chef AI floating widget
        }}
      />

      {/* 8. User Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleUserLogin}
        onLogout={handleUserLogout}
      />

      {/* 9. Lightbox Photo Gallery Modal */}
      <PhotoGalleryModal
        photos={galleryPhotos}
        initialIndex={galleryIndex}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        restaurantName={galleryRestaurantName}
      />

      {/* 10. AI Chef Concierge Chatbot Floating Widget */}
      <ChefAiChatbot
        restaurants={restaurants}
        onSelectRestaurant={handleSelectRestaurant}
      />

      {/* 11. Mobile Bottom Dock Navigation Bar */}
      <MobileBottomNav
        activeNav={activeNav}
        onNavigateDiscover={() => {
          setActiveNav('discover');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        viewMode={viewMode}
        onToggleView={() => setViewMode(prev => prev === 'grid' ? 'map' : 'grid')}
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
        onOpenMenuScanner={() => setIsScannerOpen(true)}
        onOpenReservationsModal={() => setIsReservationsModalOpen(true)}
        reservationsCount={reservations.filter(r => r.status === 'confirmed').length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        savedCount={savedItems.length}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
      />

    </div>
  );
}
