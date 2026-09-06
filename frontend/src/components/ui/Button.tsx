import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all cursor-pointer';
  const variants = {
    primary: 'bg-savor-600 hover:bg-savor-700 text-white shadow-md shadow-savor-600/20',
    secondary: 'bg-warm-100 hover:bg-warm-200 text-stone-800 border border-warm-200',
    outline: 'border border-savor-600/40 text-savor-700 hover:bg-savor-50',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1',
    md: 'px-4 py-2.5 text-xs gap-1.5',
    lg: 'px-6 py-3 text-sm gap-2',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || isLoading} {...props}>
      {children}
    </button>
  );
};
