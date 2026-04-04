import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, History, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getWorkerClaims, getWorker } from '../api/client';
import { Badge } from '../components/ui/Badge';
import { PageShell } from '../components/PageShell';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const font = {
  display: "'Barlow', sans-serif",
  body: "'DM Sans', sans-serif",
  label: "'Space Grotesk', sans-serif",
};

const STATUS_FILTERS = ['all', 'paid', 'approved', 'pending', 'rejected', 'flagged_fraud'] as const;

const statusIcon = (status: string) => {
  if (status === 'paid' || status === 'approved') return <CheckCircle className="w-4 h-4 text-[#22C55E]" />;
  if (status === 'pending') return <Clock className="w-4 h-4 text-amber-400" />;
  if (status === 'flagged_fraud') return <AlertTriangle className="w-4 h-4 text-red-400" />;
  return <XCircle className="w-4 h-4 text-white/30" />;
};

export const ClaimsPage: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: worker } = useQuery({
    queryKey: ['worker', workerId],
    queryFn: () => getWorker(parseInt(workerId!)),
    enabled: !!workerId,
  });

  const { data: claims, isLoading } = useQuery({
    queryKey: ['worker-claims', workerId],
    queryFn: () => getWorkerClaims(parseInt(workerId!)),
    enabled: !!workerId,
  });

  const filteredClaims = statusFilter === 'all'
    ? claims
    : claims?.filter((c: any) => c.status === statusFilter);

  const totalPayout = claims?.reduce((sum: number, c: any) => sum + (c.payout_amount || 0), 0) || 0;
  const approvedCount = claims?.filter((c: any) => c.status === 'paid' || c.status === 'approved').length || 0;

  const navItems = workerId ? [
    { label: 'Dashboard', path: `/dashboard/${workerId}` },
    { label: 'Policy', path: `/policy/${workerId}` },
    { label: 'Profile', path: `/profile/${workerId}` },
  ] : [];

  return (
    <PageShell
      workerId={workerId}
      pageLabel="Claims History"
      overline="Ledger"
      navItems={navItems}
    >
      {/* Page header */}
      <div className="mb-10">
        <p className="text-[10px] font-black text-[#5690FF] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: font.label }}>
          Claims Ledger
        </p>
        <h1 className="text-4xl font-black tracking-tight mb-1" style={{ fontFamily: font.display }}>
          Claims History
        </h1>
        {worker && (
          <p className="text-white/60 text-sm font-medium">{worker.name} · {worker.city}</p>
        )}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Claims', value: claims?.length || 0, color: 'text-white/80' },
          { label: 'Approved', value: approvedCount, color: 'text-[#22C55E]' },
          { label: 'Total Payouts', value: `₹${totalPayout.toFixed(0)}`, color: 'text-[#22C55E]' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2" style={{ fontFamily: font.label }}>
              {stat.label}
            </p>
            <p className={`text-3xl font-black ${stat.color}`} style={{ fontFamily: font.display }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              statusFilter === status
                ? 'bg-[#5690FF]/10 border-[#5690FF]/30 text-[#5690FF]'
                : 'bg-white/[0.03] border-white/[0.07] text-white/30 hover:text-white/60 hover:bg-white/5'
            }`}
            style={{ fontFamily: font.label }}
          >
            {status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Claims list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredClaims && filteredClaims.length > 0 ? (
        <div className="space-y-3">
          {filteredClaims.map((claim: any, idx: number) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              {/* Claim row */}
              <div
                onClick={() => setExpandedClaim(expandedClaim === claim.id ? null : claim.id)}
                className={`bg-white/[0.03] border rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/[0.05] ${
                  claim.status === 'flagged_fraud'
                    ? 'border-red-500/20 bg-red-500/[0.03]'
                    : 'border-white/[0.07]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcon(claim.status)}
                    <div>
                      <p className="text-sm font-black text-white/80 uppercase tracking-wide" style={{ fontFamily: font.display }}>
                        {claim.disruption_type?.replace(/_/g, ' ') || 'Unknown'}
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5" style={{ fontFamily: font.label }}>
                        {format(new Date(claim.claim_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Badge variant={claim.status as any} size="sm">{claim.status}</Badge>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] text-white/20 uppercase tracking-widest" style={{ fontFamily: font.label }}>Payout</p>
                      <p className="text-xl font-black text-[#22C55E]" style={{ fontFamily: font.display }}>
                        ₹{claim.payout_amount?.toFixed(0) || 0}
                      </p>
                    </div>
                    {expandedClaim === claim.id
                      ? <ChevronUp className="w-4 h-4 text-white/30" />
                      : <ChevronDown className="w-4 h-4 text-white/30" />
                    }
                  </div>
                </div>

                {/* Quick stats row */}
                <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.05]">
                  {[
                    { label: 'Exp. Orders', value: claim.expected_orders || 0 },
                    { label: 'Act. Orders', value: claim.actual_orders || 0 },
                    { label: 'Exp. Earnings', value: `₹${claim.expected_earnings?.toFixed(0) || 0}` },
                    { label: 'Act. Earnings', value: `₹${claim.actual_earnings?.toFixed(0) || 0}` },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1" style={{ fontFamily: font.label }}>{s.label}</p>
                      <p className="text-sm font-bold text-white/60">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {expandedClaim === claim.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/[0.02] border border-white/[0.05] border-t-0 rounded-b-2xl p-6 grid md:grid-cols-2 gap-6">
                      {/* Income breakdown */}
                      <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4" style={{ fontFamily: font.label }}>
                          Income Breakdown
                        </p>
                        <div className="space-y-2">
                          {[
                            { label: 'Expected Earnings', value: `₹${claim.expected_earnings?.toFixed(0) || 0}`, color: 'text-white/60' },
                            { label: 'Actual Earnings', value: `₹${claim.actual_earnings?.toFixed(0) || 0}`, color: 'text-white/60' },
                            { label: 'Income Loss', value: `₹${claim.income_loss?.toFixed(0) || 0}`, color: 'text-red-400' },
                            { label: 'Impact Factor', value: `${((claim.disruption_impact_factor || 0) * 100).toFixed(0)}%`, color: 'text-white/60' },
                            { label: 'Payout Amount', value: `₹${claim.payout_amount?.toFixed(0) || 0}`, color: 'text-[#22C55E]' },
                          ].map((row) => (
                            <div key={row.label} className="flex justify-between text-sm py-1.5 border-b border-white/[0.04]">
                              <span className="text-white/30">{row.label}</span>
                              <span className={`font-bold ${row.color}`}>{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fraud analysis */}
                      <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4" style={{ fontFamily: font.label }}>
                          Fraud Analysis
                        </p>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/30">Fraud Score</span>
                            <span className={`font-bold ${
                              claim.fraud_score > 0.75 ? 'text-red-400' :
                              claim.fraud_score > 0.40 ? 'text-amber-400' : 'text-[#22C55E]'
                            }`}>
                              {(claim.fraud_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                claim.fraud_score > 0.75 ? 'bg-red-500' :
                                claim.fraud_score > 0.40 ? 'bg-amber-500' : 'bg-[#22C55E]'
                              }`}
                              style={{ width: `${claim.fraud_score * 100}%` }}
                            />
                          </div>
                        </div>

                        {claim.fraud_flags?.length > 0 && (
                          <div className="space-y-1 mb-4">
                            {claim.fraud_flags.map((flag: string, i: number) => (
                              <p key={i} className="text-xs text-red-400">⚑ {flag}</p>
                            ))}
                          </div>
                        )}

                        {claim.auto_processed && (
                          <p className="text-xs text-[#5690FF] mb-2">✓ Auto-processed by AI</p>
                        )}

                        {claim.payment_reference && (
                          <div className="mt-2">
                            <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1" style={{ fontFamily: font.label }}>Payment Ref</p>
                            <p className="text-xs text-white/50 font-mono">{claim.payment_reference}</p>
                          </div>
                        )}

                        {claim.upi_transaction_id && (
                          <div className="mt-2">
                            <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1" style={{ fontFamily: font.label }}>UPI Transaction</p>
                            <p className="text-xs text-white/50 font-mono">{claim.upi_transaction_id}</p>
                          </div>
                        )}

                        {claim.rejection_reason && (
                          <div className="mt-3 pt-3 border-t border-white/[0.05]">
                            <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1" style={{ fontFamily: font.label }}>Rejection Reason</p>
                            <p className="text-xs text-red-400">{claim.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <History className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-sm font-black text-white/20 uppercase tracking-widest" style={{ fontFamily: font.label }}>
            No claims found
          </p>
        </div>
      )}
    </PageShell>
  );
};
