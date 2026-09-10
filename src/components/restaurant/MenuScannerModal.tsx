'use client';

import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Leaf, 
  Wheat, 
  Search, 
  Utensils, 
  MapPin, 
  ArrowRight,
  Info,
  Layers,
  FileImage,
  RefreshCw
} from 'lucide-react';
import { MenuScanResult, ScannedMenuItem } from '@/types';

interface MenuScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFindDishNearMe: (dishName: string) => void;
}

export const MenuScannerModal: React.FC<MenuScannerModalProps> = ({
  isOpen,
  onClose,
  onFindDishNearMe,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<MenuScanResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'halal' | 'gf' | 'vegan' | 'spicy'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      processMenuScan(base64);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = async (presetId: string) => {
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    // Set sample placeholder image preview
    if (presetId === 'sri_lankan') {
      setImagePreview('https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80');
    } else if (presetId === 'italian') {
      setImagePreview('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80');
    } else {
      setImagePreview('https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80');
    }

    try {
      const res = await fetch('/api/scan-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(data.data);
      } else {
        setErrorMsg(data.error || 'Failed to parse menu');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with AI Vision API');
    } finally {
      setIsScanning(false);
    }
  };

  const processMenuScan = async (base64Data: string) => {
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await fetch('/api/scan-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(data.data);
      } else {
        setErrorMsg(data.error || 'Failed to analyze menu');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Vision scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setScanResult(null);
    setIsScanning(false);
    setErrorMsg(null);
    setSearchQuery('');
    setActiveCategory('All');
    setDietaryFilter('all');
  };

  // Filter items
  const filteredItems = (scanResult?.items || []).filter((item: ScannedMenuItem) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.localName && item.localName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDiet = true;
    if (dietaryFilter === 'veg') matchesDiet = item.dietary.isVeg;
    if (dietaryFilter === 'vegan') matchesDiet = item.dietary.isVegan;
    if (dietaryFilter === 'halal') matchesDiet = item.dietary.isHalal;
    if (dietaryFilter === 'gf') matchesDiet = item.dietary.isGlutenFree;
    if (dietaryFilter === 'spicy') matchesDiet = item.dietary.spicyLevel >= 2;

    return matchesCategory && matchesQuery && matchesDiet;
  });

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-stone-50/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Camera size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                  AI Menu & Food Vision Scanner
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  OCR & Vision 2.0
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Upload a photo or menu bill to extract dishes, dietary tags, allergens & prices in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {scanResult && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Scan Another</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* UPLOAD / SELECT PRESET VIEW (When no result yet) */}
          {!scanResult && (
            <div className="space-y-6">
              {/* Drop / Upload Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-emerald-500/40 dark:border-emerald-500/30 hover:border-emerald-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer bg-emerald-50/30 dark:bg-emerald-950/10 transition-all group overflow-hidden"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                {/* Laser Scanning Animation when processing */}
                {isScanning && (
                  <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-0 animate-bounce shadow-[0_0_15px_#10b981]" style={{ animationDuration: '2s' }} />
                    <div className="p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 shadow-xl border border-emerald-500/30 flex items-center gap-3 animate-pulse">
                      <Sparkles className="text-emerald-600 animate-spin" size={24} />
                      <div className="text-left">
                        <p className="text-sm font-bold text-stone-900 dark:text-stone-100">AI Vision Analyzing Menu...</p>
                        <p className="text-xs text-stone-500">Detecting Sinhala dishes, dietary tags, allergens & prices</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="max-w-md mx-auto space-y-4 pointer-events-none">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                      Click to upload or drag & drop menu photo
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Supports JPG, PNG, WEBP — physical restaurant menus, bills, or food photos
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <Camera size={14} />
                    <span>Upload from Phone or Camera</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Instant Try Demo Menus */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Or Test Instantly with Sample Menus:
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handlePresetSelect('sri_lankan')}
                    disabled={isScanning}
                    className="p-4 rounded-2xl bg-stone-100/80 dark:bg-zinc-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-stone-200 dark:border-zinc-700 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                  >
                    <span className="text-2xl mb-1 block">🍛</span>
                    <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      Sri Lankan Heritage Menu
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Jaffna Crab Curry, Egg Hoppers, Cashew Curry, Watalappan
                    </p>
                  </button>

                  <button
                    onClick={() => handlePresetSelect('italian')}
                    disabled={isScanning}
                    className="p-4 rounded-2xl bg-stone-100/80 dark:bg-zinc-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-stone-200 dark:border-zinc-700 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                  >
                    <span className="text-2xl mb-1 block">🍕</span>
                    <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      Italian Trattoria Menu
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Truffle Tagliatelle, Burrata Pizza, Espresso Tiramisu
                    </p>
                  </button>

                  <button
                    onClick={() => handlePresetSelect('fusion')}
                    disabled={isScanning}
                    className="p-4 rounded-2xl bg-stone-100/80 dark:bg-zinc-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-stone-200 dark:border-zinc-700 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                  >
                    <span className="text-2xl mb-1 block">🥑</span>
                    <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      Gourmet Fusion Bistro
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Wagyu Burgers, Quinoa Buddha Bowl, Thai Prawn Curry
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PARSED SCAN RESULTS VIEW */}
          {scanResult && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Summary & Overview Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                        AI OCR & VISION ANALYSIS
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black font-serif">
                        {scanResult.restaurantName || 'Scanned Culinary Menu'}
                      </h3>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/30">
                      {scanResult.items.length} Dishes Extracted
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-2xl">
                    {scanResult.summary}
                  </p>

                  {scanResult.healthTips && scanResult.healthTips.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {scanResult.healthTips.map((tip, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 text-[11px] text-emerald-200 border border-emerald-400/30">
                          <CheckCircle2 size={12} className="text-emerald-300" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-stone-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-stone-200 dark:border-zinc-700">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search extracted dishes (e.g. Crab, Pizza, බිරියානි)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                {/* Dietary Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar text-xs">
                  <button
                    onClick={() => setDietaryFilter('all')}
                    className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer ${
                      dietaryFilter === 'all'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-zinc-700'
                    }`}
                  >
                    All ({scanResult.items.length})
                  </button>
                  <button
                    onClick={() => setDietaryFilter('veg')}
                    className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 cursor-pointer ${
                      dietaryFilter === 'veg'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-zinc-700'
                    }`}
                  >
                    <Leaf size={12} className="text-emerald-500" />
                    <span>Veg</span>
                  </button>
                  <button
                    onClick={() => setDietaryFilter('halal')}
                    className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 cursor-pointer ${
                      dietaryFilter === 'halal'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-zinc-700'
                    }`}
                  >
                    <span>🍗 Halal</span>
                  </button>
                  <button
                    onClick={() => setDietaryFilter('gf')}
                    className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 cursor-pointer ${
                      dietaryFilter === 'gf'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-zinc-700'
                    }`}
                  >
                    <Wheat size={12} className="text-amber-500" />
                    <span>Gluten-Free</span>
                  </button>
                  <button
                    onClick={() => setDietaryFilter('spicy')}
                    className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 cursor-pointer ${
                      dietaryFilter === 'spicy'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-zinc-700'
                    }`}
                  >
                    <Flame size={12} className="text-rose-500" />
                    <span>Spicy</span>
                  </button>
                </div>
              </div>

              {/* Category Sub-tabs */}
              {scanResult.categories.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <button
                    onClick={() => setActiveCategory('All')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      activeCategory === 'All'
                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    All Categories
                  </button>
                  {scanResult.categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                          : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* DISHES LIST */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
                  >
                    <div>
                      {/* Top Row: Title, Local Name, Price */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.name}
                          </h4>
                          {item.localName && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 font-serif">
                              {item.localName}
                            </p>
                          )}
                        </div>
                        <span className="px-2.5 py-1 rounded-xl font-mono text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {item.price}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Dietary & Allergen Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {item.dietary.isVeg && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 flex items-center gap-1">
                            <Leaf size={10} /> Veg
                          </span>
                        )}
                        {item.dietary.isHalal && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                            Halal
                          </span>
                        )}
                        {item.dietary.isGlutenFree && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                            <Wheat size={10} /> Gluten-Free
                          </span>
                        )}
                        {item.dietary.spicyLevel > 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 flex items-center gap-0.5">
                            <Flame size={10} />
                            {'🌶️'.repeat(item.dietary.spicyLevel)}
                          </span>
                        )}
                        {item.allergens.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-zinc-700 text-stone-600 dark:text-stone-300" title={`Allergens: ${item.allergens.join(', ')}`}>
                            Allergens: {item.allergens.join(', ')}
                          </span>
                        )}
                      </div>

                      {/* Recommended Pairing if available */}
                      {item.recommendedPairing && (
                        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-zinc-900/60 text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-1.5 border border-stone-200/50 dark:border-zinc-700/50">
                          <Sparkles size={12} className="text-amber-500" />
                          <span><strong>Pairing:</strong> {item.recommendedPairing}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: Find Near Me */}
                    <div className="pt-2 border-t border-stone-100 dark:border-zinc-700/50 flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-medium">
                        AI Confidence: {item.confidenceScore}%
                      </span>
                      <button
                        onClick={() => {
                          onFindDishNearMe(item.name);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white transition flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-800"
                      >
                        <MapPin size={12} />
                        <span>Find Near Me</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="py-12 text-center space-y-2">
                  <Utensils size={32} className="mx-auto text-stone-400" />
                  <p className="text-sm font-bold text-stone-700 dark:text-stone-300">No dishes match your active filter</p>
                  <p className="text-xs text-stone-400">Try clearing the search query or switching dietary filter pills.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
