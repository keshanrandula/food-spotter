'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Utensils, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Mail, 
  Phone, 
  User, 
  ShieldCheck, 
  MapPin, 
  Award, 
  Flame, 
  Leaf, 
  Wheat, 
  QrCode, 
  ArrowRight, 
  Check, 
  Heart,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Restaurant, MenuItem, PreOrderItem, TableReservation, UserProfile } from '@/types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

interface TableBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  currentUser?: UserProfile | null;
  onBookingSuccess?: (reservation: TableReservation) => void;
}

export const TableBookingModal: React.FC<TableBookingModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  currentUser,
  onBookingSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Step 1: Date & Time & Seating
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('07:30 PM');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [seatingArea, setSeatingArea] = useState<TableReservation['seatingArea']>('rooftop');
  
  // Step 2: Pre-order Menu Cart
  const [preOrderCart, setPreOrderCart] = useState<PreOrderItem[]>([]);
  const [activeMenuCategory, setActiveMenuCategory] = useState<string>('All');
  
  // Step 3: Diner Info
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [specialOccasion, setSpecialOccasion] = useState<TableReservation['specialOccasion']>('romantic_date');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Step 4: Confirmed Reservation
  const [confirmedReservation, setConfirmedReservation] = useState<TableReservation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync with current user profile
  useEffect(() => {
    if (currentUser) {
      setGuestName(currentUser.name || '');
      setGuestEmail(currentUser.email || '');
    }
  }, [currentUser, isOpen]);

  // Reset modal state when opening with new restaurant
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConfirmedReservation(null);
      setErrorMsg(null);
      setPreOrderCart([]);
    }
  }, [isOpen, restaurant]);

  if (!isOpen || !restaurant) return null;

  // Curated Digital Menu for this restaurant
  const sampleMenu: MenuItem[] = [
    {
      id: 'm1',
      name: 'Jaffna Black Mud Crab Curry',
      localName: 'යාපනේ කළු කකුළු ව්‍යංජනය',
      category: 'Signature Mains',
      price: 3850,
      priceFormatted: 'Rs. 3,850',
      description: 'Lagoon mud crabs simmered in roasted Jaffna spices, black pepper, and coconut milk.',
      isSignature: true,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      dietary: { isVeg: false, isVegan: false, isHalal: true, isGlutenFree: true, spicyLevel: 3 },
      allergens: ['Crustaceans'],
    },
    {
      id: 'm2',
      name: 'Truffle & Forest Mushroom Woodfired Pizza',
      localName: 'ට්‍රෆල් හතු පීසා',
      category: 'Wood-Fired & Grills',
      price: 3200,
      priceFormatted: 'Rs. 3,200',
      description: 'Slow-fermented sourdough, black truffle paste, fior di latte mozzarella, and wild porcini.',
      isSignature: true,
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      dietary: { isVeg: true, isVegan: false, isHalal: true, isGlutenFree: false, spicyLevel: 0 },
      allergens: ['Gluten', 'Dairy'],
    },
    {
      id: 'm3',
      name: 'Crispy Prawn & Avocado Salad',
      localName: 'ප්‍රෝන් ඇවකාඩෝ සැලඩ්',
      category: 'Appetizers',
      price: 1850,
      priceFormatted: 'Rs. 1,850',
      description: 'Tempura tiger prawns, Hass avocado, baby greens, and yuzu-sesame vinaigrette.',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      dietary: { isVeg: false, isVegan: false, isHalal: true, isGlutenFree: false, spicyLevel: 1 },
      allergens: ['Crustaceans', 'Sesame'],
    },
    {
      id: 'm4',
      name: 'Creamy Cashew & Green Pea Coconut Curry',
      localName: 'කජු සහ මෑකරල් කරිය',
      category: 'Signature Mains',
      price: 1650,
      priceFormatted: 'Rs. 1,650',
      description: 'Tender raw cashews stewed with sweet green peas in rich turmeric coconut cream.',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      dietary: { isVeg: true, isVegan: true, isHalal: true, isGlutenFree: true, spicyLevel: 1 },
      allergens: ['Tree Nuts'],
    },
    {
      id: 'm5',
      name: 'Artisanal Watalappan Custard with Kitul',
      localName: 'කිතුල් හකුරු වටලප්පන්',
      category: 'Artisanal Desserts',
      price: 750,
      priceFormatted: 'Rs. 750',
      description: 'Steamed spiced coconut custard sweetened with organic Kitul jaggery and roasted cashews.',
      isSignature: true,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
      dietary: { isVeg: true, isVegan: false, isHalal: true, isGlutenFree: true, spicyLevel: 0 },
      allergens: ['Eggs', 'Tree Nuts', 'Dairy'],
    },
    {
      id: 'm6',
      name: 'Ceylon Spiced Botanical Mocktail',
      localName: 'ස්පයිස් මොක්ටේල්',
      category: 'Beverages',
      price: 850,
      priceFormatted: 'Rs. 850',
      description: 'Infused cinnamon, passionfruit, fresh lime, crushed mint, and sparkling ginger water.',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      dietary: { isVeg: true, isVegan: true, isHalal: true, isGlutenFree: true, spicyLevel: 0 },
    }
  ];

  const categories = ['All', 'Signature Mains', 'Wood-Fired & Grills', 'Appetizers', 'Artisanal Desserts', 'Beverages'];

  const filteredMenu = activeMenuCategory === 'All' 
    ? sampleMenu 
    : sampleMenu.filter(item => item.category === activeMenuCategory);

  const handleAddToCart = (item: MenuItem) => {
    setPreOrderCart(prev => {
      const existing = prev.find(p => p.menuItem.id === item.id);
      if (existing) {
        return prev.map(p => p.menuItem.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setPreOrderCart(prev => {
      const existing = prev.find(p => p.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(p => p.menuItem.id === itemId ? { ...p, quantity: p.quantity - 1 } : p);
      }
      return prev.filter(p => p.menuItem.id !== itemId);
    });
  };

  const getQuantityInCart = (itemId: string) => {
    return preOrderCart.find(p => p.menuItem.id === itemId)?.quantity || 0;
  };

  const totalPreOrderCost = preOrderCart.reduce(
    (acc, p) => acc + p.menuItem.price * p.quantity,
    0
  );

  const timeSlots = [
    '12:30 PM (Lunch)',
    '01:30 PM (Lunch)',
    '05:30 PM (Sunset)',
    '07:00 PM (Dinner)',
    '07:30 PM (Prime Dinner)',
    '08:30 PM (Dinner)',
    '09:15 PM (Late Night)',
  ];

  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantAddress: restaurant.address,
        restaurantPhoto: restaurant.photos[0],
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
        date: selectedDate,
        timeSlot: selectedTime,
        guestsCount,
        seatingArea,
        specialOccasion,
        specialRequests,
        preOrderedItems: preOrderCart,
      };

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setConfirmedReservation(data.data);
        setStep(4);
        if (onBookingSuccess) {
          onBookingSuccess(data.data);
        }
      } else {
        setErrorMsg(data.error || 'Failed to complete reservation');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100">VIP Table Booking & Pre-Order</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                  Instant Confirmation
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Reserve your table at <strong className="text-zinc-200">{restaurant.name}</strong> • {restaurant.cuisine}
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

        {/* Step Indicator Bar */}
        <div className="px-6 py-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-400">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => step > 1 && setStep(1)}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                step === 1 ? 'text-rose-400' : step > 1 ? 'text-zinc-200' : 'text-zinc-600'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 1 ? 'bg-rose-600 text-white' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span>1. Time & Seating</span>
            </button>

            <span className="text-zinc-700">›</span>

            <button
              onClick={() => step > 2 && setStep(2)}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                step === 2 ? 'text-rose-400' : step > 2 ? 'text-zinc-200' : 'text-zinc-600'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 2 ? 'bg-rose-600 text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span>2. Digital Menu</span>
            </button>

            <span className="text-zinc-700">›</span>

            <button
              onClick={() => step > 3 && setStep(3)}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                step === 3 ? 'text-rose-400' : step > 3 ? 'text-zinc-200' : 'text-zinc-600'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 3 ? 'bg-rose-600 text-white' : step > 3 ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {step > 3 ? '✓' : '3'}
              </span>
              <span>3. Diner Details</span>
            </button>
          </div>

          {totalPreOrderCost > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-xs font-extrabold text-rose-400">
              <ShoppingBag size={13} />
              <span>Pre-order: Rs. {totalPreOrderCost.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <X size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= STEP 1: DATE, TIME & SEATING ================= */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Date & Guests Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                    <Calendar size={14} className="text-rose-400" /> Dining Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                    <Users size={14} className="text-rose-400" /> Number of Guests
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 6, 8, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuestsCount(num)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          guestsCount === num
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <Clock size={14} className="text-rose-400" /> Preferred Seating Time Slot
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        selectedTime === slot
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seating Area Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <Sparkles size={14} className="text-rose-400" /> Select Atmosphere & Seating Zone
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSeatingArea('rooftop')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      seatingArea === 'rooftop'
                        ? 'bg-rose-950/30 border-rose-500 shadow-sm'
                        : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-300 flex items-center justify-center text-base shrink-0 border border-amber-800/50">
                      🏙️
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Rooftop Terrace</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Scenic city & ocean sunset views with candlelit atmosphere</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeatingArea('indoor_ac')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      seatingArea === 'indoor_ac'
                        ? 'bg-rose-950/30 border-rose-500 shadow-sm'
                        : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-300 flex items-center justify-center text-base shrink-0 border border-blue-800/50">
                      ❄️
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Indoor AC VIP Lounge</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Quiet climate-controlled private booth, ideal for dining & meetings</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeatingArea('garden_patio')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      seatingArea === 'garden_patio'
                        ? 'bg-rose-950/30 border-rose-500 shadow-sm'
                        : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-300 flex items-center justify-center text-base shrink-0 border border-emerald-800/50">
                      🌿
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Garden Courtyard</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Open-air tropical garden with ambient fairy lights</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeatingArea('chefs_counter')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      seatingArea === 'chefs_counter'
                        ? 'bg-rose-950/30 border-rose-500 shadow-sm'
                        : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-950 text-purple-300 flex items-center justify-center text-base shrink-0 border border-purple-800/50">
                      👨‍🍳
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Chef's Live Counter</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Front-row seating watching the live flame grills & plating</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Explore Menu & Pre-Order</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          )}

          {/* ================= STEP 2: DIGITAL INTERACTIVE MENU ================= */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">Digital Interactive Menu</h4>
                  <p className="text-xs text-zinc-400">Pre-order dishes so they are prepared fresh upon your arrival</p>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveMenuCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeMenuCategory === cat
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[42vh] overflow-y-auto pr-1">
                {filteredMenu.map((item) => {
                  const inCartQty = getQuantityInCart(item.id);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="flex items-start gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover border border-zinc-800 shrink-0"
                          />
                        )}
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="text-xs font-bold text-zinc-100 group-hover:text-rose-400 transition-colors">
                              {item.name}
                            </h5>
                            <span className="text-xs font-extrabold text-rose-400 shrink-0">
                              {item.priceFormatted}
                            </span>
                          </div>

                          {item.localName && (
                            <div className="text-[11px] text-zinc-500 font-serif">
                              {item.localName}
                            </div>
                          )}

                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Dietary Badges & Cart Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                        <div className="flex items-center gap-1 text-[10px]">
                          {item.dietary?.isVeg && <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">Veg</span>}
                          {item.dietary?.isHalal && <span className="text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800">Halal</span>}
                          {item.dietary?.spicyLevel && item.dietary.spicyLevel > 0 ? (
                            <span className="text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800">
                              {'🌶️'.repeat(item.dietary.spicyLevel)}
                            </span>
                          ) : null}
                        </div>

                        {inCartQty > 0 ? (
                          <div className="flex items-center gap-2 bg-zinc-900 px-2 py-1 rounded-xl border border-zinc-700">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-extrabold text-rose-400">{inCartQty}</span>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item)}
                              className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Plus size={12} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  ← Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    Skip Pre-Order
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Proceed to Diner Details</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 3: DINER DETAILS & OCCASION ================= */}
          {step === 3 && (
            <form onSubmit={handleCompleteBooking} className="space-y-5 animate-fadeIn">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Lead Guest Full Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Kasun Randula"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Confirmation Email Address</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Special Dining Occasion</label>
                  <select
                    value={specialOccasion}
                    onChange={(e) => setSpecialOccasion(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="romantic_date">❤️ Romantic Date Night</option>
                    <option value="birthday">🎂 Birthday Celebration</option>
                    <option value="anniversary">💍 Wedding Anniversary</option>
                    <option value="business">💼 Business Dinner & Meeting</option>
                    <option value="none">Casual Dining with Friends / Family</option>
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Special Seating / Dietary Requests (Optional)</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Quiet corner table, high chair for toddler, allergy notes..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                <div className="font-bold text-zinc-200 flex items-center justify-between">
                  <span>Reservation Overview:</span>
                  <span className="text-rose-400">{restaurant.name}</span>
                </div>
                <div className="text-zinc-400 grid grid-cols-2 gap-2 text-[11px]">
                  <div>📅 Date: <strong className="text-zinc-200">{selectedDate}</strong></div>
                  <div>⏰ Time: <strong className="text-zinc-200">{selectedTime}</strong></div>
                  <div>👥 Guests: <strong className="text-zinc-200">{guestsCount} Persons</strong></div>
                  <div>🏙️ Area: <strong className="text-zinc-200 capitalize">{seatingArea.replace('_', ' ')}</strong></div>
                </div>
                {totalPreOrderCost > 0 && (
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between font-bold text-zinc-200">
                    <span>Pre-Order ({preOrderCart.length} items):</span>
                    <span className="text-rose-400">Rs. {totalPreOrderCost.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  ← Back to Menu
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Confirming Table...' : 'Confirm Reservation & Send Pass'}</span>
                </button>
              </div>

            </form>
          )}

          {/* ================= STEP 4: CONFIRMATION & DIGITAL PASS ================= */}
          {step === 4 && confirmedReservation && (
            <div className="space-y-6 animate-fadeIn text-center py-4">
              
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-zinc-100 font-serif">
                  Table Confirmed at {confirmedReservation.restaurantName}!
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  A confirmation email with your digital check-in pass has been dispatched to <strong className="text-zinc-200">{confirmedReservation.guestEmail}</strong>.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-900 text-white text-left space-y-4 shadow-xl border border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Booking Pass</div>
                    <div className="text-lg font-mono font-extrabold text-white">{confirmedReservation.bookingCode}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white">
                    <QrCode size={24} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Diner</span>
                    <span className="font-bold text-zinc-200">{confirmedReservation.guestName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Party Size</span>
                    <span className="font-bold text-zinc-200">{confirmedReservation.guestsCount} Guests</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Date & Time</span>
                    <span className="font-bold text-zinc-200">{confirmedReservation.date} • {confirmedReservation.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Seating Zone</span>
                    <span className="font-bold text-zinc-200 capitalize">{confirmedReservation.seatingArea.replace('_', ' ')}</span>
                  </div>
                </div>

                {confirmedReservation.preOrderedItems.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-300">
                    <span className="text-rose-400 font-bold">Pre-Ordered Dishes: </span>
                    {confirmedReservation.preOrderedItems.map(p => `${p.menuItem.name} (x${p.quantity})`).join(', ')}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
