'use client';

import React from 'react';
import { 
  Sparkles, 
  Brain, 
  MapPin, 
  ShieldCheck, 
  Bot, 
  Flame, 
  Award, 
  Users, 
  Compass, 
  CheckCircle2 
} from 'lucide-react';

export const AboutUsSection: React.FC = () => {
  const features = [
    {
      icon: <Brain className="text-savor-600 dark:text-savor-400" size={24} />,
      title: 'Neural Review Intelligence',
      description:
        'Powered by advanced OpenRouter LLMs, our AI parses thousands of authentic guest reviews to deliver concise pros, cons, and must-try dishes in seconds.',
      badge: 'AI Synthesis',
    },
    {
      icon: <Compass className="text-amber-500" size={24} />,
      title: 'Hyper-Local Discovery',
      description:
        'Live geospatial routing powered by OpenStreetMap & Geoapify brings you real-time dining options closest to your exact GPS coordinates.',
      badge: 'Real-Time Maps',
    },
    {
      icon: <ShieldCheck className="text-emerald-500" size={24} />,
      title: 'Zero Biased Ratings',
      description:
        'No sponsored fake reviews. We aggregate verified community feedback and multi-dimensional sentiment metrics to give you genuine culinary truth.',
      badge: '100% Authentic',
    },
    {
      icon: <Bot className="text-indigo-500" size={24} />,
      title: 'Chef AI Concierge',
      description:
        'An interactive conversational assistant trained on gastronomic data to guide your late-night cravings, dietary preferences, or date-night reservations.',
      badge: '24/7 Sommelier',
    },
  ];

  const stats = [
    { value: '12,000+', label: 'Verified Eateries', sub: 'Across 50+ Cities' },
    { value: '3.2M+', label: 'Dishes Analyzed', sub: 'Via Neural LLMs' },
    { value: '99.4%', label: 'Flavor Accuracy', sub: 'Community Approved' },
    { value: '0.4s', label: 'Search Latency', sub: 'Ultra Fast Discovery' },
  ];

  return (
    <section id="about-section" className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Top Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-savor-600/10 border border-savor-600/20 text-savor-600 dark:text-savor-400 text-xs font-bold tracking-wide uppercase">
          <Sparkles size={14} className="text-savor-600 dark:text-savor-400" />
          Our Mission & Philosophy
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-900 dark:text-stone-100 font-serif tracking-tight leading-tight">
          Where Artificial Intelligence <br />
          <span className="bg-gradient-to-r from-savor-600 via-amber-500 to-savor-500 bg-clip-text text-transparent">
            Meets the Art of Gastronomy
          </span>
        </h2>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
          FoodSpotter was born out of a simple frustration: scrolling through hundreds of chaotic reviews just to find a great meal. We combined cutting-edge machine learning with live geospatial intelligence to curate the world’s finest dining moments for you.
        </p>
      </div>

      {/* 2-Column Hero Story Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-warm-100/90 via-white to-warm-200/40 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-800 border border-warm-200/80 dark:border-zinc-800 p-8 sm:p-12 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <Flame size={14} /> The FoodSpotter Difference
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 font-serif leading-snug">
              Every dish tells a story. We help you find the ones worth tasting.
            </h3>

            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Traditional review apps overwhelm you with long paragraphs and conflicting opinions. FoodSpotter’s Neural Engine filters the noise—instantly highlighting signature dishes, vibe metrics, dietary options, and price-to-value ratios.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'Instant pros & cons generated from hundreds of real diners',
                'Interactive Leaflet maps with custom culinary filters',
                'One-click bookmarking & personal saved gastronomy lists',
                'Chef AI conversational assistance for personalized taste matchmaking'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                  <CheckCircle2 size={16} className="text-savor-600 dark:text-savor-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Showcase Box */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 group">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80"
              alt="Culinary Atmosphere"
              className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Award size={14} />
                <span>Crafted for True Food Enthusiasts</span>
              </div>
              <h4 className="text-lg font-bold font-serif">Curated with Passion & Modern Technology</h4>
              <p className="text-xs text-stone-300">Discovering hidden bistros, beachside grills, and Michelin-tier dining.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group relative rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-warm-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-warm-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300">
                {feature.badge}
              </span>
            </div>

            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
              {feature.title}
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Stats Counter Banner */}
      <div className="rounded-3xl bg-savor-600 text-white p-8 sm:p-10 shadow-xl shadow-savor-600/20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s, idx) => (
          <div key={idx} className="space-y-1 border-r border-white/20 last:border-r-0">
            <div className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight">{s.value}</div>
            <div className="text-xs sm:text-sm font-bold text-amber-200">{s.label}</div>
            <div className="text-[11px] text-white/80">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
