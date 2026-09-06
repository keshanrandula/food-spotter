import React from 'react';
import { UtensilsCrossed, Sparkles, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-warm-100/60 border-t border-warm-200 text-stone-700 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-savor-600 flex items-center justify-center text-white">
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-stone-900 font-serif">
                Savor<span className="font-sans font-extrabold text-savor-600">AI</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
              Discover sensory culinary gems, AI-synthesized diner highlights, and artisanal gastronomy across top epicurean neighborhoods.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-200/80 text-stone-700">
                <Check size={12} className="text-emerald-600" /> Verified Palates
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-savor-100 text-savor-700 border border-savor-200">
                <Sparkles size={12} className="text-savor-600" /> AI Palate Intelligence
              </span>
            </div>
          </div>

          {/* Cuisines */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Cuisines</h4>
            <ul className="space-y-2 text-xs text-stone-600 font-medium">
              <li className="hover:text-savor-600 transition-colors cursor-pointer">Handmade Pasta & Trattorias</li>
              <li className="hover:text-savor-600 transition-colors cursor-pointer">Contemporary Omakase</li>
              <li className="hover:text-savor-600 transition-colors cursor-pointer">Woodfired & Hearth</li>
              <li className="hover:text-savor-600 transition-colors cursor-pointer">Plant-forward Tasting</li>
              <li className="hover:text-savor-600 transition-colors cursor-pointer">Artisanal Patisserie</li>
            </ul>
          </div>

          {/* City Discovery */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">City Discovery</h4>
            <ul className="space-y-2 text-xs text-stone-600 font-medium">
              <li className="hover:text-savor-600 transition-colors cursor-pointer">New York Dining</li>
              <li className="hover:text-savor-600 transition-colors cursor-pointer">San Francisco Bay</li>
              <li className="hover:text-savor-600 transition-colors cursor-pointer">London Gastropubs</li>
              <li className="hover:text-savor-600 transition-colors cursor-pointer">Tokyo Secret Tables</li>
              <li className="hover:text-savor-600 transition-colors cursor-pointer">Parisian Neo-Bistros</li>
            </ul>
          </div>

          {/* Epicurean Digest Newsletter */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Epicurean Digest</h4>
            <p className="text-xs text-stone-500">
              Receive weekly curated chef table insights and newly synthesized food trends.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Your epicurean email"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-savor-600/30"
              />
              <button className="w-full py-2.5 rounded-xl text-xs font-bold bg-savor-700 hover:bg-savor-800 text-white shadow-sm transition-all cursor-pointer">
                Subscribe to Table Notes
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-warm-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-medium">
          <div>© 2026 SavorAI Inc. Sensory culinary intelligence for mindful diners.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-stone-900">Terms of Gastronomy</a>
            <a href="#" className="hover:text-stone-900">Privacy Policy</a>
            <a href="#" className="hover:text-stone-900">Editorial Standards</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
