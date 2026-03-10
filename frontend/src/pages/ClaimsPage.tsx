import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { getWorkerClaims, getWorker } from '../api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { format } from 'date-fns';

export const ClaimsPage: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: worker } = useQuery({
    queryKey: ['worker', workerId],
    queryFn: () => getWorker(parseInt(workerId!)),
    enabled: !!workerId
  });

  const { data: claims, isLoading } = useQuery({
    queryKey: ['worker-claims', workerId],
    queryFn: () => getWorkerClaims(parseInt(workerId!)),
    enabled: !!workerId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  const filteredClaims = statusFilter === 'all' 
    ? claims 
    : claims?.filter((c: any) => c.status === statusFilter);

  const totalPayout = claims?.reduce((sum: number, c: any) => sum + (c.payout_amount || 0), 0) || 0;
  const approvedCount = claims?.filter((c: any) => c.status === 'paid' || c.status === 'approved').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/${workerId}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-100">Claims History</h1>
            {worker && (
              <p className="text-slate-400 mt-1">{worker.name} • {worker.city}</p>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="text-sm text-slate-400 mb-1">Total Claims</div>
            <div className="text-3xl font-bold text-slate-100">{claims?.length || 0}</div>
          </Card>
          <Card>
            <div className="text-sm text-slate-400 mb-1">Approved Claims</div>
            <div className="text-3xl font-bold text-emerald-400">{approvedCount}</div>
          </Card>
          <Card>
            <div className="text-sm text-slate-400 mb-1">Total Payouts</div>
            <div className="text-3xl font-bold text-emerald-400">₹{totalPayout.toFixed(0)}</div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'paid', 'approved', 'pending', 'rejected', 'flagged_fraud'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.replace(/_/g, ' ').toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Claims List */}
        <Card>
          <div className="space-y-3">
            {filteredClaims && filteredClaims.length > 0 ? (
              filteredClaims.map((claim: any) => (
                <div key={claim.id}>
                  <div
                    onClick={() => setExpandedClaim(expandedClaim === claim.id ? null : claim.id)}
                    className={`bg-slate-900/50 rounded-lg p-4 border cursor-pointer transition-all hover:border-slate-600 ${
                      claim.status === 'flagged_fraud' ? 'border-red-500/30 bg-red-500/5' : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-slate-100">
                            {claim.disruption_type?.replace(/_/g, ' ') || 'Unknown Disruption'}
                          </span>
                          <Badge variant={claim.status} size="sm">
                            {claim.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-400">
                          {format(new Date(claim.claim_date), 'MMMM dd, yyyy')}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-slate-400">Payout</div>
                          <div className="text-2xl font-bold text-emerald-400">
                            ₹{claim.payout_amount?.toFixed(0) || 0}
                          </div>
                        </div>
                        {expandedClaim === claim.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400">Expected Orders</div>
                        <div className="text-slate-100 font-semibold">{claim.expected_orders || 0}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Actual Orders</div>
                        <div className="text-slate-100 font-semibold">{claim.actual_orders || 0}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Expected Earnings</div>
                        <div className="text-slate-100 font-semibold">₹{claim.expected_earnings?.toFixed(0) || 0}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Actual Earnings</div>
                        <div className="text-slate-100 font-semibold">₹{claim.actual_earnings?.toFixed(0) || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedClaim === claim.id && (
                    <div className="bg-slate-900 rounded-lg p-4 mt-2 border border-slate-700">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-300 mb-3">Income Loss Breakdown</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Expected Earnings</span>
                              <span className="text-slate-100">₹{claim.expected_earnings?.toFixed(0) || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Actual Earnings</span>
                              <span className="text-slate-100">₹{claim.actual_earnings?.toFixed(0) || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-700">
                              <span className="text-red-400">Income Loss</span>
                              <span className="text-red-400">₹{claim.income_loss?.toFixed(0) || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Impact Factor</span>
                              <span className="text-slate-100">{((claim.disruption_impact_factor || 0) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-700">
                              <span className="text-emerald-400">Payout Amount</span>
                              <span className="text-emerald-400">₹{claim.payout_amount?.toFixed(0) || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-slate-300 mb-3">Fraud Analysis</h4>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Fraud Score</span>
                              <span className={`font-semibold ${
                                claim.fraud_score > 0.75 ? 'text-red-400' :
                                claim.fraud_score > 0.40 ? 'text-amber-400' :
                                'text-emerald-400'
                              }`}>
                                {(claim.fraud_score * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  claim.fraud_score > 0.75 ? 'bg-red-500' :
                                  claim.fraud_score > 0.40 ? 'bg-amber-500' :
                                  'bg-emerald-500'
                                }`}
                                style={{ width: `${claim.fraud_score * 100}%` }}
                              />
                            </div>
                          </div>

                          {claim.fraud_flags && claim.fraud_flags.length > 0 && (
                            <div>
                              <div className="text-xs text-slate-400 mb-2">Fraud Flags:</div>
                              <div className="space-y-1">
                                {claim.fraud_flags.map((flag: string, idx: number) => (
                                  <div key={idx} className="text-sm text-red-400">
                                    ⚑ {flag}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {claim.auto_processed && (
                            <div className="mt-3 text-xs text-cyan-400">
                              ✓ Auto-processed by AI
                            </div>
                          )}

                          {claim.payment_reference && (
                            <div className="mt-3">
                              <div className="text-xs text-slate-400">Payment Reference</div>
                              <div className="text-sm text-slate-100 font-mono">{claim.payment_reference}</div>
                            </div>
                          )}

                          {claim.upi_transaction_id && (
                            <div className="mt-2">
                              <div className="text-xs text-slate-400">UPI Transaction ID</div>
                              <div className="text-sm text-slate-100 font-mono">{claim.upi_transaction_id}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {claim.rejection_reason && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <div className="text-xs text-slate-400 mb-1">Rejection Reason</div>
                          <div className="text-sm text-red-400">{claim.rejection_reason}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                No claims found
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
