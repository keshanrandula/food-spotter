'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  X, 
  Trash2, 
  QrCode, 
  CheckCircle2, 
  Utensils, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { TableReservation, UserProfile } from '@/types';
import { Modal } from '../ui/Modal';

interface MyReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  reservations: TableReservation[];
  onCancelReservation: (id: string) => void;
  onOpenNavigation?: (restaurantName: string) => void;
}

export const MyReservationsModal: React.FC<MyReservationsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  reservations,
  onCancelReservation,
  onOpenNavigation,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = reservations.filter(r => r.date >= todayStr && r.status !== 'cancelled');
  const pastBookings = reservations.filter(r => r.date < todayStr || r.status === 'cancelled');

  const displayedList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My VIP Table Reservations" maxWidth="2xl">
      <div className="space-y-5">
        
        {/* Tabs: Upcoming vs Past / Cancelled */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            Upcoming Reservations ({upcomingBookings.length})
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            Past & History ({pastBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1">
          {displayedList.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-rose-400">
                <Calendar size={24} />
              </div>
              <h4 className="text-sm font-bold text-zinc-200">
                {activeTab === 'upcoming' ? 'No Upcoming Reservations' : 'No Past Reservations'}
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {activeTab === 'upcoming' 
                  ? 'Book a table at any featured dining spot and your reservation pass will appear here.'
                  : 'Your completed dining history will be archived here.'
                }
              </p>
            </div>
          ) : (
            displayedList.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-3xl bg-zinc-950 hover:bg-zinc-900/90 border border-zinc-800 transition-all space-y-3.5 group"
              >
                {/* Top Row: Restaurant Name, Code, and Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={res.restaurantPhoto || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'}
                      alt={res.restaurantName}
                      className="w-16 h-16 rounded-2xl object-cover border border-zinc-800 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-zinc-100">{res.restaurantName}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold border border-zinc-700">
                          {res.bookingCode}
                        </span>
                        {res.status === 'confirmed' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                            Confirmed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 text-[10px] font-bold border border-rose-800">
                            Cancelled
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 flex items-center gap-1">
                        <MapPin size={12} className="text-rose-400 shrink-0" /> {res.restaurantAddress}
                      </p>
                    </div>
                  </div>

                  {res.status !== 'cancelled' && (
                    <button
                      onClick={() => onCancelReservation(res.id)}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
                      title="Cancel table booking"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Reservation Details Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                  <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Date</span>
                    <span className="font-bold text-zinc-200">{res.date}</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Time</span>
                    <span className="font-bold text-zinc-200">{res.timeSlot}</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Party Size</span>
                    <span className="font-bold text-zinc-200">{res.guestsCount} Guests</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Seating</span>
                    <span className="font-bold text-zinc-200 capitalize">{res.seatingArea.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Pre-ordered items summary if any */}
                {res.preOrderedItems && res.preOrderedItems.length > 0 && (
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-200">
                      <span className="flex items-center gap-1">
                        <Utensils size={13} className="text-rose-400" /> Pre-Ordered Dishes:
                      </span>
                      <span className="text-rose-400">Rs. {res.totalEstimatedCost.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      {res.preOrderedItems.map(p => `${p.menuItem.name} (x${p.quantity})`).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>{displayedList.length} reservations</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </Modal>
  );
};
