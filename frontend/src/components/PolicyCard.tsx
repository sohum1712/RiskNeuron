import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Shield } from 'lucide-react';
import { clsx } from 'clsx';

interface PolicyCardProps {
  planType: 'basic' | 'standard' | 'premium';
  weeklyPremium: number;
  weeklyLimit: number;
  dailyLimit: number;
  daysRemaining: number;
  coveredDisruptions: string[];
  onRenew?: () => void;
  isRenewing?: boolean;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  planType,
  weeklyPremium,
  weeklyLimit,
  dailyLimit,
  daysRemaining,
  coveredDisruptions,
  onRenew,
  isRenewing = false
}) => {
  const totalDays = 7;
  const progressPercentage = ((totalDays - daysRemaining) / totalDays) * 100;

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-cyan-400" />
            <div>
              <Badge variant={planType} size="md" className="uppercase font-bold">
                {planType} Plan
              </Badge>
            </div>
          </div>
        </div>

        {/* Premium and coverage */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Weekly Premium</div>
            <div className="text-xl font-bold text-slate-100">₹{weeklyPremium}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Max Coverage</div>
            <div className="text-xl font-bold text-emerald-400">₹{weeklyLimit}</div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Daily Limit</div>
          <div className="text-lg font-semibold text-slate-100">₹{dailyLimit} per day</div>
        </div>

        {/* Days remaining progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Coverage Period</span>
            <span className={clsx(
              'font-semibold',
              daysRemaining <= 2 ? 'text-amber-400' : 'text-slate-300'
            )}>
              {daysRemaining} days left
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                daysRemaining <= 2 ? 'bg-amber-500' : 'bg-cyan-500'
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Covered disruptions */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Covered Disruptions</div>
          <div className="flex flex-wrap gap-2">
            {coveredDisruptions.map((disruption) => (
              <span
                key={disruption}
                className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded border border-slate-600"
              >
                {disruption.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Renew button */}
        {daysRemaining <= 2 && onRenew && (
          <Button
            variant="primary"
            size="md"
            onClick={onRenew}
            loading={isRenewing}
            className="w-full"
          >
            Renew for ₹{weeklyPremium}
          </Button>
        )}
      </div>
    </Card>
  );
};
