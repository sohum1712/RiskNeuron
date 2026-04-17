import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, AlertTriangle, DollarSign, TrendingUp,
  Zap, ChevronDown, ChevronUp, Loader2, ArrowLeft
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Badge } from '../components/ui/Badge';
import { getAnalytics, getAllClaims, simulateDisruption } from '../api/client';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { showPayoutNotification } from '../components/PayoutNotification';
import { AppBackground } from '../components/AppBackground';

const font = {
  display: "'Barlow', sans-serif",
  body: "'DM Sans', sans-serif",
  label: "'Space Grotesk', sans-serif",
};

const cities = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune'];
const disruptionTypes = [
  { value: 'heavy_rain', label: 'Heavy Rain', icon: '🌧️' },
  { value: 'flood', label: 'Flood', icon: '🌊' },
  { value: 'extreme_heat', label: 'Extreme Heat', icon: '🌡️' },
  { value: 'severe_pollution', label: 'Pollution', icon: '🏭' },
  { value: 'traffic_shutdown', label: 'Traffic', icon: '🚦' },
  { value: 'dark_store_closure', label: 'Dark Store', icon: '🏪' },
  { value: 'curfew', label: 'Curfew', icon: '🚫' },
  { value: 'app_outage', label: 'App Outage', icon: '📱' },
];
const severities = ['mild', 'moderate', 'severe', 'extreme'];

