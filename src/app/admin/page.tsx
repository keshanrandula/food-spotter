'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Inbox, 
  Sparkles, 
  Settings, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Star, 
  MapPin, 
  DollarSign, 
  Phone, 
  Globe, 
  TrendingUp, 
  Users, 
  Activity, 
  ShieldCheck, 
  RefreshCw,
  Filter,
  Flame,
  Check,
  AlertTriangle,
  Sun,
  Moon,
  ExternalLink,
  MessageSquare,
  Zap
} from 'lucide-react';
import { Restaurant, Review } from '@/types';
import { useTheme } from '@/components/ThemeProvider';

// Initial Mock Dataset for Admin Management
const INITIAL_ADMIN_RESTAURANTS: (Restaurant & { status: 'active' | 'pending' | 'archived'; isFeatured?: boolean })[] = [
  {
    id: 'colombo_01',
    name: 'The Spice Lounge & Grill',
    rating: 4.8,
    userRatingsTotal: 342,
    priceLevel: 2,
    priceString: '$$',
    address: '42 Galle Face Green, Colombo 03',
    lat: 6.9271,
    lng: 79.8450,
    cuisine: 'Sri Lankan Fusion',
    tags: ['Seafood', 'Crab', 'Rooftop', 'Spicy', 'Cocktails'],
    menuDishes: ['Jaffna Crab Curry', 'Black Pork Curry', 'Seafood Platter', 'Egg Hoppers'],
    openNow: true,
    phone: '+94 11 234 5678',
    website: 'https://spicelounge.example.com',
    photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'],
    reviews: [
      { id: 'rev_1', authorName: 'Ranil Perera', rating: 5, relativeTime: '2 days ago', text: 'Exceptional Jaffna crab curry!' }
    ],
    status: 'active',
    isFeatured: true,
  },
  {
    id: 'colombo_02',
    name: 'Pilawoos Night Grill & Kottu Bar',
    rating: 4.7,
    userRatingsTotal: 612,
    priceLevel: 1,
    priceString: '$',
    address: '417 Galle Road, Colombo 03',
    lat: 6.8980,
    lng: 79.8540,
    cuisine: 'Sri Lankan Street Food',
    tags: ['Kottu', 'Biryani', 'Late Night', 'Spicy'],
    menuDishes: ['Cheese Chicken Kottu', 'Dolphin Roast Kottu', 'Special Iced Coffee'],
    openNow: true,
    phone: '+94 11 257 8901',
    photos: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80'],
    reviews: [],
    status: 'active',
    isFeatured: true,
  },
  {
    id: 'kandy_01',
    name: 'The Royal Peak Tea Lounge',
    rating: 4.9,
    userRatingsTotal: 218,
    priceLevel: 3,
    priceString: '$$$',
    address: '15 Lake View Drive, Kandy',
    lat: 7.2906,
    lng: 80.6337,
    cuisine: 'Ceylon Tea & Fine Dining',
    tags: ['High Tea', 'Scenic View', 'Organic', 'Desserts'],
    menuDishes: ['Silver Needle Artisanal Tea', 'Passionfruit Mousse', 'Smoked Salmon Sandwich'],
    openNow: true,
    phone: '+94 81 223 4567',
    photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'],
    reviews: [],
    status: 'active',
    isFeatured: false,
  },
  {
    id: 'galle_01',
    name: 'Fort Heritage Seafood Kitchen',
    rating: 4.8,
    userRatingsTotal: 410,
    priceLevel: 3,
    priceString: '$$$',
    address: '28 Church Street, Galle Fort',
    lat: 6.0329,
    lng: 80.2168,
    cuisine: 'Coastal Seafood',
    tags: ['Lobster', 'Oysters', 'Wine Bar', 'Historic'],
    menuDishes: ['Grilled Jumbo Lagoon Prawns', 'Catch of the Day Salt Crust', 'Citrus Pavlova'],
    openNow: true,
    phone: '+94 91 224 8900',
    photos: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'],
    reviews: [],
    status: 'active',
    isFeatured: true,
  },
  {
    id: 'negombo_01',
    name: 'Lagoon Breeze Crab House',
    rating: 4.6,
    userRatingsTotal: 185,
    priceLevel: 2,
    priceString: '$$',
    address: '74 Beach Road, Negombo',
    lat: 7.2083,
    lng: 79.8358,
    cuisine: 'Seafood Grill',
    tags: ['Crab', 'Prawns', 'Beachside', 'Sunset View'],
    menuDishes: ['Garlic Butter Mud Crab', 'Calamari Rings', 'Coconut Sambol Platter'],
    openNow: false,
    phone: '+94 31 227 1234',
    photos: ['https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80'],
    reviews: [],
    status: 'active',
    isFeatured: false,
  }
];

