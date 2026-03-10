import React from 'react';
import { Card } from './ui/Card';
import { clsx } from 'clsx';

interface WeeklyPremiumCardProps {
  weeklyPremium: number;
  coverageUsed: number;
  weeklyLimit: number;
  daysRemaining: number;
  startDate: string;
}

export const WeeklyPremiumCard: React.FC<WeeklyPremiumCardProps> = ({
  weeklyPremium,
  coverageUsed,
  weeklyLimit,
  daysRemaining,
  startDate
}) => {
  const coveragePercentage = (coverageUsed / weeklyLimit) * 100;
  const today = new Date();
  const start = new Date(startDate);
  const currentDay = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card title="Weekly Coverage" className="bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="space-y-4">
        {/* 7-day calendar */}
        <div className="flex justify-between gap-2">
          {days.map((day, idx) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400">{day}</span>
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                  idx === currentDay
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : idx < currentDay
                    ? 'bg-slate-700 text-slate-400'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                )}
              >
                {idx + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Premium and coverage */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
          <div>
            <div className="text-sm text-slate-400">Weekly Premium</div>
            <div className="text-2xl font-bold text-slate-100">₹{weeklyPremium}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Coverage Remaining</div>
            <div className="text-2xl font-bold text-emerald-400">
              ₹{(weeklyLimit - coverageUsed).toFixed(0)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Coverage Used</span>
            <span className="text-slate-300">
              ₹{coverageUsed.toFixed(0)} / ₹{weeklyLimit}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                coveragePercentage > 80 ? 'bg-red-500' : 
                coveragePercentage > 50 ? 'bg-amber-500' : 
                'bg-emerald-500'
              )}
              style={{ width: `${Math.min(coveragePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Days remaining */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <span className="text-sm text-slate-400">Days Remaining</span>
          <span className={clsx(
            'text-lg font-bold',
            daysRemaining <= 2 ? 'text-amber-400' : 'text-slate-100'
          )}>
            {daysRemaining} days
          </span>
        </div>
      </div>
    </Card>
  );
};
