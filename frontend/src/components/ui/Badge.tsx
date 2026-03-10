import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  variant?: 'low' | 'medium' | 'high' | 'approved' | 'paid' | 'rejected' | 'pending' | 'flagged_fraud' | 'zepto' | 'blinkit' | 'swiggy' | 'multiple' | 'basic' | 'standard' | 'premium' | 'active' | 'expired';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'medium', size = 'md', children, className }) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-md';
  
  const variants = {
    // Risk tiers
    low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    high: 'bg-red-500/10 text-red-400 border border-red-500/20',
    
    // Claim status
    approved: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    rejected: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    flagged_fraud: 'bg-red-500/10 text-red-400 border border-red-500/20',
    
    // Platforms
    zepto: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    blinkit: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    swiggy: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    multiple: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    
    // Plans
    basic: 'bg-slate-500/10 text-slate-300 border border-slate-500/20',
    standard: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    premium: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    
    // Policy status
    active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    expired: 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