// Initial Pending Submissions from Users
const INITIAL_SUBMISSIONS = [
  {
    id: 'sub_01',
    name: 'Ocean View Bistro & Oyster Bar',
    location: 'Marine Drive, Colombo 04',
    cuisine: 'Seafood & Fusion',
    phone: '+94 11 445 6789',
    website: 'https://oceanviewbistro.lk',
    submittedAt: '2026-09-06 14:30',
    status: 'pending',
    submittedBy: 'Owner (Suraj Fernando)',
  },
  {
    id: 'sub_02',
    name: 'Artisanal Wood-Fired Pizzeria',
    location: 'Kandy Road, Kiribathgoda',
    cuisine: 'Italian',
    phone: '+94 11 987 6543',
    website: 'https://artisanalpizza.lk',
    submittedAt: '2026-09-07 05:15',
    status: 'pending',
    submittedBy: 'Community Diner (Nadeesha K.)',
  }
];

export default function AdminDashboardPage() {
  const { theme, toggleTheme } = useTheme();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'submissions' | 'ai' | 'health'>('overview');

  // State for restaurants and submissions with LocalStorage persistence
  const [restaurants, setRestaurants] = useState(INITIAL_ADMIN_RESTAURANTS);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRest, setSelectedRest] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    address: '',
    priceLevel: 2,
    rating: 4.8,
    phone: '',
    website: '',
    tags: '',
    menuDishes: '',
    photoUrl: '',
    isFeatured: false,
    openNow: true,
  });

  // AI Workbench Test Query
  const [aiTestPrompt, setAiTestPrompt] = useState('Summarize customer sentiment for authentic Crab Curry in Colombo');
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  // Load from local storage if available
  useEffect(() => {
    try {
      const storedRests = localStorage.getItem('foodspotter_admin_restaurants');
      if (storedRests) setRestaurants(JSON.parse(storedRests));
      
      const storedSubs = localStorage.getItem('foodspotter_admin_submissions');
      if (storedSubs) setSubmissions(JSON.parse(storedSubs));
    } catch (e) {}
  }, []);

  // Sync to local storage
  const saveRestaurants = (updated: any[]) => {
    setRestaurants(updated);
    try {
      localStorage.setItem('foodspotter_admin_restaurants', JSON.stringify(updated));
    } catch (e) {}
  };

  const saveSubmissions = (updated: any[]) => {
    setSubmissions(updated);
    try {
      localStorage.setItem('foodspotter_admin_submissions', JSON.stringify(updated));
    } catch (e) {}
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Add Restaurant Handler
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRestaurant: any = {
      id: `rest_${Date.now()}`,
      name: formData.name,
      cuisine: formData.cuisine || 'Sri Lankan Fusion',
      address: formData.address,
      rating: parseFloat(formData.rating.toString()) || 4.8,
      userRatingsTotal: 1,
      priceLevel: parseInt(formData.priceLevel.toString()) || 2,
      priceString: '$'.repeat(parseInt(formData.priceLevel.toString()) || 2),
      lat: 6.9271,
      lng: 79.8450,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      menuDishes: formData.menuDishes.split(',').map(d => d.trim()).filter(Boolean),
      photos: [formData.photoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'],
      openNow: formData.openNow,
      phone: formData.phone,
      website: formData.website,
      reviews: [],
      status: 'active',
      isFeatured: formData.isFeatured,
    };

    const updated = [newRestaurant, ...restaurants];
    saveRestaurants(updated);
    setIsAddModalOpen(false);
    resetForm();
    showToast(`Restaurant "${newRestaurant.name}" added successfully!`);
  };

  // Edit Restaurant Handler
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRest) return;

    const updated = restaurants.map(r => {
      if (r.id === selectedRest.id) {
        return {
          ...r,
          name: formData.name,
          cuisine: formData.cuisine,
          address: formData.address,
          priceLevel: parseInt(formData.priceLevel.toString()),
          priceString: '$'.repeat(parseInt(formData.priceLevel.toString())),
          rating: parseFloat(formData.rating.toString()),
          phone: formData.phone,
          website: formData.website,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          menuDishes: formData.menuDishes.split(',').map(d => d.trim()).filter(Boolean),
          photos: [formData.photoUrl || r.photos[0]],
          isFeatured: formData.isFeatured,
          openNow: formData.openNow,
        };
      }
      return r;
    });

    saveRestaurants(updated);
    setIsEditModalOpen(false);
    setSelectedRest(null);
    resetForm();
    showToast('Restaurant details updated successfully!');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the active platform?`)) {
      const updated = restaurants.filter(r => r.id !== id);
      saveRestaurants(updated);
      showToast(`"${name}" has been removed.`, 'info');
    }
  };

  const handleToggleFeatured = (id: string) => {
    const updated = restaurants.map(r => {
      if (r.id === id) {
        const nextState = !r.isFeatured;
        showToast(`"${r.name}" ${nextState ? 'marked as Featured' : 'unmarked from Featured'}`);
        return { ...r, isFeatured: nextState };
      }
      return r;
    });
    saveRestaurants(updated);
  };

  const handleApproveSubmission = (sub: typeof INITIAL_SUBMISSIONS[0]) => {
    const newRest: any = {
      id: `rest_${Date.now()}`,
      name: sub.name,
      cuisine: sub.cuisine,
      address: sub.location,
      rating: 4.8,
      userRatingsTotal: 1,
      priceLevel: 2,
      priceString: '$$',
      lat: 6.9271,
      lng: 79.8450,
      tags: [sub.cuisine, 'New Spot', 'Verified'],
      menuDishes: ['Chef Special Main', 'Seasonal Dessert'],
      photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'],
      openNow: true,
      phone: sub.phone,
      website: sub.website,
      reviews: [],
      status: 'active',
      isFeatured: false,
    };

    saveRestaurants([newRest, ...restaurants]);
    saveSubmissions(submissions.filter(s => s.id !== sub.id));
    showToast(`Approved & published "${sub.name}" to live directory!`);
  };

  const handleRejectSubmission = (id: string, name: string) => {
    saveSubmissions(submissions.filter(s => s.id !== id));
    showToast(`Declined submission for "${name}".`, 'info');
  };

  const openEditModal = (rest: any) => {
    setSelectedRest(rest);
    setFormData({
      name: rest.name,
      cuisine: rest.cuisine,
      address: rest.address,
      priceLevel: rest.priceLevel || 2,
      rating: rest.rating || 4.8,
      phone: rest.phone || '',
      website: rest.website || '',
      tags: (rest.tags || []).join(', '),
      menuDishes: (rest.menuDishes || []).join(', '),
      photoUrl: rest.photos?.[0] || '',
      isFeatured: !!rest.isFeatured,
      openNow: !!rest.openNow,
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cuisine: '',
      address: '',
      priceLevel: 2,
      rating: 4.8,
      phone: '',
      website: '',
      tags: '',
      menuDishes: '',
      photoUrl: '',
      isFeatured: false,
      openNow: true,
    });
  };

  // Test AI prompt workbench
  const runAiTest = async () => {
    setIsTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiTestPrompt, restaurants }),
      });
      const data = await res.json();
      if (data.success) {
        setAiTestResult(JSON.stringify(data.data, null, 2));
      } else {
        setAiTestResult(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setAiTestResult(`Failed: ${e.message}`);
    } finally {
      setIsTestingAi(false);
    }
  };

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCuisine = cuisineFilter === 'All' || r.cuisine.toLowerCase().includes(cuisineFilter.toLowerCase());
    return matchesSearch && matchesCuisine;
  });

  const allCuisines = ['All', ...Array.from(new Set(restaurants.map(r => r.cuisine.split(' ')[0])))];

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-zinc-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-[200] animate-slideUp">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
            notification.type === 'success' 
              ? 'bg-emerald-600 text-white border-emerald-500' 
              : notification.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-stone-800 text-white border-stone-700'
          }`}>
            <CheckCircle2 size={16} />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* TOP ADMIN HEADER */}
      <header className="h-16 bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>← Back to FoodSpotter</span>
          </Link>
          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-savor-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-savor-600/30">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight font-serif flex items-center gap-1.5">
                FoodSpotter <span className="text-savor-600 font-sans text-xs uppercase px-2 py-0.5 rounded-md bg-savor-50 dark:bg-savor-950/60 border border-savor-200 dark:border-savor-800">Admin Portal</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-zinc-700 transition cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="px-3.5 py-2 rounded-xl bg-savor-600 hover:bg-savor-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-savor-600/20 transition cursor-pointer"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Restaurant</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 space-y-2 shrink-0">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3 border border-stone-200 dark:border-zinc-800 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-savor-600 text-white shadow-md shadow-savor-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard size={16} />
                <span>Overview & Stats</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('restaurants')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'restaurants'
                  ? 'bg-savor-600 text-white shadow-md shadow-savor-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UtensilsCrossed size={16} />
                <span>Restaurants List</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'restaurants' ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-500'
              }`}>
                {restaurants.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'submissions'
                  ? 'bg-savor-600 text-white shadow-md shadow-savor-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox size={16} />
                <span>Pending Claims</span>
              </div>
              {submissions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                  {submissions.length} new
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-savor-600 text-white shadow-md shadow-savor-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} />
                <span>AI & Sentiment Hub</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'health'
                  ? 'bg-savor-600 text-white shadow-md shadow-savor-600/20'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings size={16} />
                <span>System Health & APIs</span>
              </div>
            </button>
          </div>

          {/* Quick Platform Info Box */}
          <div className="bg-gradient-to-br from-stone-900 to-zinc-950 text-white rounded-3xl p-4 border border-stone-800 space-y-2 hidden md:block">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-savor-400 uppercase tracking-wider">
              <Zap size={14} />
              <span>Live Engine 2.0</span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Serving real-time OpenStreetMap venues with multi-modal AI Vision & Voice NLP.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px] text-stone-400">
              <span>Next.js 14 App Router</span>
              <span className="text-emerald-400 font-bold">● Healthy</span>
            </div>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 space-y-6">

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Stat Counters Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Venues</span>
                    <UtensilsCrossed size={18} className="text-savor-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-serif text-stone-900 dark:text-stone-100">
                    {restaurants.length}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp size={12} /> +12% this month
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-bold uppercase tracking-wider">User Reviews</span>
                    <MessageSquare size={18} className="text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-serif text-stone-900 dark:text-stone-100">
                    {restaurants.reduce((acc, r) => acc + (r.userRatingsTotal || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-stone-400 font-medium">
                    Sentiment: 94% Positive
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Avg Rating</span>
                    <Star size={18} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-serif text-stone-900 dark:text-stone-100">
                    4.8 <span className="text-xs font-normal text-stone-400">/ 5.0</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold">
                    Top Tier Dining Index
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Pending Claims</span>
                    <Inbox size={18} className="text-rose-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-serif text-stone-900 dark:text-stone-100">
                    {submissions.length}
                  </div>
                  <div className="text-[11px] text-amber-600 font-bold">
                    Requires Admin Review
                  </div>
                </div>
              </div>

              {/* Regional Discovery Breakdown & Activity Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Popular Regional Hubs */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold font-serif">Regional Culinary Hubs</h3>
                      <p className="text-xs text-stone-500">Geographic coverage & verified venues across Sri Lanka</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-savor-50 dark:bg-savor-950/40 text-savor-700 dark:text-savor-300 border border-savor-200 dark:border-savor-800">
                      Live GPS Feeds
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { city: 'Colombo City & Suburbs', count: '14 Venues', share: '65%', flag: '🏙️' },
                      { city: 'Kandy & Hill Country', count: '4 Venues', share: '18%', flag: '⛰️' },
                      { city: 'Galle & Southern Coast', count: '5 Venues', share: '12%', flag: '🌊' },
                      { city: 'Negombo & Coastal Strip', count: '3 Venues', share: '5%', flag: '⛵' },
                    ].map((hub, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{hub.flag}</span>
                          <div>
                            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{hub.city}</h4>
                            <span className="text-[10px] text-stone-400">{hub.count}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-savor-600">{hub.share}</span>
                          <div className="w-20 h-1.5 rounded-full bg-stone-200 dark:bg-zinc-700 mt-1 overflow-hidden">
                            <div className="h-full bg-savor-600 rounded-full" style={{ width: hub.share }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Shortcuts & AI Vision Summary */}
                <div className="bg-gradient-to-br from-savor-600 to-rose-700 text-white p-6 rounded-3xl shadow-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-widest">
                      Admin Quick Action
                    </span>
                    <h3 className="text-xl font-black font-serif">Manage Your Culinary Ecosystem</h3>
                    <p className="text-xs text-savor-100 leading-relaxed">
                      Add new boutique eateries, approve diner recommendations, and run AI review analysis in seconds.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                      className="w-full py-3 rounded-2xl bg-white text-savor-800 hover:bg-savor-50 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Plus size={14} /> Add New Restaurant
                    </button>
                    <button
                      onClick={() => setActiveTab('submissions')}
                      className="w-full py-2.5 rounded-2xl bg-savor-800/60 hover:bg-savor-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer"
                    >
                      <Inbox size={14} /> Review Pending Claims ({submissions.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESTAURANTS DIRECTORY & CRUD TABLE */}
          {activeTab === 'restaurants' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-fadeIn space-y-4 p-4 sm:p-6">
              
              {/* Search & Filter Header Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search restaurant name, cuisine, address, or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-savor-600/30"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <select
                    value={cuisineFilter}
                    onChange={(e) => setCuisineFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
                  >
                    {allCuisines.map((c) => (
                      <option key={c} value={c}>{c === 'All' ? 'All Cuisines' : c}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                    className="px-4 py-2 rounded-xl bg-savor-600 hover:bg-savor-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                  >
                    <Plus size={14} /> <span>Add New</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-zinc-800 text-stone-400 uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-3 px-3">Restaurant</th>
                      <th className="py-3 px-3">Cuisine & Price</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Rating</th>
                      <th className="py-3 px-3">Featured</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                    {filteredRestaurants.map((rest) => (
                      <tr key={rest.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/40 transition">
                        
                        {/* Name & Photo */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={rest.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80'}
                              alt={rest.name}
                              className="w-10 h-10 rounded-xl object-cover border border-stone-200 dark:border-zinc-700 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-stone-900 dark:text-stone-100 text-xs">{rest.name}</div>
                              <div className="text-[10px] text-stone-400">ID: {rest.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Cuisine & Price */}
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-stone-800 dark:text-stone-200">{rest.cuisine}</div>
                          <span className="font-mono text-[10px] font-extrabold text-emerald-600">
                            {rest.priceString || '$$'} ({rest.priceLevel || 2})
                          </span>
                        </td>

                        {/* Location Address */}
                        <td className="py-3.5 px-3">
                          <div className="text-stone-600 dark:text-stone-300 max-w-[180px] truncate" title={rest.address}>
                            {rest.address}
                          </div>
                          {rest.phone && <div className="text-[10px] text-stone-400">{rest.phone}</div>}
                        </td>

                        {/* Rating */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1 font-bold text-stone-900 dark:text-stone-100">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span>{rest.rating}</span>
                          </div>
                          <span className="text-[10px] text-stone-400">({rest.userRatingsTotal || 0} reviews)</span>
                        </td>

                        {/* Featured Toggle */}
                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => handleToggleFeatured(rest.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                              rest.isFeatured
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-stone-100 dark:bg-zinc-800 text-stone-500 border border-stone-200 dark:border-zinc-700'
                            }`}
                          >
                            <Flame size={10} className={rest.isFeatured ? 'text-amber-500' : 'text-stone-400'} />
                            <span>{rest.isFeatured ? 'Featured' : 'Standard'}</span>
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setSelectedRest(rest); setIsDetailModalOpen(true); }}
                              className="p-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-600 dark:text-stone-300 transition cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => openEditModal(rest)}
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 transition cursor-pointer"
                              title="Edit Restaurant"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(rest.id, rest.name)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 transition cursor-pointer"
                              title="Delete Restaurant"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRestaurants.length === 0 && (
                  <div className="py-12 text-center text-stone-400 space-y-1">
                    <UtensilsCrossed size={28} className="mx-auto text-stone-300 dark:text-stone-700" />
                    <p className="text-xs font-bold">No restaurants match your search</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PENDING USER SUBMISSIONS */}
          {activeTab === 'submissions' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm p-6 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold font-serif">Pending Restaurant Submissions</h3>
                  <p className="text-xs text-stone-500">Review restaurant entries submitted by users and restaurant owners</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {submissions.length} Awaiting Approval
                </span>
              </div>

              {submissions.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">All caught up!</h4>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    No pending claims or restaurant submissions to review at this moment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="p-5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">{sub.name}</h4>
                          <span className="text-[11px] font-semibold text-savor-600">{sub.cuisine}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium">{sub.submittedAt}</span>
                      </div>

                      <div className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-stone-400 shrink-0" />
                          <span>{sub.location}</span>
                        </div>
                        {sub.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-stone-400 shrink-0" />
                            <span>{sub.phone}</span>
                          </div>
                        )}
                        {sub.website && (
                          <div className="flex items-center gap-1.5">
                            <Globe size={12} className="text-stone-400 shrink-0" />
                            <a href={sub.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                              {sub.website}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-stone-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                        <span className="text-[10px] text-stone-400">By: {sub.submittedBy}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectSubmission(sub.id, sub.name)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleApproveSubmission(sub)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Check size={12} />
                            <span>Approve & Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI & SENTIMENT HUB */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white shadow-md">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold font-serif">AI Prompt & Concierge Workbench</h3>
                    <p className="text-xs text-stone-500">Test live OpenRouter LLM review summarization and food pairing outputs</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Test AI Prompt / User Query</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiTestPrompt}
                      onChange={(e) => setAiTestPrompt(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <button
                      onClick={runAiTest}
                      disabled={isTestingAi}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      {isTestingAi ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      <span>{isTestingAi ? 'Running...' : 'Execute AI'}</span>
                    </button>
                  </div>

                  {aiTestResult && (
                    <div className="mt-4 p-4 rounded-2xl bg-stone-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-80 border border-stone-800 custom-scrollbar">
                      <pre>{aiTestResult}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM HEALTH & APIS */}
          {activeTab === 'health' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 p-6 shadow-sm space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-extrabold font-serif">System Health & API Integrations</h3>
                <p className="text-xs text-stone-500">Live operational status across all backend and external data feeds</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'OpenStreetMap Overpass API', status: 'Operational', ping: '142ms', desc: 'Live geo-spatial restaurant query engine' },
                  { name: 'OpenRouter Multimodal LLM', status: 'Active (Gemini / Llama 3)', ping: '380ms', desc: 'Review summarizer & Vision OCR' },
                  { name: 'Web Speech Recognition Engine', status: 'Operational (si-LK / en-US)', ping: 'Native', desc: 'Client speech transcription' },
                  { name: 'MongoDB Atlas / Local Cache', status: 'Connected', ping: '24ms', desc: 'Saved bookmarks and restaurant records' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{item.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        ● {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">{item.desc}</p>
                    <div className="text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-200/50 dark:border-zinc-700/50">
                      Response Latency: {item.ping}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ADD / EDIT RESTAURANT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn"
          onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        >
          <div
            className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-zinc-800 w-full max-w-xl p-6 sm:p-8 space-y-5 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-savor-600 flex items-center justify-center text-white">
                  {isEditModalOpen ? <Edit3 size={15} /> : <Plus size={15} />}
                </div>
                <h3 className="text-base font-extrabold font-serif">
                  {isEditModalOpen ? 'Edit Restaurant Details' : 'Add New Restaurant'}
                </h3>
              </div>
              <button
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-500 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
              >
                <XCircle size={16} />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Restaurant Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Cinnamon Lakeside Seafood Grill"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-savor-600/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Cuisine *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Sri Lankan / Italian"
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Price Level (1-4)</label>
                  <select
                    value={formData.priceLevel}
                    onChange={(e) => setFormData({ ...formData, priceLevel: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    <option value={1}>$ (Budget / Street Food)</option>
                    <option value={2}>$$ (Casual Dining)</option>
                    <option value={3}>$$$ (Fine Dining)</option>
                    <option value={4}>$$$$ (Luxury / Michelin)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Address / Location *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 115 Galle Road, Colombo 03"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Phone</label>
                  <input
                    type="tel"
                    placeholder="+94 11 234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Rating (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Seafood, Rooftop, Romantic, Crab, Live Music"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Menu Dishes (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Jaffna Crab Curry, Egg Hoppers, Truffle Pasta"
                  value={formData.menuDishes}
                  onChange={(e) => setFormData({ ...formData, menuDishes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Photo URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-savor-600 focus:ring-savor-600"
                  />
                  <span>Mark as Featured Spot 🔥</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.openNow}
                    onChange={(e) => setFormData({ ...formData, openNow: e.target.checked })}
                    className="w-4 h-4 rounded text-savor-600 focus:ring-savor-600"
                  />
                  <span>Open Right Now</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-savor-600 hover:bg-savor-700 text-white text-xs font-bold transition shadow-md shadow-savor-600/20 cursor-pointer mt-3"
              >
                {isEditModalOpen ? 'Save Changes' : 'Create Restaurant'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isDetailModalOpen && selectedRest && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-zinc-800 w-full max-w-lg p-6 space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold font-serif text-stone-900 dark:text-stone-100">{selectedRest.name}</h3>
                <span className="text-xs font-bold text-savor-600">{selectedRest.cuisine} • {selectedRest.priceString}</span>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-500 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
              >
                <XCircle size={16} />
              </button>
            </div>

            <img
              src={selectedRest.photos?.[0]}
              alt={selectedRest.name}
              className="w-full h-44 rounded-2xl object-cover"
            />

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                <MapPin size={14} className="text-savor-600 shrink-0" />
                <span>{selectedRest.address}</span>
              </div>
              {selectedRest.phone && (
                <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                  <Phone size={14} className="text-savor-600 shrink-0" />
                  <span>{selectedRest.phone}</span>
                </div>
              )}
            </div>

            {selectedRest.tags && selectedRest.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedRest.tags.map((tag: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
