import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { getWorkerPolicies, getWorker } from '../api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { format } from 'date-fns';

export const PolicyPage: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();

  const { data: worker } = useQuery({
    queryKey: ['worker', workerId],
    queryFn: () => getWorker(parseInt(workerId!)),
    enabled: !!workerId
  });

  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies', workerId],
    queryFn: () => getWorkerPolicies(parseInt(workerId!)),
    enabled: !!workerId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  const activePolicy = policies?.find((p: any) => p.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/${workerId}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-100">Policy Management</h1>
            {worker && (
              <p className="text-slate-400 mt-1">{worker.name} • {worker.city}</p>
            )}
          </div>
        </div>

        {/* Active Policy */}
        {activePolicy && (
          <Card title="Active Policy" className="mb-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Badge variant={activePolicy.plan_type} size="md" className="uppercase mb-3">
                  {activePolicy.plan_type} Plan
                </Badge>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-slate-400">Weekly Premium</div>
                    <div className="text-2xl font-bold text-slate-100">₹{activePolicy.weekly_premium}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Coverage Period</div>
                    <div className="text-slate-100">
                      {format(new Date(activePolicy.start_date), 'MMM dd')} - {format(new Date(activePolicy.end_date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-3">Coverage Limits</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Weekly Max</span>
                    <span className="text-slate-100 font-semibold">₹{activePolicy.weekly_coverage_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Daily Max</span>
                    <span className="text-slate-100 font-semibold">₹{activePolicy.daily_coverage_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Min Orders</span>
                    <span className="text-slate-100 font-semibold">{activePolicy.min_orders_threshold}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-3">Status</div>
                <Badge variant="active" size="md" className="mb-3">
                  Active
                </Badge>
                <div className="text-sm text-slate-300">
                  {activePolicy.days_remaining} days remaining
                </div>
                {activePolicy.auto_renew && (
                  <div className="text-sm text-cyan-400 mt-2">
                    ✓ Auto-renewal enabled
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="text-sm text-slate-400 mb-3">Covered Disruptions</div>
              <div className="flex flex-wrap gap-2">
                {activePolicy.covered_disruptions.map((disruption: string) => (
                  <span
                    key={disruption}
                    className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-lg border border-slate-600"
                  >
                    {disruption.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Policy History */}
        <Card title="Policy History" subtitle="All policies">
          <div className="space-y-3">
            {policies && policies.length > 0 ? (
              policies.map((policy: any) => (
                <div
                  key={policy.id}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant={policy.plan_type} size="sm" className="uppercase mb-2">
                        {policy.plan_type}
                      </Badge>
                      <div className="text-sm text-slate-400">
                        {format(new Date(policy.start_date), 'MMM dd, yyyy')} - {format(new Date(policy.end_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <Badge variant={policy.status} size="sm">
                      {policy.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Premium</div>
                      <div className="text-slate-100 font-semibold">₹{policy.weekly_premium}/week</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Coverage</div>
                      <div className="text-slate-100 font-semibold">₹{policy.weekly_coverage_limit}/week</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Duration</div>
                      <div className="text-slate-100 font-semibold">7 days</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                No policies found
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
