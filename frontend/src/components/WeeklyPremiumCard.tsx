import React from 'react';
import { clsx } from 'clsx';
import { Shield } from 'lucide-react';

const font = {
  display: "'Barlow', sans-serif",
  body: "'DM Sans', sans-serif",
  label: "'Space Grotesk', sans-serif",
};

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
  startDate,
}) => {
  const coveragePercentage = Math.min((coverageUsed / weeklyLimit) * 100, 100);
  const today = new Date();
  const start = new Date(startDate);
  const currentDay = Math.min(
    Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    6
  );
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6 relative overflow-hidden" style={{ fontFamily: font.body }}>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#5690FF]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-5">
        <Shield className="w-4 h-4 text-[#5690FF]" />
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]" style={{ fontFamily: font.label }}>
          Weekly Coverage
        </span>
      </div>

      <div className="flex justify-between gap-1 mb-5">
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-[9px] text-white/20 font-bold uppercase">{day}</span>
            <div className={clsx(
              'w-full aspect-square rounded-lg flex items-center justify-center text-[9px] font-black transition-all',
              idx === currentDay ? 'bg-[#5690FF] text-white shadow-lg shadow-[#5690FF]/30' :
              idx < currentDay ? 'bg-white/10 text-white/40' :
              'bg-white/[0.03] border border-white/[0.06] text-white/20'
            )}>
              {idx + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1" style={{ fontFamily: font.label }}>Premium</p>
          <p className="text-xl font-black text-white/80" style={{ fontFamily: font.display }}>₹{weeklyPremium}</p>
        </div>
        <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1" style={{ fontFamily: font.label }}>Remaining</p>
          <p className="text-xl font-black text-[#22C55E]" style={{ fontFamily: font.display }}>₹{(weeklyLimit - coverageUsed).toFixed(0)}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[9px] font-black text-white/20 uppercase tracking-widest mb-2" style={{ fontFamily: font.label }}>
          <span>Coverage Used</span>
          <span>₹{coverageUsed.toFixed(0)} / ₹{weeklyLimit}</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-500',
              coveragePercentage > 80 ? 'bg-red-500' :
              coveragePercentage > 50 ? 'bg-amber-500' : 'bg-[#22C55E]'
            )}
            style={{ width: `${coveragePercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest" style={{ fontFamily: font.label }}>Days Left</span>
        <span className={clsx('text-lg font-black', daysRemaining <= 2 ? 'text-amber-400' : 'text-white/70')} style={{ fontFamily: font.display }}>
          {daysRemaining}
        </span>
      </div>
    </div>
  );
};