const TABS = ['overview', 'claims', 'simulator', 'analytics'] as const;
type Tab = typeof TABS[number];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [claimFilter, setClaimFilter] = useState('all');
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Simulator state
  const [simCity, setSimCity] = useState('Hyderabad');
  const [simDisruption, setSimDisruption] = useState('heavy_rain');
  const [simSeverity, setSimSeverity] = useState('severe');
  const [simDuration, setSimDuration] = useState(4);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => { clearInterval(timer); window.removeEventListener('scroll', fn); };
  }, []);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalytics,
    refetchInterval: 30000,
  });

  const { data: claims, isLoading: claimsLoading, refetch: refetchClaims } = useQuery({
    queryKey: ['claims', claimFilter],
    queryFn: () => getAllClaims(claimFilter === 'all' ? undefined : claimFilter),
    refetchInterval: 30000,
  });

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const params: any = { city: simCity, disruption_type: simDisruption, severity: simSeverity, duration_hours: simDuration };
      if (simDisruption === 'heavy_rain' || simDisruption === 'flood') params.rainfall_mm = simSeverity === 'extreme' ? 120 : simSeverity === 'severe' ? 95 : simSeverity === 'moderate' ? 65 : 45;
      if (simDisruption === 'severe_pollution') params.aqi = simSeverity === 'extreme' ? 350 : simSeverity === 'severe' ? 280 : simSeverity === 'moderate' ? 220 : 180;
      if (simDisruption === 'extreme_heat') params.temperature_celsius = simSeverity === 'extreme' ? 47 : simSeverity === 'severe' ? 44 : 42;
      if (simDisruption === 'traffic_shutdown') params.traffic_index = simSeverity === 'extreme' ? 9.5 : simSeverity === 'severe' ? 8.5 : 7.5;
      const result = await simulateDisruption(params);
      setSimulationResult(result);
      result.claim_details.filter((c: any) => c.status === 'paid').forEach((claim: any, idx: number) => {
        setTimeout(() => showPayoutNotification({ amount: claim.payout, workerName: claim.worker_name, disruptionType: claim.disruption_type || simDisruption, upiReference: claim.upi_transaction_id || 'N/A' }), idx * 1000);
      });
      toast.success(`Processed ${result.claims_approved + result.claims_rejected + result.claims_fraud_flagged} claims in ${result.processing_time_seconds.toFixed(2)}s`);
      refetchClaims();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  const lossRatio = analytics ? (analytics.payouts_this_week / Math.max(analytics.premiums_this_week, 1)) * 100 : 0;

  const kpis = [
    { label: 'Total Workers', value: analytics?.total_workers || 0, icon: Users, color: '#5690FF' },
    { label: 'Active Policies', value: analytics?.active_policies || 0, icon: Shield, color: '#22C55E' },
    { label: 'Claims This Week', value: analytics?.claims_this_week || 0, icon: AlertTriangle, color: '#F59E0B' },
    { label: 'Payouts This Week', value: `₹${analytics?.payouts_this_week?.toFixed(0) || 0}`, icon: DollarSign, color: '#22C55E' },
    { label: 'Loss Ratio', value: `${lossRatio.toFixed(1)}%`, icon: TrendingUp, color: lossRatio > 80 ? '#EF4444' : lossRatio > 60 ? '#F59E0B' : '#22C55E' },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ fontFamily: font.body }}>
      <AppBackground />

      {/* Floating pill nav */}
      <nav style={{
        position: 'fixed', top: 20, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          backdropFilter: scrolled ? 'blur(40px)' : 'none',
          background: scrolled ? 'rgba(12,17,23,0.75)' : 'transparent',
          border: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
          borderRadius: 40, padding: '6px 10px',
          display: 'flex', alignItems: 'center', pointerEvents: 'auto', gap: 12,
          transition: 'all 0.3s ease-in-out',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
        }}>
          {/* Back + Logo */}
          <div className="flex items-center gap-2 px-1">
            <button onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              <ArrowLeft style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.7)' }} />
            </button>
            <div className="flex items-center gap-2">
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #5690FF, #7AABFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(86,144,255,0.35)' }}>
                <Shield style={{ width: 16, height: 16, color: '#fff' }} />
              </div>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontStyle: 'italic', fontSize: 16, color: '#fff', letterSpacing: '-0.01em' }}>Axio</span>
              <span style={{ fontFamily: font.label, fontSize: 9, fontWeight: 900, color: '#5690FF', letterSpacing: '0.18em', textTransform: 'uppercase', background: 'rgba(86,144,255,0.12)', border: '1px solid rgba(86,144,255,0.25)', borderRadius: 6, padding: '2px 8px' }}>
                Insurer Console
              </span>
            </div>
          </div>
          {/* Clock */}
          <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em', paddingRight: 4 }}>
            {format(currentTime, 'MMM dd, yyyy HH:mm:ss')}
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-black text-[#5690FF] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: font.label }}>Admin</p>
          <h1 className="text-4xl font-black tracking-tight" style={{ fontFamily: font.display }}>Insurer Console</h1>
          <p className="text-white/60 text-sm mt-1">Real-time claims processing & risk management</p>
        </div>

        {/* KPI row */}
        {analyticsLoading ? (
          <div className="grid lg:grid-cols-5 gap-4 mb-8">
            {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white/[0.03] rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-4 mb-8">
            {kpis.map((kpi, idx) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${kpi.color}15` }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/55 uppercase tracking-widest" style={{ fontFamily: font.label }}>{kpi.label}</p>
                  <p className="text-xl font-black text-white" style={{ fontFamily: font.display, color: kpi.label === 'Loss Ratio' ? kpi.color : undefined }}>{kpi.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-1 w-fit">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-[#5690FF] text-white shadow-lg shadow-[#5690FF]/20' : 'text-white/30 hover:text-white/60'
              }`}
              style={{ fontFamily: font.label }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewTab key="overview" analytics={analytics} />}
          {activeTab === 'claims' && (
            <ClaimsTab key="claims" claims={claims} loading={claimsLoading} filter={claimFilter}
              setFilter={setClaimFilter} expandedClaim={expandedClaim} setExpandedClaim={setExpandedClaim} refetch={refetchClaims} />
          )}
          {activeTab === 'simulator' && (
            <SimulatorTab key="simulator" city={simCity} setCity={setSimCity} disruption={simDisruption}
              setDisruption={setSimDisruption} severity={simSeverity} setSeverity={setSimSeverity}
              duration={simDuration} setDuration={setSimDuration} isSimulating={isSimulating}
              result={simulationResult} onSimulate={handleSimulate} />
          )}
          {activeTab === 'analytics' && <AnalyticsTab key="analytics" analytics={analytics} />}
        </AnimatePresence>
      </main>
    </div>
  );
};

// ─── Overview Tab ───────────────────────────────────────────────────────────
const OverviewTab: React.FC<{ analytics: any }> = ({ analytics }) => {
  if (!analytics) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <p className="text-[10px] font-black text-white/55 uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>8-Week Trend</p>
        <p className="text-xs text-white/55 mb-5">Premiums vs Payouts</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={analytics.weekly_trend}>
            <defs>
              <linearGradient id="gPremiums" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5690FF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#5690FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gPayouts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
            <Tooltip contentStyle={{ backgroundColor: '#161C27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
            <Area type="monotone" dataKey="premiums" stroke="#5690FF" fill="url(#gPremiums)" name="Premiums" strokeWidth={2} />
            <Area type="monotone" dataKey="payouts" stroke="#EF4444" fill="url(#gPayouts)" name="Payouts" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <p className="text-[10px] font-black text-white/55 uppercase tracking-[0.2em] mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>City Breakdown</p>
        <div className="grid grid-cols-2 gap-3">
          {analytics.city_stats.map((city: any) => (
            <div key={city.city} className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black text-white/80" style={{ fontFamily: "'Barlow', sans-serif" }}>{city.city}</span>
                <Badge variant={city.avg_risk_tier as any} size="sm">{city.avg_risk_tier}</Badge>
              </div>
              <p className="text-xs text-white/55">{city.worker_count} workers · {city.claims_this_week} claims</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Claims Tab ──────────────────────────────────────────────────────────────
const ClaimsTab: React.FC<{
  claims: any[] | undefined; loading: boolean; filter: string; setFilter: (f: string) => void;
  expandedClaim: number | null; setExpandedClaim: (id: number | null) => void; refetch: () => void;
}> = ({ claims, loading, filter, setFilter, expandedClaim, setExpandedClaim }) => {
  const filters = ['all', 'pending', 'approved', 'paid', 'flagged_fraud'];
  if (loading) return <div className="h-40 bg-white/[0.03] rounded-2xl animate-pulse" />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              filter === f ? 'bg-[#5690FF]/10 border-[#5690FF]/30 text-[#5690FF]' : 'bg-white/[0.03] border-white/[0.07] text-white/30 hover:text-white/60'
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {f === 'flagged_fraud' && '🚨 '}{f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {['ID', 'Worker', 'Zone', 'Date', 'Disruption', 'Loss', 'Payout', 'Fraud', 'Status', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-white/55 uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claims && claims.length > 0 ? claims.map((claim: any) => (
                <React.Fragment key={claim.id}>
                  <tr
                    className={`border-b border-white/[0.05] hover:bg-white/[0.03] cursor-pointer transition-colors ${claim.status === 'flagged_fraud' ? 'bg-red-500/[0.03]' : ''}`}
                    onClick={() => setExpandedClaim(expandedClaim === claim.id ? null : claim.id)}
                  >
                    <td className="py-3 px-4 text-xs text-white/55">#{claim.id}</td>
                    <td className="py-3 px-4 text-sm font-bold text-white/85">{claim.worker_name || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs text-white/55">{claim.zone || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs text-white/55">{format(new Date(claim.claim_date), 'MMM dd')}</td>
                    <td className="py-3 px-4 text-xs text-white/70">{claim.disruption_type?.replace(/_/g, ' ') || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs text-right text-red-400">₹{claim.income_loss?.toFixed(0) || 0}</td>
                    <td className="py-3 px-4 text-sm text-right font-black text-[#22C55E]">₹{claim.payout_amount?.toFixed(0) || 0}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/5 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${claim.fraud_score > 0.75 ? 'bg-red-500' : claim.fraud_score > 0.40 ? 'bg-amber-500' : 'bg-[#22C55E]'}`}
                            style={{ width: `${claim.fraud_score * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-white/55">{Math.round(claim.fraud_score * 100)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4"><Badge variant={claim.status as any} size="sm">{claim.status}</Badge></td>
                    <td className="py-3 px-4 text-center">
                      {expandedClaim === claim.id ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                    </td>
                  </tr>
                  {expandedClaim === claim.id && (
                    <tr>
                      <td colSpan={10} className="bg-white/[0.02] px-6 py-4">
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          {[
                            { label: 'Expected', value: `₹${claim.expected_earnings?.toFixed(0) || 0}` },
                            { label: 'Actual', value: `₹${claim.actual_earnings?.toFixed(0) || 0}` },
                            { label: 'Income Loss', value: `₹${claim.income_loss?.toFixed(0) || 0}`, red: true },
                          ].map((s) => (
                            <div key={s.label}>
                              <p className="text-[10px] text-white/55 uppercase tracking-widest mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.label}</p>
                              <p className={`text-lg font-black ${s.red ? 'text-red-400' : 'text-white/70'}`} style={{ fontFamily: "'Barlow', sans-serif" }}>{s.value}</p>
                            </div>
                          ))}
                        </div>
                        {claim.fraud_flags?.length > 0 && (
                          <div className="space-y-1">
                            {claim.fraud_flags.map((flag: string, i: number) => (
                              <p key={i} className="text-xs text-red-400">⚑ {flag}</p>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr><td colSpan={10} className="py-12 text-center text-white/55 text-sm">No claims found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Simulator Tab ───────────────────────────────────────────────────────────
const SimulatorTab: React.FC<{
  city: string; setCity: (c: string) => void;
  disruption: string; setDisruption: (d: string) => void;
  severity: string; setSeverity: (s: string) => void;
  duration: number; setDuration: (d: number) => void;
  isSimulating: boolean; result: any; onSimulate: () => void;
}> = ({ city, setCity, disruption, setDisruption, severity, setSeverity, duration, setDuration, isSimulating, result, onSimulate }) => {
  const getMetricPreview = () => {
    if (disruption === 'heavy_rain' || disruption === 'flood') return `Rainfall: ${severity === 'extreme' ? 120 : severity === 'severe' ? 95 : severity === 'moderate' ? 65 : 45}mm`;
    if (disruption === 'severe_pollution') return `AQI: ${severity === 'extreme' ? 350 : severity === 'severe' ? 280 : severity === 'moderate' ? 220 : 180}`;
    if (disruption === 'extreme_heat') return `Temperature: ${severity === 'extreme' ? 47 : severity === 'severe' ? 44 : 42}°C`;
    if (disruption === 'traffic_shutdown') return `Traffic Index: ${severity === 'extreme' ? 9.5 : severity === 'severe' ? 8.5 : 7.5}/10`;
    return 'Metrics auto-filled';
  };

  const selectClass = "w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-[#5690FF]/50 transition-all";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-2 gap-6">
      {/* Config panel */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 space-y-6">
        <div>
          <p className="text-[10px] font-black text-white/55 uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Disruption Simulator</p>
          <p className="text-xs text-white/55">Configure and trigger a disruption event</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-white/65 mb-2">City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
            {cities.map(c => <option key={c} value={c} className="bg-[#161C27]">{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-white/65 mb-3">Disruption Type</label>
          <div className="grid grid-cols-4 gap-2">
            {disruptionTypes.map((dt) => (
              <button key={dt.value} onClick={() => setDisruption(dt.value)}
                className={`p-3 rounded-xl border transition-all text-center ${disruption === dt.value ? 'border-[#5690FF]/40 bg-[#5690FF]/10' : 'border-white/[0.07] bg-white/[0.02] hover:border-white/20'}`}>
                <div className="text-xl mb-1">{dt.icon}</div>
                <div className="text-[9px] text-white/40 font-bold">{dt.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-white/65 mb-3">Severity</label>
          <div className="flex gap-2">
            {severities.map((s) => (
              <button key={s} onClick={() => setSeverity(s)}
                className={`flex-1 py-2 rounded-xl border text-xs font-black capitalize transition-all ${severity === s ? 'border-[#5690FF]/40 bg-[#5690FF]/10 text-[#5690FF]' : 'border-white/[0.07] text-white/30 hover:border-white/20'}`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-white/65 mb-2">Duration: {duration}h</label>
          <input type="range" min="1" max="24" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#5690FF]" />
          <div className="flex justify-between text-[10px] text-white/45 mt-1">
            <span>1h</span><span>24h</span>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
          <p className="text-[10px] text-white/55 uppercase tracking-widest mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Auto-filled Metrics</p>
          <p className="text-base font-black text-[#5690FF]" style={{ fontFamily: "'Barlow', sans-serif" }}>{getMetricPreview()}</p>
        </div>

        <button onClick={onSimulate} disabled={isSimulating}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-red-500/20"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {isSimulating ? 'Processing...' : 'TRIGGER DISRUPTION'}
        </button>
        <p className="text-[10px] text-white/45 text-center">Evaluates all active policies in {city}</p>
      </div>

      {/* Live feed */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <p className="text-[10px] font-black text-white/55 uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Live Processing Feed</p>
        <p className="text-xs text-white/55 mb-5">Real-time claim evaluation results</p>
        <div className="bg-[#0C1117]/60 rounded-xl p-4 font-mono text-sm min-h-[500px] max-h-[500px] overflow-y-auto border border-white/[0.05]">
          {!result && !isSimulating && (
            <p className="text-white/45 text-center py-20 text-xs">Configure a disruption and click Trigger</p>
          )}
          {isSimulating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[#5690FF]">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing claims...
            </motion.div>
          )}
          {result && !isSimulating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-xs">
              <p className="text-white/30">── DISRUPTION TRIGGERED ──────────────</p>
              <p className="text-white/70">📍 {result.disruption_event.city} — {result.disruption_event.disruption_type.replace(/_/g, ' ')} ({result.disruption_event.severity})</p>
              <p className="text-white/30">⏱️ {format(new Date(result.disruption_event.started_at), 'MMM dd, yyyy HH:mm:ss')}</p>
              <p className="text-white/30">─────────────────────────────────────</p>
              <p className="text-[#5690FF]">Scanning active policies... {result.policies_evaluated} found</p>
              <p className="text-white/30">─────────────────────────────────────</p>
              {result.claim_details.map((claim: any, idx: number) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.15 }} className="my-2">
                  {claim.status === 'paid' || claim.status === 'approved' ? (
                    <>
                      <p className="text-[#22C55E]">✅ {claim.worker_name} ({claim.platform} · {claim.zone})</p>
                      <p className="text-white/40 ml-4">Expected: ₹{claim.expected_earnings?.toFixed(0)} | Actual: ₹{claim.actual_earnings?.toFixed(0)}</p>
                      <p className="text-[#22C55E] ml-4">→ APPROVED | ₹{claim.payout}</p>
                      {claim.upi_transaction_id && <p className="text-white/30 ml-4">→ UPI: {claim.upi_transaction_id}</p>}
                    </>
                  ) : (
                    <>
                      <p className="text-amber-400">⚠️ {claim.worker_name} ({claim.platform} · {claim.zone})</p>
                      <p className="text-red-400 ml-4">Fraud: FLAGS DETECTED</p>
                      {claim.fraud_flags?.map((flag: string, i: number) => <p key={i} className="text-red-400 ml-4">⚑ {flag}</p>)}
                      <p className="text-amber-400 ml-4">→ FLAGGED FOR REVIEW | Payout: ₹0 (held)</p>
                    </>
                  )}
                </motion.div>
              ))}
              <p className="text-white/30">─────────────────────────────────────</p>
              <p className="text-[#5690FF]">COMPLETE ({result.processing_time_seconds.toFixed(2)}s)</p>
              <p className="text-[#22C55E]">Approved: {result.claims_approved} ✅ | Flagged: {result.claims_fraud_flagged} ⚠️</p>
              <p className="text-white/70">Total Payout: ₹{result.total_payout.toFixed(0)}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Analytics Tab ───────────────────────────────────────────────────────────
const AnalyticsTab: React.FC<{ analytics: any }> = ({ analytics }) => {
  if (!analytics) return null;
  const claimStatusData = [
    { name: 'Approved', value: Math.round(analytics.claims_this_week * 0.6), color: '#5690FF' },
    { name: 'Rejected', value: Math.round(analytics.claims_this_week * 0.2), color: '#475569' },
    { name: 'Flagged', value: Math.round(analytics.claims_this_week * 0.2), color: '#EF4444' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <p className="text-[10px] font-black text-white/55 uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Claims Status</p>
          <p className="text-xs text-white/55 mb-4">This week</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={claimStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {claimStatusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#161C27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 lg:col-span-2">
          <p className="text-[10px] font-black text-white/55 uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Loss Ratio Trend</p>
          <p className="text-xs text-white/55 mb-4">8 weeks</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.weekly_trend}>
              <defs>
                <linearGradient id="gLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: '#161C27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={(v: any) => `${v.toFixed(1)}%`} />
              <Area type="monotone" dataKey="loss_ratio" stroke="#F59E0B" fill="url(#gLoss)" name="Loss Ratio" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <p className="text-[10px] font-black text-white/55 uppercase tracking-[0.2em] mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>City Risk Heatmap</p>
        <div className="space-y-3">
          {analytics.city_stats.map((city: any) => (
            <div key={city.city} className="flex items-center gap-4">
              <div className="w-28 text-sm font-black text-white/60" style={{ fontFamily: "'Barlow', sans-serif" }}>{city.city}</div>
              <div className="flex-1">
                <div className="w-full bg-white/5 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-5 rounded-full flex items-center justify-end px-2 text-[9px] font-black text-white ${city.avg_risk_tier === 'high' ? 'bg-red-500' : city.avg_risk_tier === 'medium' ? 'bg-amber-500' : 'bg-[#22C55E]'}`}
                    style={{ width: `${(city.worker_count / analytics.total_workers) * 100}%` }}
                  >
                    {city.worker_count}
                  </div>
                </div>
              </div>
              <Badge variant={city.avg_risk_tier as any} size="sm">{city.avg_risk_tier}</Badge>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
