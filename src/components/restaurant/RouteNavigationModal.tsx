'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  MapPin, 
  Car, 
  Footprints, 
  Bike, 
  Bus, 
  Clock, 
  Compass, 
  ArrowRight, 
  ArrowUp, 
  CornerUpLeft, 
  CornerUpRight, 
  ExternalLink, 
  ShieldCheck, 
  X, 
  Share2, 
  Layers, 
  CheckCircle2, 
  ParkingCircle, 
  Train 
} from 'lucide-react';
import { Restaurant, RouteDetails, RouteStep, TransitStop } from '@/types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

interface RouteNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  userLat?: number;
  userLng?: number;
  userLocationName?: string;
}

export const RouteNavigationModal: React.FC<RouteNavigationModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  userLat = 6.9271,
  userLng = 79.8450,
  userLocationName = 'My Location',
}) => {
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'cycling' | 'transit'>('driving');
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'transit'>('steps');
  const [selectedTransitStop, setSelectedTransitStop] = useState<TransitStop | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  // Fetch route whenever mode, restaurant or origin changes
  useEffect(() => {
    if (isOpen && restaurant) {
      setIsLoadingRoute(true);
      const destLat = restaurant.lat || 6.9271;
      const destLng = restaurant.lng || 79.8450;

      fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLat: userLat,
          originLng: userLng,
          destLat,
          destLng,
          mode: travelMode,
          originName: userLocationName,
          destName: restaurant.name,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setRouteDetails(data.data);
          }
        })
        .catch(err => console.error('Error fetching route:', err))
        .finally(() => setIsLoadingRoute(false));
    }
  }, [isOpen, restaurant, travelMode, userLat, userLng]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!isOpen || !restaurant || !routeDetails || typeof window === 'undefined') return;

    let isMounted = true;

    // Dynamically load Leaflet on client
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Clear existing map instance if any
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      });
      leafletMapRef.current = map;

      // Add dark OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom Origin Marker (Pulsing User Beacon)
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; background: rgba(59, 130, 246, 0.4); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 16px; height: 16px; background: #2563eb; border: 3px solid white; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([routeDetails.origin.lat, routeDetails.origin.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>${userLocationName}</b><br/><span style="font-size:11px;">Your Starting Point</span>`);

      // Custom Destination Marker (Restaurant Savor Pin)
      const restaurantIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div style="background: #f43f5e; color: white; width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(244, 63, 94, 0.5);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([routeDetails.destination.lat, routeDetails.destination.lng], { icon: restaurantIcon })
        .addTo(map)
        .bindPopup(`<b>${restaurant.name}</b><br/><span style="font-size:11px;">${restaurant.cuisine} • ${restaurant.address}</span>`)
        .openPopup();

      // Draw Route Polyline
      if (routeDetails.polyline && routeDetails.polyline.length > 0) {
        const polylineLayer = L.polyline(routeDetails.polyline, {
          color: travelMode === 'walking' ? '#10b981' : travelMode === 'transit' ? '#8b5cf6' : '#f43f5e',
          weight: 6,
          opacity: 0.9,
          lineJoin: 'round',
          dashArray: travelMode === 'walking' ? '8, 8' : undefined,
        }).addTo(map);

        map.fitBounds(polylineLayer.getBounds(), { padding: [40, 40] });
      }

      // Add Transit & Parking Markers
      routeDetails.nearbyTransit.forEach((stop) => {
        const isBus = stop.type === 'bus';
        const isTrain = stop.type === 'train';
        const iconColor = isBus ? '#2563eb' : isTrain ? '#7c3aed' : '#059669';
        const iconSymbol = isBus ? '🚌' : isTrain ? '🚆' : '🅿️';

        const transitPin = L.divIcon({
          className: 'custom-transit-pin',
          html: `
            <div style="background: #18181b; border: 2px solid ${iconColor}; font-size: 11px; padding: 2px 5px; border-radius: 8px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); font-weight: bold; color: ${iconColor};">
              <span>${iconSymbol}</span>
            </div>
          `,
          iconSize: [26, 26],
        });

        L.marker([stop.lat, stop.lng], { icon: transitPin })
          .addTo(map)
          .bindPopup(`<b>${stop.name}</b><br/><span style="font-size:10px;">${stop.type.toUpperCase()} • ${stop.distanceMeters}m along route</span>`);
      });
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isOpen, routeDetails, travelMode, restaurant]);

  if (!isOpen || !restaurant) return null;

  const handleOpenExternalMaps = (app: 'google' | 'waze' | 'apple') => {
    const lat = restaurant.lat || 6.9271;
    const lng = restaurant.lng || 79.8450;
    const name = encodeURIComponent(restaurant.name);

    if (app === 'google') {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${name}`, '_blank');
    } else if (app === 'waze') {
      window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
    } else {
      window.open(`https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`, '_blank');
    }
  };

  const getManeuverIcon = (type?: RouteStep['maneuverType']) => {
    switch (type) {
      case 'turn-left':
        return <CornerUpLeft size={16} className="text-rose-400 shrink-0" />;
      case 'turn-right':
        return <CornerUpRight size={16} className="text-rose-400 shrink-0" />;
      case 'arrive':
        return <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />;
      case 'depart':
        return <Compass size={16} className="text-blue-400 shrink-0" />;
      default:
        return <ArrowUp size={16} className="text-zinc-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <Navigation size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100">Live Navigation & Route</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Live OSRM GPS
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-md">
                Route from <strong className="text-zinc-200">{userLocationName}</strong> to <strong className="text-rose-400">{restaurant.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Main Content (Map + Route details grid) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          
          {/* Left / Top: Interactive Leaflet Map Container */}
          <div className="lg:col-span-7 h-72 sm:h-96 lg:h-auto min-h-[300px] relative bg-zinc-950 border-b lg:border-b-0 lg:border-r border-zinc-800">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Travel Mode Pills on top of Map */}
            <div className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/95 backdrop-blur-md shadow-md border border-zinc-800">
              <button
                onClick={() => setTravelMode('driving')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  travelMode === 'driving' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Car size={13} />
                <span className="hidden sm:inline">Drive</span>
              </button>

              <button
                onClick={() => setTravelMode('walking')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  travelMode === 'walking' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Footprints size={13} />
                <span className="hidden sm:inline">Walk</span>
              </button>

              <button
                onClick={() => setTravelMode('cycling')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  travelMode === 'cycling' ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Bike size={13} />
                <span className="hidden sm:inline">Cycle</span>
              </button>

              <button
                onClick={() => setTravelMode('transit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  travelMode === 'transit' ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Bus size={13} />
                <span className="hidden sm:inline">Transit</span>
              </button>
            </div>

            {/* Live Distance & Time Card floating on Map */}
            {routeDetails && (
              <div className="absolute bottom-3 left-3 right-3 z-[400] p-3 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800 shadow-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-300 flex items-center justify-center font-bold text-sm">
                    {travelMode === 'driving' ? '🚗' : travelMode === 'walking' ? '🚶' : travelMode === 'cycling' ? '🚴' : '🚌'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-zinc-100 font-serif">
                        {routeDetails.durationMinutes} mins
                      </span>
                      <span className="text-xs text-zinc-400 font-semibold">
                        ({routeDetails.distanceKm} km)
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Fastest route with typical traffic condition
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenExternalMaps('google')}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Google Maps</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Turn-by-Turn Maneuvers & Transit Drawer */}
          <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4 max-h-[500px] overflow-y-auto">
            
            {/* Tabs: Turn-by-Turn vs Stops Along Route */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
              <button
                onClick={() => setActiveTab('steps')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'steps' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Turn-by-Turn Steps
              </button>

              <button
                onClick={() => setActiveTab('transit')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'transit' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Transit & Parking</span>
                <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 text-[10px] border border-rose-800">
                  {routeDetails?.nearbyTransit.length || 3}
                </span>
              </button>
            </div>

            {/* TAB 1: STEP-BY-STEP MANEUVERS */}
            {activeTab === 'steps' && (
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                {isLoadingRoute ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-6 h-6 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-zinc-400">Calculating real-time road maneuvers...</p>
                  </div>
                ) : (
                  routeDetails?.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-900/90 border border-zinc-800 transition-all flex items-start gap-3 group"
                    >
                      <div className="w-7 h-7 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:border-rose-500/50">
                        {getManeuverIcon(step.maneuverType)}
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs font-bold text-zinc-200 leading-snug">
                          {step.instruction}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                          {step.streetName && <span>{step.streetName} • </span>}
                          <span>{step.distanceMeters > 1000 ? `${(step.distanceMeters / 1000).toFixed(1)} km` : `${step.distanceMeters} m`}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: STOPS & TRANSIT ALONG ROUTE */}
            {activeTab === 'transit' && (
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                <p className="text-xs text-zinc-400 font-medium pb-1">
                  Public transport links and parking stops along route to {restaurant.name}:
                </p>

                {routeDetails?.nearbyTransit.map((stop) => {
                  const isBus = stop.type === 'bus';
                  const isTrain = stop.type === 'train';

                  return (
                    <div
                      key={stop.id}
                      className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm space-y-1.5 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                            isBus ? 'bg-blue-950 text-blue-400 border border-blue-800' : isTrain ? 'bg-purple-950 text-purple-400 border border-purple-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {isBus ? <Bus size={13} /> : isTrain ? <Train size={13} /> : <ParkingCircle size={13} />}
                          </div>
                          <h4 className="text-xs font-bold text-zinc-200">{stop.name}</h4>
                        </div>
                        
                        <span className="text-[10px] font-semibold text-zinc-400 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800">
                          {stop.distanceMeters}m away
                        </span>
                      </div>

                      {stop.lines && (
                        <div className="text-[10px] text-zinc-400 pl-8 space-y-0.5">
                          <span className="font-semibold text-zinc-300">Connected routes:</span> {stop.lines.join(' | ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom App Launch Bar */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Launch External GPS Navigation
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleOpenExternalMaps('google')}
                  className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-[11px] font-bold transition-colors cursor-pointer text-center"
                >
                  Google Maps
                </button>
                <button
                  onClick={() => handleOpenExternalMaps('waze')}
                  className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-[11px] font-bold transition-colors cursor-pointer text-center"
                >
                  Waze App
                </button>
                <button
                  onClick={() => handleOpenExternalMaps('apple')}
                  className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-[11px] font-bold transition-colors cursor-pointer text-center"
                >
                  Apple Maps
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
