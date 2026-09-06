'use client';

import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Utensils, Compass, ThumbsUp } from 'lucide-react';
import { AiSummary } from '@/types';
import { Badge } from '../ui/Badge';

interface AiSummaryBoxProps {
  summary: AiSummary;
}

export const AiSummaryBox: React.FC<AiSummaryBoxProps> = ({ summary }) => {
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-b from-rose-950/20 via-zinc-900 to-zinc-900/90 p-5 shadow-xl backdrop-blur-md">
      {/* AI Summary Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              AI Review Summary
              <Badge variant="rose">Powered by OpenRouter</Badge>
            </h4>
            <p className="text-xs text-zinc-400">Synthesized insights from verified diner reviews</p>
          </div>
        </div>

        {/* AI Score Badge */}
        <div className="text-right">
          <div className="text-2xl font-extrabold bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
            {summary.overallScore.toFixed(1)} <span className="text-xs text-zinc-400 font-normal">/ 10</span>
          </div>
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">AI Sentiment Score</span>
        </div>
      </div>

      {/* Overview Paragraph */}
      <p className="text-sm text-zinc-300 leading-relaxed mb-5 bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/60">
        "{summary.overallSummary}"
      </p>

      {/* Sentiment Breakdown Bar */}
      {summary.sentimentBreakdown && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1"><ThumbsUp size={12} className="text-emerald-400" /> Positive ({summary.sentimentBreakdown.positive}%)</span>
            <span>Neutral ({summary.sentimentBreakdown.neutral}%)</span>
            <span>Critical ({summary.sentimentBreakdown.negative}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${summary.sentimentBreakdown.positive}%` }} />
            <div className="bg-amber-500 h-full" style={{ width: `${summary.sentimentBreakdown.neutral}%` }} />
            <div className="bg-rose-500 h-full" style={{ width: `${summary.sentimentBreakdown.negative}%` }} />
          </div>
        </div>
      )}

      {/* Grid of Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pros */}
        <div className="bg-zinc-950/60 p-4 rounded-xl border border-emerald-500/10">
          <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 size={15} /> Highlight Strengths
          </h5>
          <ul className="space-y-2">
            {summary.pros.map((pro, index) => (
              <li key={index} className="text-xs text-zinc-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                {pro}
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="bg-zinc-950/60 p-4 rounded-xl border border-rose-500/10">
          <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <AlertCircle size={15} /> Things to Note
          </h5>
          <ul className="space-y-2">
            {summary.cons.map((con, index) => (
              <li key={index} className="text-xs text-zinc-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Dishes & Ambiance */}
      <div className="mt-4 pt-4 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
            <Utensils size={14} className="text-amber-400" /> Must-Try:
          </span>
          {summary.mustTryDishes.map((dish, i) => (
            <Badge key={i} variant="amber" className="bg-amber-500/10">
              {dish}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Compass size={14} className="text-indigo-400" />
          <span>Vibe: <strong className="text-zinc-200">{summary.ambiance}</strong></span>
        </div>
      </div>
    </div>
  );
};
