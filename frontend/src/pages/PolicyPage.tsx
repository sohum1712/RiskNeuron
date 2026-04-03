import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Shield, RotateCcw, CheckCircle } from 'lucide-react';
import { getWorkerPolicies, getWorker, renewPolicy } from '../api/client';
import { Badge } from '../components/ui/Badge';
import { PageShell } from '../components/PageShell';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const font = {
  display: "'Barlow', sans-serif",
  body: "'DM Sans', sans-serif",
  label: "'Space Grotesk', sans-serif",
};

export const PolicyPage: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const [renewingId, setRenewingId] = useState<number | null>(null);

  const { data: worker } = useQuery({
    queryKey: ['worker', workerId],
    queryFn: () => getWorker(parseInt(workerId!)),
    enabled: !!workerId,
  });

  const { data: policies, isLoading, refetch } = useQuery({
    queryKey: ['policies', workerId],
    queryFn: () => getWorkerPolicies(parseInt(workerId!)),
    enabled: !!workerId,
  });

  const handleRenew = async (policyId: number, planType: string) => {
    setRenewingId(policyId);
    try {
      await renewPolicy(policyId);
      toast.success(`${planType} plan renewed for another week`);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Renewal failed');
    } finally {
      setRenewingId(null);
    }
  };

  const activePolicy = policies?.find((p: any) => p.status === 'active');
  const historyPolicies = policies?.filter((p: any) => p.status !== 'active') || [];

  const navItems = workerId ? [
    { label: 'Dashboard', path: `/dashboard/${workerId}` },
    { label: 'Claims', path: `/claims/${workerId}` },
    { label: 'Profile', path: `/profile/${workerId}` },
  ] : [];

  return (
    <PageShell
      workerId={workerId}
      pageLabel="Policy Control"
      overline="Protection Node"
      navItems={navItems}
    >
      {/* Page header */}
      <div className="mb-10">
        <p className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: font.label }}>
          Protection Node
        </p>
        <h1 className="text-4xl font-black tracking-tight mb-1" style={{ fontFamily: font.display }}>
          Policy Control
        </h1>
        {worker && (
          <p className="text-white/40 text-sm font-medium">{worker.name} · {worker.zone_name}</p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-40 bg-white/[0.03] rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Active policy */}
          {activePolicy ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-white/[0.03] border border-[#F97316]/20 rounded-2xl p-6 relative overflow-hidden">
                {/* Glow */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#F97316]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#22C55E]/10 rounded-xl">
                    <Shield className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-[#22C55E] uppercase tracking-[0.2em]" style={{ fontFamily: font.label }}>
                      Active Coverage
                    </p>
                    <p className="text-lg font-black text-white/80" style={{ fontFamily: font.display }}>
                      {activePolicy.plan_type.toUpperCase()} Plan
                    </p>
                  </div>
                  <Badge variant="active" size="sm" className="ml-auto">Active</Badge>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Weekly Premium', value: `₹${activePolicy.weekly_premium}` },
                    { label: 'Weekly Max', value: `₹${activePolicy.weekly_coverage_limit}` },
                    { label: 'Daily Max', value: `₹${activePolicy.daily_coverage_limit}` },
                    { label: 'Days Remaining', value: `${activePolicy.days_remaining}d`, highlight: activePolicy.days_remaining <= 2 },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 bg-white/[0.05] rounded-xl border border-white/[0.08]">
                      <p className="text-[10px] font-black text-white/55 uppercase tracking-widest mb-1" style={{ fontFamily: font.label }}>
                        {stat.label}
                      </p>
                      <p className={clsx('text-2xl font-black', stat.highlight ? 'text-amber-400' : 'text-white/80')} style={{ fontFamily: font.display }}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Coverage period bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-[10px] font-black text-white/55 uppercase tracking-widest mb-2" style={{ fontFamily: font.label }}>
                    <span>{format(new Date(activePolicy.start_date), 'MMM dd')}</span>
                    <span>Coverage Period</span>
                    <span>{format(new Date(activePolicy.end_date), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div
                      className={clsx('h-1.5 rounded-full transition-all', activePolicy.days_remaining <= 2 ? 'bg-amber-500' : 'bg-[#22C55E]')}
                      style={{ width: `${((7 - activePolicy.days_remaining) / 7) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Covered disruptions */}
                <div>
                  <p className="text-[10px] font-black text-white/55 uppercase tracking-[0.2em] mb-3" style={{ fontFamily: font.label }}>
                    Covered Disruptions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activePolicy.covered_disruptions.map((d: string) => (
                      <span
                        key={d}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] border border-white/[0.10] rounded-lg text-xs text-white/70"
                        style={{ fontFamily: font.body }}
                      >
                        <CheckCircle className="w-3 h-3 text-[#22C55E]" />
                        {d.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {activePolicy.days_remaining <= 2 && (
                  <div className="mt-6 pt-6 border-t border-white/[0.05]">
                    <button
                      onClick={() => handleRenew(activePolicy.id, activePolicy.plan_type)}
                      disabled={renewingId === activePolicy.id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#F97316] hover:bg-[#EA6C0E] text-white rounded-xl text-sm font-black transition-all disabled:opacity-50"
                      style={{ fontFamily: font.label }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      {renewingId === activePolicy.id ? 'Renewing...' : `Renew for ₹${activePolicy.weekly_premium}`}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="mb-8 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 text-center">
              <Shield className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-sm font-black text-white/30 uppercase tracking-widest mb-4" style={{ fontFamily: font.label }}>
                No active policy
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="px-5 py-2.5 bg-[#F97316] hover:bg-[#EA6C0E] text-white rounded-xl text-sm font-black transition-all"
                style={{ fontFamily: font.label }}
              >
                Get Coverage →
              </button>
            </div>
          )}

          {/* Policy history */}
          {historyPolicies.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-white/55 uppercase tracking-[0.2em] mb-4" style={{ fontFamily: font.label }}>
                Policy History
              </p>
              <div className="space-y-3">
                {historyPolicies.map((policy: any, idx: number) => (
                  <motion.div
                    key={policy.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={policy.plan_type as any} size="sm">{policy.plan_type}</Badge>
                        <span className="text-xs text-white/60" style={{ fontFamily: font.body }}>
                          {format(new Date(policy.start_date), 'MMM dd')} – {format(new Date(policy.end_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <Badge variant={policy.status as any} size="sm">{policy.status}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Premium', value: `₹${policy.weekly_premium}/wk` },
                        { label: 'Coverage', value: `₹${policy.weekly_coverage_limit}/wk` },
                        { label: 'Duration', value: '7 days' },
                      ].map((s) => (
                        <div key={s.label}>
                          <p className="text-[10px] text-white/55 uppercase tracking-widest mb-0.5" style={{ fontFamily: font.label }}>{s.label}</p>
                          <p className="text-sm font-bold text-white/75">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
};
