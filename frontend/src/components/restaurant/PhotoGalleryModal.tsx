'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface PhotoGalleryModalProps {
  photos: string[];
  restaurantName: string;
  isOpen: boolean;
  initialIndex?: number;
  onClose: () => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  photos,
  restaurantName,
  isOpen,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const prev = useCallback(() => {
    setCurrentIndex(i => (i === 0 ? photos.length - 1 : i - 1));
  }, [photos.length]);

  const next = useCallback(() => {
    setCurrentIndex(i => (i === photos.length - 1 ? 0 : i + 1));
  }, [photos.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, prev, next]);

  if (!isOpen || photos.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
        {currentIndex + 1} / {photos.length} &nbsp;&bull;&nbsp; {restaurantName}
      </div>

      {/* Left Arrow */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Main Image */}
      <div
        className="relative max-w-5xl max-h-[80vh] w-full mx-16 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={currentIndex}
          src={photos[currentIndex]}
          alt={`${restaurantName} photo ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl animate-fadeIn"
        />
      </div>

      {/* Right Arrow */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {photos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden transition-all cursor-pointer flex-shrink-0 ${
                idx === currentIndex
                  ? 'ring-2 ring-white scale-110'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
