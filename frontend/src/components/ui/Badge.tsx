import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'rose' | 'amber' | 'emerald' | 'indigo' | 'zinc';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'zinc' }) => {
  const styles = {
    rose: 'bg-savor-100 text-savor-700 border border-savor-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    zinc: 'bg-stone-100 text-stone-700 border border-stone-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
};
