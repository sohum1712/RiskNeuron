import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Glassmorphic card consistent with the landing page visual language
export const Card: React.FC<CardProps> = ({ title, subtitle, action, children, className }) => {
  return (
    <div className={clsx(
      'bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6',
      className
    )}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-5">
          <div>
            {title && (
              <h3
                className="text-base font-black text-white/80 tracking-tight"
                style={{ fontFamily: "'Barlow', sans-serif" }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-white/30 mt-1 font-medium">{subtitle}</p>
            )}
          </div>
          {action && <div className="ml-4">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
