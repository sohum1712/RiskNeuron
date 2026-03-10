import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'chart';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ variant = 'text', className }) => {
  const baseStyles = 'animate-pulse bg-slate-700 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    card: 'h-32 w-full',
    chart: 'h-64 w-full'
  };

  return <div className={clsx(baseStyles, variants[variant], className)} />;
};

export const SkeletonGroup: React.FC<{ count?: number; variant?: 'text' | 'card' | 'chart' }> = ({ 
  count = 3, 
  variant = 'text' 
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant={variant} />
      ))}
    </div>
  );
};
