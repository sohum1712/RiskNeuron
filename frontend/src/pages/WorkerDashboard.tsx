import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, 
  ShieldOff, 
  LayoutDashboard, 
  FileText, 
  History, 
  Settings, 
  Bell, 
  User as UserIcon,
  CreditCard,
  Target,
  Zap,
  MapPin,
  Clock,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboard } from '../api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EarningsChart } from '../components/charts/EarningsChart';
import { DisruptionAlert } from '../components/DisruptionAlert';
import { WeeklyPremiumCard } from '../components/WeeklyPremiumCard';
import { AppBackground } from '../components/AppBackground';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

/* ─── Design tokens ─── */
const font = {
  display: "'Barlow', sans-serif",
  body: "'DM Sans', sans-serif",
  label: "'Space Grotesk', sans-serif",
};

export const WorkerDashboard: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const { clearWorker } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Force fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500&family=Space+Grotesk:wght@300;400;500;600&display=swap';
    document.head.appendChild(link);
    
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard', workerId],
    queryFn: () => getDashboard(parseInt(workerId!)),
    refetchInterval: 30000,
    enabled: !!workerId,
    retry: false // Don't retry for now to catch issues immediately
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C1117] flex items-center justify-center">
         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
            <Zap className="w-12 h-12 text-[#F97316]" />
          </motion.div>
      </div>
    );
  }

  if (error || !dashboard) {
    const errorMsg = (error as any)?.response?.data?.detail || (error as any)?.message || 'Protocol Sync Failed';
    return (
      <div className="min-h-screen bg-[#0C1117] flex items-center justify-center">
        <div className="text-center p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 max-w-md">
          <ShieldOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Sync Error</h2>
          <p className="text-white/60 mb-6">{errorMsg}</p>
          <div className="flex gap-4 justify-center">
            <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
            <Button variant="primary" onClick={() => window.location.reload()}>Retry Sync</Button>
          </div>
        </div>
      </div>
    );
  }

  const { worker, active_policy, active_disruptions, this_week_stats, earnings_chart, recent_claims } = dashboard;
  const isProtected = !!active_policy;

  const handleSignOut = () => {
    clearWorker();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen text-white selection:bg-[#F97316]/30 overflow-x-hidden" style={{ fontFamily: font.body }}>
      
      <AppBackground />

      {/* ─── DYNAMIC TOP NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'py-3 bg-[#0C1117]/80 backdrop-blur-2xl border-b border-white/10 px-6 lg:px-12' : 'py-6 bg-transparent px-8 lg:px-16'
      }`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-tr from-[#F97316] to-[#FB923C] rounded-xl flex items-center justify-center shadow-lg shadow-[#F97316]/30 group transition-all hover:scale-110">
                <Shield className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
              </div>
              <span className="font-black text-xl tracking-tighter text-white" style={{ fontFamily: font.display }}>SWIFTCOVER</span>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              {[
                { icon: LayoutDashboard, label: 'Pulse', path: `/dashboard/${workerId}` },
                { icon: FileText, label: 'Policy', path: `/policy/${workerId}` },
                { icon: History, label: 'Claims', path: `/claims/${workerId}` },
                { icon: UserIcon, label: 'Profile', path: `/profile/${workerId}` },
              ].map((item) => {
                const isActive = window.location.pathname === item.path;
                return (
                  <button 
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 group transition-all ${isActive ? 'text-[#F97316]' : 'text-white/65 hover:text-white'}`}
                  >
                    <item.icon className={`w-4 h-4 transition-transform group-hover:-translate-y-0.5 ${isActive ? 'text-[#F97316]' : 'text-white/40 group-hover:text-white/80'}`} />
                    <span className="text-xs font-black uppercase tracking-widest" style={{ fontFamily: font.label }}>{item.label}</span>
                    {isActive && <div className="w-1 h-1 rounded-full bg-[#F97316] ml-1 shadow-[0_0_8px_#F97316]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Tools & Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 mr-4">
               <button className="p-2.5 hover:bg-white/5 rounded-xl transition-all relative border border-white/5 group">
                <Bell className="w-5 h-5 text-white/30 group-hover:text-white/80" />
                {active_disruptions?.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-[#F97316] rounded-full border-2 border-[#0C1117] animate-pulse" />}
              </button>
              <button onClick={() => navigate(`/profile/${workerId}`)} className="p-2.5 hover:bg-white/5 rounded-xl transition-all border border-white/5 group">
                <Settings className="w-5 h-5 text-white/30 group-hover:text-white/80" />
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center font-black text-xs shadow-lg shadow-[#F97316]/20">
                  {(worker?.name || 'W').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white/90 leading-none mb-1">{worker?.name || 'Worker Node'}</p>
                  <p className="text-[9px] text-[#F97316] font-black uppercase tracking-tighter">{(worker?.platform || 'platform').replace(/_/g, ' ')}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/20 group-hover:text-white/50 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-56 bg-[#161C27]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-[110]"
                  >
                    <button onClick={() => navigate(`/profile/${workerId}`)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-white/60 hover:text-white group">
                      <UserIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-bold">Profile Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-white/60 hover:text-white group">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs font-bold">Billing & Payouts</span>
                    </button>
                    <div className="h-px bg-white/5 my-2 mx-2" />
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-xl transition-all text-red-400 group">
                      <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      <span className="text-xs font-bold">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── MAIN SCROLLABLE CONTENT ─── */}
      <main className="pt-32 pb-20 px-6 lg:px-16 max-w-[1600px] mx-auto">
        
        {/* Welcome Section */}
        <section className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <div className="flex items-center gap-3 mb-4">
               <div className="px-3 py-1 bg-[#F97316]/10 border border-[#F97316]/30 rounded-full flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
                 <span className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.2em]" style={{ fontFamily: font.label }}>
                   {isProtected ? 'Active Coverage' : 'No Coverage'}
                 </span>
               </div>
               <span className="text-white/50 text-xs font-medium tracking-widest uppercase">ID #{worker?.id || '0000'}</span>
             </div>
             <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-4" style={{ fontFamily: font.display }}>
                Hello, <span className="text-[#F97316]">{(worker?.name || 'Worker').split(' ')[0]}</span>
             </h1>
             <div className="flex items-center gap-4 text-white/60">
               <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/50" />
                  <span className="text-sm font-semibold">{worker?.city || '—'} · {worker?.zone_name || '—'}</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-white/30" />
               <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/50" />
                  <span className="text-sm font-semibold uppercase">{worker?.shift_type || 'flexible'} SHIFT</span>
               </div>
             </div>
           </motion.div>

           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-4">
             <div className={`p-1 rounded-[24px] ${isProtected ? 'bg-gradient-to-br from-[#22C55E]/40 to-transparent' : 'bg-red-500/30'}`}>
                <div className="bg-[#161C27]/80 backdrop-blur-3xl border border-white/10 rounded-[22px] px-8 py-5 flex items-center gap-5 min-w-[240px]">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isProtected ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-red-500/10 text-red-400'}`}>
                      {isProtected ? <Shield className="w-8 h-8" /> : <ShieldOff className="w-8 h-8" />}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-white/55 uppercase tracking-[0.2em] mb-1" style={{ fontFamily: font.label }}>Coverage Status</p>
                      <p className={`text-xl font-black ${isProtected ? 'text-[#22C55E]' : 'text-red-400'}`}>{isProtected ? 'PROTECTED' : 'UNPROTECTED'}</p>
                      {!isProtected && <button onClick={() => navigate('/onboarding')} className="text-[10px] font-black text-[#F97316] mt-1 hover:underline">ACTIVATE NOW →</button>}
                   </div>
                </div>
             </div>
           </motion.div>
        </section>

        {/* Alerts Area */}
        {active_disruptions?.length > 0 && (
          <div className="mb-12">
            <DisruptionAlert disruptions={active_disruptions} />
          </div>
        )}

        {/* Global Grid System */}
        <section className="grid lg:grid-cols-4 gap-8">
          
          {/* Main Content (Left 3 columns) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* KPI Row */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: 'Weekly Revenue', value: `₹${Math.floor(this_week_stats?.earnings || 0)}`, icon: CreditCard, color: '#F97316', desc: 'This week earnings' },
                { label: 'Loss Recovery', value: `₹${Math.floor(this_week_stats?.coverage_used || 0)}`, icon: History, color: '#22C55E', desc: 'Paid out this week' },
                { label: 'Risk Score', value: `${Math.round((worker?.risk_score || 0) * 100)}%`, icon: Target, color: '#3B82F6', desc: `Tier: ${worker?.risk_tier || 'medium'}` },
              ].map((kpi, idx) => (
                <motion.div 
                  key={kpi.label} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-[#161C27]/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 hover:bg-[#161C27]/60 transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <kpi.icon className="w-20 h-20" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 rounded-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: `${kpi.color}25` }}>
                        <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                     </div>
                     <span className="text-xs font-black text-white/60 uppercase tracking-[0.15em]" style={{ fontFamily: font.label }}>{kpi.label}</span>
                  </div>
                  <div className="text-4xl font-black tracking-tight mb-2 text-white" style={{ fontFamily: font.display }}>{kpi.value}</div>
                  <p className="text-xs text-white/50 font-semibold uppercase tracking-widest">{kpi.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Performance Analytics */}
            <div className="bg-[#161C27]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F97316]/20 to-transparent" />
               <div className="flex items-center justify-between mb-10">
                 <div>
                    <h2 className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: font.display }}>Earnings Integrity</h2>
                    <p className="text-sm text-white/55 mt-1">Expected vs actual earnings over the last 14 days</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                       <span className="text-[10px] font-black text-white/55 uppercase tracking-widest">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full border border-[#F97316] bg-transparent" />
                       <span className="text-[10px] font-black text-white/55 uppercase tracking-widest">Expected</span>
                    </div>
                 </div>
               </div>
               <div className="w-full">
                  <EarningsChart data={earnings_chart} />
               </div>
            </div>

            {/* Regional Intelligence */}
            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-white" style={{ fontFamily: font.display }}>
                    <MapPin className="w-5 h-5 text-[#F97316]" /> Zone Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white/[0.06] rounded-2xl border border-white/[0.08]">
                       <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Main Hub</span>
                       <span className="text-sm font-black text-white">{worker?.dark_store_name || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/[0.06] rounded-2xl border border-white/[0.08]">
                       <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Zone Status</span>
                       <Badge variant="low" size="sm">NOMINAL</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/[0.06] rounded-2xl border border-white/[0.08]">
                       <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Risk Score</span>
                       <span className="text-sm font-black text-[#22C55E]">{Math.round((worker?.risk_score || 0) * 100)}%</span>
                    </div>
                  </div>
               </div>

               <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4">
                    <Clock className="w-12 h-12 text-white/5" />
                  </div>
                  <div className="relative w-40 h-40 mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                      <circle cx="80" cy="80" r="70" stroke="#F97316" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="110" style={{ strokeLinecap: 'round', filter: 'drop-shadow(0 0 8px #F97316)' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black" style={{ fontFamily: font.display }}>{(worker.shift_type || 'Flexible').charAt(0).toUpperCase() + (worker.shift_type || 'flexible').slice(1)}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-white/55 uppercase tracking-[0.2em]" style={{ fontFamily: font.label }}>Current Shift</p>
                    <p className="text-sm font-bold text-white/70 mt-1">{(worker?.platform || 'platform').replace(/_/g, ' ')}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Sidebar Area (1 column span) */}
          <div className="space-y-8">
            
            {/* Active Policy Quick Look */}
            {isProtected && (
               <WeeklyPremiumCard
                  weeklyPremium={active_policy.weekly_premium}
                  coverageUsed={this_week_stats.coverage_used}
                  weeklyLimit={active_policy.weekly_coverage_limit}
                  daysRemaining={active_policy.days_remaining}
                  startDate={active_policy.start_date}
                />
            )}

            {/* Event Log */}
            <div className="bg-[#161C27]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#F97316]/5 blur-3xl rounded-full" />
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-white/80 uppercase tracking-widest" style={{ fontFamily: font.label }}>Recent Claims</h3>
                  <span className="p-1 px-2 bg-[#F97316]/10 border border-[#F97316]/20 rounded-lg text-[9px] font-black text-[#F97316]">LIVE</span>
               </div>
               
               {recent_claims?.length > 0 ? (
                 <div className="space-y-6">
                   {recent_claims.map((claim: any) => (
                      <div key={claim.id} className="relative pl-6 pb-6 border-l border-white/10 last:pb-0">
                         <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-[#F97316] shadow-[0_0_8px_#F97316]" />
                         <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-white/85 uppercase tracking-tight">{claim.disruption_type.replace(/_/g, ' ')}</span>
                            <Badge variant={claim.status} size="sm" className="scale-75 origin-right">{claim.status}</Badge>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50 font-medium">{format(new Date(claim.claim_date), 'MMM dd, HH:mm')}</span>
                            <span className="text-xs font-black text-[#22C55E]">+₹{Math.floor(claim.payout_amount)}</span>
                         </div>
                      </div>
                   ))}
                 </div>
               ) : (
                 <div className="py-16 text-center">
                    <History className="w-10 h-10 mx-auto mb-3 text-white/20" />
                    <p className="text-sm font-bold uppercase tracking-widest text-white/40">No claims yet</p>
                 </div>
               )}

               <button 
                onClick={() => navigate(`/claims/${workerId}`)}
                className="w-full mt-6 py-3 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.12] rounded-2xl text-xs font-black tracking-[0.15em] uppercase text-white/65 hover:text-white transition-all"
               >
                 View All Claims →
               </button>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#F97316] rounded-[32px] p-8 text-[#0C1117] shadow-2xl relative overflow-hidden group">
               <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform">
                  <Shield className="w-40 h-40" />
               </div>
               <h3 className="text-xl font-black leading-tight mb-4" style={{ fontFamily: font.display }}>Ready to secure<br/>your next shift?</h3>
               <p className="text-xs font-bold opacity-70 mb-6">Our backup nodes are monitoring 14 different disruption types in your sector.</p>
               <button className="bg-[#0C1117] text-white px-6 py-3 rounded-2xl text-xs font-black tracking-widest uppercase hover:scale-105 transition-all">
                  Get Support
               </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#F97316]/10 flex items-center justify-center">
                 <Shield className="w-3.5 h-3.5 text-[#F97316]" />
              </div>
              <p className="text-xs font-black tracking-widest uppercase text-white/40" style={{ fontFamily: font.label }}>SwiftCover · AI-Powered Parametric Insurance</p>
           </div>
           <div className="flex gap-6 text-xs font-semibold text-white/30">
              <button onClick={() => navigate(`/policy/${workerId}`)} className="hover:text-white transition-colors">Policy</button>
              <button onClick={() => navigate(`/claims/${workerId}`)} className="hover:text-white transition-colors">Claims</button>
              <button onClick={() => navigate(`/profile/${workerId}`)} className="hover:text-white transition-colors">Profile</button>
           </div>
        </footer>
      </main>
    </div>
  );
};
