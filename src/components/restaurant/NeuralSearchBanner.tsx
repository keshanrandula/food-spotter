'use client';

import React from 'react';
import { Sparkles, Check, ArrowRight, Compass } from 'lucide-react';

interface NeuralSearchBannerProps {
  onSelectPrompt: (prompt: string) => void;
}

export const NeuralSearchBanner: React.FC<NeuralSearchBannerProps> = ({ onSelectPrompt }) => {
  const examplePrompts = [
    "Intimate date night spot with rare orange wine",
    "Best charred octopus & sea salt focaccia",
    "Late-night counterside gyoza under $120",
  ];

  return (
    <div className="rounded-3xl bg-warm-100/90 border border-warm-200/90 p-8 sm:p-12 shadow-savor backdrop-blur-sm relative overflow-hidden my-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-savor-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side Info */}
        <div className="lg:col-span-7 space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-savor-100 text-savor-700 border border-savor-200">
            <Compass size={14} className="text-savor-600" /> Contextual Taste Search
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-serif tracking-tight leading-tight">
            Looking for a specific dish craving?
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
            Unlike generic directory apps, SavorAI scans thousands of verified diner reviews, menu ingredients, and real-time culinary nuances. Whether you need a <strong className="text-savor-700">crispy-edge gluten-free sourdough</strong>, <strong className="text-savor-700">candlelit back-patio natural wine bar</strong>, or <strong className="text-savor-700">authentic A5 wagyu skewers with minimal noise</strong>, our algorithms pinpoint the exact culinary match.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-stone-700">
            <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-stone-200 shadow-sm">
              <Check size={14} className="text-emerald-600" /> Dietary Tolerance Verification
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-stone-200 shadow-sm">
              <Check size={14} className="text-emerald-600" /> Acoustics & Ambiance Score
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-stone-200 shadow-sm">
              <Check size={14} className="text-emerald-600" /> Real-Time Dish Availability
            </span>
          </div>
        </div>

        {/* Right Side Example Prompts */}
        <div className="lg:col-span-5 bg-white/90 p-6 sm:p-8 rounded-3xl border border-warm-200/90 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Try an example prompt:
          </h4>

          <div className="space-y-2.5">
            {examplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(prompt)}
                className="w-full p-3.5 rounded-2xl bg-stone-50 hover:bg-savor-50 border border-stone-200/80 hover:border-savor-300 text-xs font-medium text-stone-800 hover:text-savor-700 transition-all flex items-center justify-between group cursor-pointer text-left shadow-2xs"
              >
                <span>"{prompt}"</span>
                <ArrowRight size={14} className="text-stone-400 group-hover:text-savor-600 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>

          <button
            onClick={() => onSelectPrompt("Intimate date night spot with rare orange wine")}
            className="w-full py-3.5 rounded-2xl text-xs font-bold bg-savor-700 hover:bg-savor-800 text-white shadow-md shadow-savor-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Sparkles size={16} /> Explore Neural Search
          </button>
        </div>
      </div>
    </div>
  );
};
