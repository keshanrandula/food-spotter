'use client';

import React from 'react';
import { Bookmark, Trash2, MapPin, Star } from 'lucide-react';
import { SavedRestaurant } from '@/types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

interface SavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedRestaurant[];
  onRemoveSaved: (placeId: string) => void;
}

export const SavedModal: React.FC<SavedModalProps> = ({
  isOpen,
  onClose,
  savedItems,
  onRemoveSaved,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Saved Epicurean Spots" maxWidth="2xl">
      <div className="space-y-4">
        {savedItems.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Bookmark size={24} />
            </div>
            <h4 className="text-sm font-bold text-stone-900">No Saved Restaurants</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Save favorite spots by clicking the heart icon on any restaurant card.
            </p>
          </div>
        ) : (
          savedItems.map((item) => (
            <div
              key={item.placeId}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.photoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-stone-900 font-serif">{item.name}</h4>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin size={12} className="text-savor-600" /> {item.address}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onRemoveSaved(item.placeId)}
                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
