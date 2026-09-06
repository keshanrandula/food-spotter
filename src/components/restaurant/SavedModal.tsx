'use client';

import React from 'react';
import { Bookmark, Trash2, MapPin, Star, ExternalLink } from 'lucide-react';
import { SavedRestaurant } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
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
    <Modal isOpen={isOpen} onClose={onClose} title="Your Saved Restaurants" maxWidth="2xl">
      <div className="space-y-4">
        {savedItems.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Bookmark size={24} />
            </div>
            <h4 className="text-base font-bold text-zinc-200">No Saved Restaurants Yet</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Click the bookmark icon on any restaurant card to save your favorite dining spots here for easy access.
            </p>
          </div>
        ) : (
          savedItems.map((item) => (
            <div
              key={item.placeId}
              className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start justify-between gap-4 group hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <Bookmark size={20} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-bold text-zinc-100">{item.name}</h4>
                    <Badge variant="indigo">{item.cuisine}</Badge>
                  </div>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                    <MapPin size={12} className="text-zinc-500" /> {item.address}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                    <Star size={12} className="fill-amber-400" /> {item.rating.toFixed(1)} Rating
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRemoveSaved(item.placeId)}
                  className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Remove from saved"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
