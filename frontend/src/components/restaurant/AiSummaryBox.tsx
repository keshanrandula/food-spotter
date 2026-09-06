'use client';

import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Utensils } from 'lucide-react';
import { AiSummary } from '@/types';
import { Badge } from '../ui/Badge';

interface AiSummaryBoxProps {
  summary: AiSummary;
}

export const AiSummaryBox: React.FC<AiSummaryBoxProps> = ({ summary }) => {
  return (
    <div className="rounded-2xl border border-savor-200 bg-savor-50 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-savor-200/60 pb-3">
        <div className="flex items-center gap-2 text-savor-700 font-bold text-xs uppercase tracking-wider">
          <Sparkles size={16} /> AI Review Summary
        </div>
        <div className="text-xs font-bold text-savor-700">
          Score: {summary.overallScore.toFixed(1)} / 10
        </div>
      </div>

      <p className="text-xs text-stone-700 leading-relaxed italic bg-white p-3.5 rounded-xl border border-savor-200/80">
        "{summary.overallSummary}"
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-white p-3 rounded-xl border border-emerald-200">
          <h5 className="font-bold text-emerald-700 mb-1.5 flex items-center gap-1">
            <CheckCircle2 size={14} /> Strengths
          </h5>
          <ul className="space-y-1 text-stone-600">
            {summary.pros.map((p, i) => (
              <li key={i}>• {p}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-3 rounded-xl border border-rose-200">
          <h5 className="font-bold text-rose-700 mb-1.5 flex items-center gap-1">
            <AlertCircle size={14} /> Notes
          </h5>
          <ul className="space-y-1 text-stone-600">
            {summary.cons.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
