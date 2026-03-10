import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Shield, AlertTriangle, DollarSign, TrendingUp, 
  Clock, Zap, Filter, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { getAnalytics, getAllClaims, simulateDisruption, getAllWorkers } from '../api/client';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { showPayoutNotification } from '../components/PayoutNotification';

const cities = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune'];
const disruptionTypes = [
  { value: 'heavy_rain', label: 'Heavy Rain', icon: '🌧️' },
  { value: 'flood', label: 'Flood', icon: '🌊' },
  { value: 'extreme_heat', label: 'Extreme Heat', icon: '🌡️' },
  { value: 'severe_pollution', label: 'Pollution', icon: '🏭' },
  { value: 'traffic_shutdown', label: 'Traffic', icon: '🚦' },
  { value: 'dark_store_closure', label: 'Dark Store Closure', icon: '🏪' },
  { value: 'curfew', label: 'Curfew', icon: '🚫' },
  { value: 'app_outage', label: 'App Outage', icon: '📱' }
];
const severities = ['mild', 'moderate', 'severe', 'extreme'];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'simulator' | 'analytics'>('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [claimFilter, setClaimFilter] = useState<string>('all');
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);

  // Simulator state
  const [simCity, setSimCity] = useState('Hyderabad');
  const [simDisruption, setSimDisruption] = useState('heavy_rain');
  const [simSeverity, setSimSeverity] = useState('severe');
  const [simDuration, setSimDuration] = useState(4);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalytics,
    refetchInterval: 30000
  });

  const { data: claims, isLoading: claimsLoading, refetch: refetchClaims } = useQuery({
    queryKey: ['claims', claimFilter],
    queryFn: () => getAllClaims(claimFilter === 'all' ? undefined : claimFilter),
    refetchInterval: 30000
  });

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const params: any = {
        city: simCity,
        disruption_type: simDisruption,
        severity: simSeverity,
        duration_hours: simDuration
      };

      // Auto-fill metrics based on disruption type and severity
      if (simDisruption === 'heavy_rain' || simDisruption === 'flood') {
        params.rainfall_mm = simSeverity === 'extreme' ? 120 : simSeverity === 'severe' ? 95 : simSeverity === 'moderate' ? 65 : 45;
      }
      if (simDisruption === 'severe_pollution') {
        params.aqi = simSeverity === 'extreme' ? 350 : simSeverity === 'severe' ? 280 : simSeverity === 'moderate' ? 220 : 180;
      }
      if (simDisruption === 'extreme_heat') {
        params.temperature_celsius = simSeverity === 'extreme' ? 47 : simSeverity === 'severe' ? 44 : 42;
      }
      if (simDisruption === 'traffic_shutdown') {
        params.traffic_index = simSeverity === 'extreme' ? 9.5 : simSeverity === 'severe' ? 8.5 : 7.5;
      }

      const result = await simulateDisruption(params);
      setSimulationResult(result);
      
      // Show payout notifications for approved claims
      result.claim_details.filter((c: any) => c.status === 'paid').forEach((claim: any, idx: number) => {
        setTimeout(() => {
          showPayoutNotification({
            amount: claim.payout,
            workerName: claim.worker_name,
            disruptionType: claim.disruption_type || simDisruption,
            upiReference: claim.upi_transaction_id || 'N/A'
          });
        }, idx * 1000);
      });

      toast.success(`Processed ${result.claims_approved + result.claims_rejected + result.claims_fraud_flagged} claims in ${result.processing_time_seconds.toFixed(2)}s`);
      refetchClaims();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  const lossRatio = analytics ? (analytics.payouts_this_week / Math.max(analytics.premiums_this_week, 1)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-100">SwiftCover — Insurer Console</h1>
            <p className="text-slate-400 mt-1">Real-time claims processing & risk management</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Current Time</div>
            <div className="text-lg font-mono text-slate-100">
              {format(currentTime, 'MMM dd, yyyy HH:mm:ss')}
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="text-sm text-slate-400">Total Workers</div>
                  <div className="text-2xl font-bold text-slate-100">
                    {analytics?.total_workers || 0}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-sm text-slate-400">Active Policies</div>
                  <div className="text-2xl font-bold text-slate-100">
                    {analytics?.active_policies || 0}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
                <div>
                  <div className="text-sm text-slate-400">Claims This Week</div>
                  <div className="text-2xl font-bold text-slate-100">
                    {analytics?.claims_this_week || 0}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-sm text-slate-400">Payouts This Week</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ₹{analytics?.payouts_this_week?.toFixed(0) || 0}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="text-sm text-slate-400">Loss Ratio</div>
                  <div className={`text-2xl font-bold ${
                    lossRatio > 80 ? 'text-red-400' : lossRatio > 60 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {lossRatio.toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          {['overview', 'claims', 'simulator', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab analytics={analytics} />
          )}
          {activeTab === 'claims' && (
            <ClaimsTab 
              claims={claims} 
              loading={claimsLoading}
              filter={claimFilter}
              setFilter={setClaimFilter}
              expandedClaim={expandedClaim}
              setExpandedClaim={setExpandedClaim}
              refetch={refetchClaims}
            />
          )}
          {activeTab === 'simulator' && (
            <SimulatorTab
              city={simCity}
              setCity={setSimCity}
              disruption={simDisruption}
              setDisruption={setSimDisruption}
              severity={simSeverity}
              setSeverity={setSimSeverity}
              duration={simDuration}
              setDuration={setSimDuration}
              isSimulating={isSimulating}
              result={simulationResult}
              onSimulate={handleSimulate}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab analytics={analytics} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


// Overview Tab Component
const OverviewTab: React.FC<{ analytics: any }> = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Premiums vs Payouts Chart */}
        <Card title="8-Week Trend" subtitle="Premiums vs Payouts">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.weekly_trend}>
              <defs>
                <linearGradient id="colorPremiums" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#F8FAFC' }}
              />
              <Legend />
              <Area type="monotone" dataKey="premiums" stroke="#06B6D4" fill="url(#colorPremiums)" name="Premiums" />
              <Area type="monotone" dataKey="payouts" stroke="#EF4444" fill="url(#colorPayouts)" name="Payouts" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* City Stats */}
        <Card title="City Breakdown" subtitle="Workers & Risk">
          <div className="grid grid-cols-2 gap-3">
            {analytics.city_stats.map((city: any) => (
              <div key={city.city} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-slate-100">{city.city}</div>
                  <Badge variant={city.avg_risk_tier as any} size="sm">
                    {city.avg_risk_tier}
                  </Badge>
                </div>
                <div className="text-sm text-slate-400">
                  {city.worker_count} workers • {city.claims_this_week} claims
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};


// Claims Tab Component
const ClaimsTab: React.FC<{
  claims: any[];
  loading: boolean;
  filter: string;
  setFilter: (f: string) => void;
  expandedClaim: number | null;
  setExpandedClaim: (id: number | null) => void;
  refetch: () => void;
}> = ({ claims, loading, filter, setFilter, expandedClaim, setExpandedClaim, refetch }) => {
  const filters = ['all', 'pending', 'approved', 'paid', 'flagged_fraud'];

  if (loading) return <Skeleton variant="card" />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'flagged_fraud' && '🚨 '}
            {f.replace(/_/g, ' ').toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Claims Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Worker</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Zone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Disruption</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-400">Loss</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-400">Payout</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-400">Fraud</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-400">Status</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-400"></th>
              </tr>
            </thead>
            <tbody>
              {claims && claims.length > 0 ? (
                claims.map((claim: any) => (
                  <React.Fragment key={claim.id}>
                    <tr 
                      className={`border-b border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        claim.status === 'flagged_fraud' ? 'bg-red-500/5' : ''
                      }`}
                      onClick={() => setExpandedClaim(expandedClaim === claim.id ? null : claim.id)}
                    >
                      <td className="py-3 px-4 text-sm text-slate-300">#{claim.id}</td>
                      <td className="py-3 px-4 text-sm text-slate-100">{claim.worker_name || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">{claim.zone || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">
                        {format(new Date(claim.claim_date), 'MMM dd')}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {claim.disruption_type?.replace(/_/g, ' ') || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-red-400">
                        ₹{claim.income_loss?.toFixed(0) || 0}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-emerald-400 font-semibold">
                        ₹{claim.payout_amount?.toFixed(0) || 0}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-20 bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                claim.fraud_score > 0.75 ? 'bg-red-500' :
                                claim.fraud_score > 0.40 ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${claim.fraud_score * 100}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs text-slate-400">
                            {Math.round(claim.fraud_score * 100)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={claim.status} size="sm">
                          {claim.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {expandedClaim === claim.id ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </td>
                    </tr>
                    {expandedClaim === claim.id && (
                      <tr>
                        <td colSpan={10} className="bg-slate-900/50 p-4">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-xs text-slate-400 mb-1">Expected Earnings</div>
                              <div className="text-lg font-semibold text-slate-100">
                                ₹{claim.expected_earnings?.toFixed(0) || 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 mb-1">Actual Earnings</div>
                              <div className="text-lg font-semibold text-slate-100">
                                ₹{claim.actual_earnings?.toFixed(0) || 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 mb-1">Income Loss</div>
                              <div className="text-lg font-semibold text-red-400">
                                ₹{claim.income_loss?.toFixed(0) || 0}
                              </div>
                            </div>
                          </div>
                          {claim.fraud_flags && claim.fraud_flags.length > 0 && (
                            <div>
                              <div className="text-xs text-slate-400 mb-2">Fraud Flags:</div>
                              <div className="space-y-1">
                                {claim.fraud_flags.map((flag: string, idx: number) => (
                                  <div key={idx} className="text-sm text-red-400">⚑ {flag}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No claims found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};


// Simulator Tab Component - THE KEY DEMO FEATURE
const SimulatorTab: React.FC<{
  city: string;
  setCity: (c: string) => void;
  disruption: string;
  setDisruption: (d: string) => void;
  severity: string;
  setSeverity: (s: string) => void;
  duration: number;
  setDuration: (d: number) => void;
  isSimulating: boolean;
  result: any;
  onSimulate: () => void;
}> = ({ city, setCity, disruption, setDisruption, severity, setSeverity, duration, setDuration, isSimulating, result, onSimulate }) => {
  
  const getMetricPreview = () => {
    if (disruption === 'heavy_rain' || disruption === 'flood') {
      const rainfall = severity === 'extreme' ? 120 : severity === 'severe' ? 95 : severity === 'moderate' ? 65 : 45;
      return `Rainfall: ${rainfall}mm`;
    }
    if (disruption === 'severe_pollution') {
      const aqi = severity === 'extreme' ? 350 : severity === 'severe' ? 280 : severity === 'moderate' ? 220 : 180;
      return `AQI: ${aqi}`;
    }
    if (disruption === 'extreme_heat') {
      const temp = severity === 'extreme' ? 47 : severity === 'severe' ? 44 : 42;
      return `Temperature: ${temp}°C`;
    }
    if (disruption === 'traffic_shutdown') {
      const traffic = severity === 'extreme' ? 9.5 : severity === 'severe' ? 8.5 : 7.5;
      return `Traffic Index: ${traffic}/10`;
    }
    return 'Metrics auto-filled';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid lg:grid-cols-2 gap-6"
    >
      {/* Left Panel - Configuration */}
      <Card title="Disruption Configuration" subtitle="Configure and trigger a disruption event">
        <div className="space-y-6">
          {/* City */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Disruption Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Disruption Type</label>
            <div className="grid grid-cols-4 gap-2">
              {disruptionTypes.map((dt) => (
                <button
                  key={dt.value}
                  onClick={() => setDisruption(dt.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    disruption === dt.value
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{dt.icon}</div>
                  <div className="text-xs text-slate-300">{dt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Severity</label>
            <div className="flex gap-2">
              {severities.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`flex-1 py-2 rounded-lg border font-medium capitalize transition-all ${
                    severity === s
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-slate-600 bg-slate-900 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Duration: {duration} hours
            </label>
            <input
              type="range"
              min="1"
              max="24"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1h</span>
              <span>24h</span>
            </div>
          </div>

          {/* Metric Preview */}
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Auto-filled Metrics</div>
            <div className="text-lg font-semibold text-cyan-400">{getMetricPreview()}</div>
          </div>

          {/* Trigger Button */}
          <Button
            variant="danger"
            size="lg"
            onClick={onSimulate}
            loading={isSimulating}
            disabled={isSimulating}
            className="w-full"
          >
            <Zap className="w-5 h-5 mr-2" />
            TRIGGER DISRUPTION
          </Button>
          <p className="text-sm text-slate-400 text-center">
            Evaluates all active policies in {city}
          </p>
        </div>
      </Card>

      {/* Right Panel - Live Feed */}
      <Card title="Live Processing Feed" subtitle="Real-time claim evaluation results">
        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm min-h-[600px] max-h-[600px] overflow-y-auto">
          {!result && !isSimulating && (
            <div className="text-slate-500 text-center py-20">
              Configure a disruption and click Trigger
            </div>
          )}

          {isSimulating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-cyan-400 flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Loader2 className="w-4 h-4" />
              </motion.div>
              Processing claims...
            </motion.div>
          )}

          {result && !isSimulating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <div className="text-slate-400">── DISRUPTION TRIGGERED ─────────────────</div>
              <div className="text-slate-100">
                📍 {result.disruption_event.city} — {result.disruption_event.disruption_type.replace(/_/g, ' ')} ({result.disruption_event.severity})
              </div>
              <div className="text-slate-400">
                ⏱️ {format(new Date(result.disruption_event.started_at), 'MMM dd, yyyy HH:mm:ss')}
              </div>
              <div className="text-slate-400">─────────────────────────────────────────</div>
              <div className="text-cyan-400">
                Scanning active policies... {result.policies_evaluated} found
              </div>
              <div className="text-slate-400">─────────────────────────────────────────</div>

              {result.claim_details.map((claim: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="my-3"
                >
                  {claim.status === 'paid' || claim.status === 'approved' ? (
                    <>
                      <div className="text-emerald-400">
                        ✅ {claim.worker_name} ({claim.platform} · {claim.zone})
                      </div>
                      <div className="text-slate-300 ml-4">
                        Expected: ₹{claim.expected_earnings?.toFixed(0)} | Actual: ₹{claim.actual_earnings?.toFixed(0)} | Loss: ₹{(claim.expected_earnings - claim.actual_earnings).toFixed(0)}
                      </div>
                      <div className="text-slate-400 ml-4">
                        Fraud: CLEAR (score: {(claim.fraud_score || 0).toFixed(2)})
                      </div>
                      <div className="text-emerald-400 ml-4">
                        → APPROVED | ₹{claim.payout}
                      </div>
                      {claim.upi_transaction_id && (
                        <div className="text-slate-400 ml-4">
                          → UPI: {claim.upi_transaction_id}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-amber-400">
                        ⚠️ {claim.worker_name} ({claim.platform} · {claim.zone})
                      </div>
                      <div className="text-slate-300 ml-4">
                        Expected: ₹{claim.expected_earnings?.toFixed(0)} | Actual: ₹{claim.actual_earnings?.toFixed(0)} | Loss: ₹{(claim.expected_earnings - claim.actual_earnings).toFixed(0)}
                      </div>
                      <div className="text-red-400 ml-4">
                        Fraud: FLAGS DETECTED
                      </div>
                      {claim.fraud_flags && claim.fraud_flags.map((flag: string, i: number) => (
                        <div key={i} className="text-red-400 ml-4">⚑ {flag}</div>
                      ))}
                      <div className="text-amber-400 ml-4">
                        → FLAGGED FOR REVIEW | Payout: ₹0 (held)
                      </div>
                    </>
                  )}
                </motion.div>
              ))}

              <div className="text-slate-400 mt-4">─────────────────────────────────────────</div>
              <div className="text-cyan-400">
                PROCESSING COMPLETE ({result.processing_time_seconds.toFixed(2)}s)
              </div>
              <div className="text-emerald-400">
                Approved: {result.claims_approved} ✅ | Flagged: {result.claims_fraud_flagged} ⚠️
              </div>
              <div className="text-slate-100">
                Total Payout: ₹{result.total_payout.toFixed(0)}
              </div>
              {result.claims_fraud_flagged > 0 && (
                <div className="text-amber-400">
                  Fraud Saved: ₹{(result.claim_details
                    .filter((c: any) => c.status === 'flagged_fraud')
                    .reduce((sum: number, c: any) => sum + (c.expected_earnings - c.actual_earnings), 0)
                  ).toFixed(0)}
                </div>
              )}
              <div className="text-slate-400">─────────────────────────────────────────</div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};


// Analytics Tab Component
const AnalyticsTab: React.FC<{ analytics: any }> = ({ analytics }) => {
  if (!analytics) return null;

  const claimStatusData = [
    { name: 'Approved', value: analytics.claims_this_week * 0.6, color: '#06B6D4' },
    { name: 'Rejected', value: analytics.claims_this_week * 0.2, color: '#64748B' },
    { name: 'Flagged', value: analytics.claims_this_week * 0.2, color: '#EF4444' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Claims Status Donut */}
        <Card title="Claims Status" subtitle="This week">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={claimStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {claimStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Loss Ratio Trend */}
        <Card title="Loss Ratio Trend" subtitle="8 weeks" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analytics.weekly_trend}>
              <defs>
                <linearGradient id="colorLossRatio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: any) => `${value.toFixed(1)}%`}
              />
              <Area 
                type="monotone" 
                dataKey="loss_ratio" 
                stroke="#F59E0B" 
                fill="url(#colorLossRatio)" 
                name="Loss Ratio"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* City Risk Heatmap */}
      <Card title="City Risk Heatmap" subtitle="Average risk scores by city">
        <div className="space-y-2">
          {analytics.city_stats.map((city: any) => (
            <div key={city.city} className="flex items-center gap-4">
              <div className="w-32 font-semibold text-slate-100">{city.city}</div>
              <div className="flex-1">
                <div className="w-full bg-slate-700 rounded-full h-6 overflow-hidden">
                  <div 
                    className={`h-6 rounded-full flex items-center justify-end px-2 text-xs font-bold text-white ${
                      city.avg_risk_tier === 'high' ? 'bg-red-500' :
                      city.avg_risk_tier === 'medium' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${(city.worker_count / analytics.total_workers) * 100}%` }}
                  >
                    {city.worker_count} workers
                  </div>
                </div>
              </div>
              <Badge variant={city.avg_risk_tier as any} size="sm">
                {city.avg_risk_tier}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
