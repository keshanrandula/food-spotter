'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Phone, 
  Sparkles, 
  Utensils, 
  Compass, 
  LocateFixed, 
  Layers, 
  Maximize2,
  Minimize2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [mapTileStyle, setMapTileStyle] = useState<'dark' | 'streets'>('dark');
  const [hoveredRestaurant, setHoveredRestaurant] = useState<Restaurant | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize map instance if not already created
      if (!mapInstanceRef.current) {
        const initialLat = selectedRestaurant?.lat || restaurants[0]?.lat || 6.9271;
        const initialLng = selectedRestaurant?.lng || restaurants[0]?.lng || 79.8450;

        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
        });

        // Add Zoom Control to top-right
        L.control.zoom({ position: 'topright' }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing tile layers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      // Add Tile Layer based on chosen style (CartoDB Dark Matter vs Standard OpenStreetMap)
      const tileUrl = mapTileStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker: any) => marker.remove());
      markersRef.current = {};

      if (restaurants.length === 0) return;

      const bounds = L.latLngBounds([]);

      // Create Custom Interactive HTML Markers
      restaurants.forEach((rest) => {
        const isSelected = selectedRestaurant?.id === rest.id;
        const isHovered = hoveredRestaurant?.id === rest.id;
        const lat = rest.lat || 6.9271;
        const lng = rest.lng || 79.8450;

        bounds.extend([lat, lng]);

        // Custom HTML Pin
        const customIcon = L.divIcon({
          className: 'custom-restaurant-pin',
          html: `
            <div class="relative group cursor-pointer" style="transform: translate(-50%, -100%);">
              <div class="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl shadow-xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-rose-600 text-white border-white scale-125 z-40 shadow-rose-500/50'
                  : 'bg-zinc-900/95 hover:bg-zinc-800 text-zinc-100 border-zinc-700 hover:border-rose-500 hover:scale-110'
              }">
                <span class="text-xs">🍴</span>
                <span class="text-xs font-extrabold pr-0.5">${rest.rating.toFixed(1)}</span>
                <span class="text-[10px] opacity-75 font-semibold text-rose-300">★</span>
              </div>
              ${
                isSelected
                  ? '<div class="absolute -inset-1 rounded-2xl bg-rose-500/30 animate-ping pointer-events-none"></div>'
                  : ''
              }
              <div class="w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700 rotate-45 mx-auto -mt-1 ${
                isSelected ? 'bg-rose-600 border-white' : ''
              }"></div>
            </div>
          `,
          iconSize: [60, 36],
          iconAnchor: [30, 36],
        });

        // Popup Content
        const popupHtml = `
          <div style="width: 240px; font-family: inherit;">
            <div style="position: relative; height: 110px; overflow: hidden; border-top-left-radius: 16px; border-top-right-radius: 16px;">
              <img src="${rest.photos[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}" style="width: 100%; height: 100%; object-fit: cover;" alt="${rest.name}" />
              <div style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; color: #fda4af;">
                ${rest.cuisine}
              </div>
              <div style="position: absolute; top: 8px; right: 8px; background: #e11d48; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: bold; color: white;">
                ${rest.priceString}
              </div>
            </div>
            <div style="padding: 12px; background: #18181b;">
              <h4 style="margin: 0; font-size: 13px; font-weight: bold; color: #f4f4f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${rest.name}
              </h4>
              <p style="margin: 4px 0 8px 0; font-size: 11px; color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                📍 ${rest.address}
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: bold; color: #fbbf24;">
                <span>★ ${rest.rating.toFixed(1)} (${rest.userRatingsTotal} reviews)</span>
                <span style="color: ${rest.openNow ? '#34d399' : '#f87171'}; font-size: 10px;">${rest.openNow ? 'Open Now' : 'Closed'}</span>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupHtml, { closeButton: false, offset: [0, -28] });

        marker.on('click', () => {
          onSelectRestaurant(rest);
        });

        marker.on('mouseover', () => {
          setHoveredRestaurant(rest);
        });

        markersRef.current[rest.id] = marker;
      });

      // Fit map to show all pins nicely
      if (bounds.isValid() && !selectedRestaurant) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else if (selectedRestaurant) {
        map.flyTo([selectedRestaurant.lat || 6.9271, selectedRestaurant.lng || 79.8450], 15, {
          duration: 1.2,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [restaurants, mapTileStyle]);

  // Fly to selected restaurant when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedRestaurant) return;
    const lat = selectedRestaurant.lat || 6.9271;
    const lng = selectedRestaurant.lng || 79.8450;
    mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.0 });

    const marker = markersRef.current[selectedRestaurant.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedRestaurant]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current || restaurants.length === 0) return;
    import('leaflet').then((L) => {
      const bounds = L.latLngBounds(restaurants.map(r => [r.lat || 6.9271, r.lng || 79.8450]));
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    });
  };

  const activeRest = hoveredRestaurant || selectedRestaurant;

  return (
    <div className={`relative w-full rounded-3xl border border-zinc-800 overflow-hidden bg-zinc-950 shadow-2xl transition-all duration-300 flex flex-col ${
      isFullscreen ? 'fixed inset-4 z-50 h-[92vh]' : 'h-[560px]'
    }`}>
      
      {/* Map Control Bar Overlay (Top Left) */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2">
        <div className="bg-zinc-900/90 border border-zinc-800 backdrop-blur-md px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
          <Compass size={16} className="text-rose-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span className="text-xs font-bold text-zinc-100">Live Interactive Map</span>
          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-500/30">
            {restaurants.length} Places
          </span>
        </div>

        {/* Tile Style Selector Toggle */}
        <button
          onClick={() => setMapTileStyle(prev => prev === 'dark' ? 'streets' : 'dark')}
          className="p-2 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 backdrop-blur-md text-zinc-300 hover:text-white shadow-lg transition-all cursor-pointer"
          title="Toggle Tile Style (Voyager / Streets)"
        >
          <Layers size={16} />
        </button>

        {/* Recenter View Button */}
        <button
          onClick={handleRecenter}
          className="p-2 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 backdrop-blur-md text-zinc-300 hover:text-white shadow-lg transition-all cursor-pointer"
          title="Fit all restaurants on screen"
        >
          <LocateFixed size={16} />
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={() => setIsFullscreen(prev => !prev)}
          className="p-2 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 backdrop-blur-md text-zinc-300 hover:text-white shadow-lg transition-all cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full relative z-0" />

      {/* Active Restaurant Floating Info Glass Card */}
      {activeRest && (
        <div className="absolute bottom-4 left-4 right-4 z-[400] bg-zinc-900/95 border border-zinc-800 p-4 rounded-3xl shadow-2xl backdrop-blur-xl animate-slideUp flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={activeRest.photos[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
              alt={activeRest.name}
              className="w-16 h-16 rounded-2xl object-cover border border-zinc-800 shrink-0"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <Badge variant="rose">{activeRest.priceString}</Badge>
                <Badge variant="indigo">{activeRest.cuisine}</Badge>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Star size={12} className="fill-amber-400" /> {activeRest.rating.toFixed(1)}
                </span>
              </div>
              <h4 className="text-base font-bold text-zinc-100">{activeRest.name}</h4>
              <p className="text-xs text-zinc-400 flex items-center gap-1 truncate max-w-md">
                <MapPin size={12} className="text-rose-400 shrink-0" /> {activeRest.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSummarizeAi(activeRest)}
              className="flex-1 sm:flex-none text-xs gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              <Sparkles size={13} className="text-rose-400" />
              AI Review
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSelectRestaurant(activeRest)}
              className="flex-1 sm:flex-none text-xs bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30"
            >
              Full Details
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};
