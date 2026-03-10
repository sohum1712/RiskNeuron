import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, TrendingDown, Shield, ShieldOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDashboard } from '../api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EarningsChart } from '../components/charts/EarningsChart';
import { PolicyCard } from '../components/PolicyCard';
import { DisruptionAlert } from '../components/DisruptionAlert';
import { WeeklyPremiumCard } from '../components/WeeklyPremiumCard';
import { format } from 'date-fns';

export const WorkerDashboard: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();

  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', workerId],
    queryFn: () => getDashboard(parseInt(workerId!)),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!workerId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Skeleton variant="card" className="mb-6" />
          <div className="grid lg:grid-cols-4 gap-6 mb-6">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
          <Skeleton variant="chart" />
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Worker not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const { worker, active_policy, active_disruptions, this_week_stats, earnings_chart, recent_claims } = dashboard;

  const earningsChange = this_week_stats?.earnings_vs_last_week || 0;
  const isProtected = !!active_policy;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{worker.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={worker.platform as any} size="sm">
                  {worker.platform.replace(/_/g, ' ')}
                </Badge>
                <span className="text-sm text-slate-400">
                  {worker.zone_name} • {worker.city}
                </span>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {isProtected ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Protected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <ShieldOff className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">Unprotected</span>
                <Button variant="primary" size="sm" onClick={() => navigate('/onboarding')} className="ml-2">
                  Get Protected →
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Disruption Alert */}
        {active_disruptions && active_disruptions.length > 0 && (
          <DisruptionAlert disruptions={active_disruptions} />
        )}

        {/* Stats Row */}
        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">This Week's Earnings</div>
                <div className="text-3xl font-bold text-slate-100">
                  ₹{(this_week_stats?.total_earnings || 0).toFixed(0)}
                </div>
                <div className={`flex items-center gap-1 text-sm mt-2 ${
                  earningsChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {earningsChange >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(earningsChange).toFixed(1)}% vs last week</span>
                </div>
              </div>
            </div>
          </Card>

          {isProtected && active_policy && (
            <>
              <Card>
                <div className="text-sm text-slate-400 mb-1">Weekly Coverage</div>
                <div className="text-2xl font-bold text-slate-100 mb-1">
                  ₹{((active_policy?.weekly_coverage_limit || 0) - (this_week_stats?.coverage_used || 0)).toFixed(0)}
                </div>
                <div className="text-sm text-slate-400">
                  of ₹{active_policy.weekly_coverage_limit} remaining
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div 
                      className="bg-cyan-500 h-1.5 rounded-full transition-all" 
                      style={{ width: `${(this_week_stats.coverage_used / active_policy.weekly_coverage_limit) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  {active_policy.days_remaining} days remaining
                </div>
              </Card>

              <Card>
                <div className="text-sm text-slate-400 mb-1">Total Payouts Received</div>
                <div className="text-3xl font-bold text-emerald-400">
                  ₹{(this_week_stats?.total_payouts_received || 0).toFixed(0)}
                </div>
                <div className="text-sm text-slate-400 mt-2">All time</div>
              </Card>
            </>
          )}

          <Card>
            <div className="text-sm text-slate-400 mb-1">Risk Level</div>
            <Badge 
              variant={worker.risk_tier as any} 
              size="md" 
              className="text-xl font-bold uppercase"
            >
              {worker.risk_tier}
            </Badge>
            <div className="text-2xl font-bold text-slate-100 mt-2">
              {Math.round(worker.risk_score * 100)}
            </div>
            <div className="text-sm text-slate-400">Risk Score</div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card title="14-Day Earnings Trend" subtitle="Actual vs Expected">
              <EarningsChart data={earnings_chart} />
            </Card>

            {isProtected && active_policy && (
              <PolicyCard
                planType={active_policy.plan_type as any}
                weeklyPremium={active_policy.weekly_premium}
                weeklyLimit={active_policy.weekly_coverage_limit}
                dailyLimit={active_policy.daily_coverage_limit}
                daysRemaining={active_policy.days_remaining}
                coveredDisruptions={active_policy.covered_disruptions}
                onRenew={() => {
                  // TODO: Implement renew
                  refetch();
                }}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {isProtected && active_policy && (
              <WeeklyPremiumCard
                weeklyPremium={active_policy.weekly_premium}
                coverageUsed={this_week_stats.coverage_used}
                weeklyLimit={active_policy.weekly_coverage_limit}
                daysRemaining={active_policy.days_remaining}
                startDate={active_policy.start_date}
              />
            )}

            <Card title="Dark Store Status">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-100">{worker.dark_store_name}</div>
                  <div className="text-sm text-slate-400 mt-1">{worker.zone_name}</div>
                </div>
                <Badge variant="active" size="md">
                  Operational
                </Badge>
              </div>
            </Card>

            <Card title="Recent Claims" subtitle="Last 5 claims">
              {recent_claims && recent_claims.length > 0 ? (
                <div className="space-y-3">
                  {recent_claims.map((claim: any) => (
                    <div 
                      key={claim.id} 
                      className="bg-slate-900/50 rounded-lg p-3 border border-slate-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-semibold text-slate-100">
                            {claim.disruption_type?.replace(/_/g, ' ') || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {format(new Date(claim.claim_date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        <Badge variant={claim.status} size="sm">
                          {claim.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-slate-400">Expected</div>
                          <div className="text-slate-100 font-semibold">₹{claim.expected_earnings?.toFixed(0) || 0}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Actual</div>
                          <div className="text-slate-100 font-semibold">₹{claim.actual_earnings?.toFixed(0) || 0}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Payout</div>
                          <div className="text-emerald-400 font-semibold">₹{claim.payout_amount?.toFixed(0) || 0}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No claims yet
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
