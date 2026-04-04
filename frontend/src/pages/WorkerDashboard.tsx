import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Shield, ShieldOff, LayoutDashboard, FileText, History,
  Bell, User as UserIcon, CreditCard, Target, Zap,
  MapPin, Clock, LogOut, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboard } from '../api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EarningsChart } from '../components/charts/EarningsChart';
import { DisruptionAlert } from '../components/DisruptionAlert';
import { WeeklyPremiumCard } from '../components/WeeklyPremiumCard';
import { AppBackground } from '../components/AppBackground';
import { BrandLogo } from '../components/BrandLogo';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

const font = {
  display: "'Barlow', sans-serif",
  body: "'DM Sans', sans-serif",
  label: "'Space Grotesk', sans-serif",
};

const BLUE = '#5690FF';
const BLUE_HOVER = '#4070E0';
const GREEN = '#22C55E';

export const WorkerDashboard: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const { clearWorker } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500&family=Space+Grotesk:wght@300;400;500;600&family=Poppins:ital,wght@1,600&display=swap';
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
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AppBackground />
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="relative z-10">
          <Zap className="w-12 h-12" style={{ color: BLUE }} />
        </motion.div>
      </div>
    );
  }

  if (error || !dashboard) {
    const errorMsg = (error as any)?.response?.data?.detail || (error as any)?.message || 'Failed to load dashboard';
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AppBackground />
        <div className="relative z-10 text-center p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 max-w-md text-white">
          <ShieldOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Load Error</h2>
          <p className="text-white/60 mb-6">{errorMsg}</p>
          <div className="flex gap-4 justify-center">
            <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
            <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  const { worker, active_policy, active_disruptions, this_week_stats, earnings_chart, recent_claims } = dashboard;
  const isProtected = !!active_policy;

  const handleSignOut = () => { clearWorker(); navigate('/login'); };

  const navLinks = [
    { icon: LayoutDashboard, label: 'Pulse', path: `/dashboard/${workerId}` },
    { icon: FileText, label: 'Policy', path: `/policy/${workerId}` },
    { icon: History, label: 'Claims', path: `/claims/${workerId}` },
    { icon: UserIcon, label: 'Profile', path: `/profile/${workerId}` },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ fontFamily: font.body }}>
      <AppBackground />

      {/* ── Floating pill navbar ── */}
      <nav style={{ position: 'fixed', top: 20, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{
          backdropFilter: scrolled ? 'blur(40px)' : 'none',
          background: scrolled ? 'rgba(12,17,23,0.80)' : 'transparent',
          border: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
          borderRadius: 40, padding: '6px 8px',
          display: 'flex', alignItems: 'center', pointerEvents: 'auto', gap: 6,
          transition: 'all 0.3s ease-in-out',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.35)' : 'none',
        }}>
          {/* Logo */}
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${BLUE}, #7AABFF)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px rgba(86,144,255,0.35)` }}>
              <Shield style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <BrandLogo size={18} className="hidden sm:block" />
          </button>

          {/* Nav pills */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = window.location.pathname === item.path;
              return (
                <button key={item.label} onClick={() => navigate(item.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: font.label, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: isActive ? BLUE : 'rgba(255,255,255,0.65)', background: isActive ? `rgba(86,144,255,0.12)` : 'rgba(255,255,255,0.06)', border: isActive ? `1px solid rgba(86,144,255,0.35)` : '1px solid transparent', borderRadius: 20, padding: '7px 13px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}}
                >
                  <item.icon style={{ width: 13, height: 13 }} />
                  {item.label}
                  {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: BLUE, boxShadow: `0 0 6px ${BLUE}` }} />}
                </button>
              );
            })}
          </div>

          {/* Bell + user */}
          <div className="flex items-center gap-2 pl-1">
            <button className="relative p-2 rounded-full transition-all" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
              <Bell className="w-4 h-4 text-white/60" />
              {active_disruptions?.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full border border-[#0C1117] animate-pulse" style={{ background: BLUE }} />}
            </button>

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 40, padding: '5px 12px 5px 5px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE}, #3D5FCC)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.display, fontWeight: 900, fontSize: 12, color: '#fff' }}>
                  {(worker?.name || 'W').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{worker?.name?.split(' ')[0] || 'Worker'}</p>
                  <p style={{ fontSize: 9, fontWeight: 900, color: BLUE, textTransform: 'uppercase' as const, letterSpacing: '0.05em', lineHeight: 1.2 }}>{(worker?.platform || '').replace(/_/g, ' ')}</p>
                </div>
                <ChevronDown style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.4)', transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-52 bg-[#161C27]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-[110]">
                    <button onClick={() => { navigate(`/profile/${workerId}`); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-white/65 hover:text-white">
                      <UserIcon className="w-4 h-4" /><span className="text-xs font-bold">Profile Settings</span>
                    </button>
                    <button onClick={() => { navigate(`/policy/${workerId}`); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-white/65 hover:text-white">
                      <CreditCard className="w-4 h-4" /><span className="text-xs font-bold">My Policy</span>
                    </button>
                    <div className="h-px bg-white/5 my-1 mx-2" />
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-xl transition-all text-red-400">
                      <LogOut className="w-4 h-4" /><span className="text-xs font-bold">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="pt-28 pb-20 px-6 lg:px-16 max-w-[1600px] mx-auto">

        {/* Welcome */}
        <section className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full flex items-center gap-2" style={{ background: `rgba(86,144,255,0.10)`, border: `1px solid rgba(86,144,255,0.30)` }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: BLUE }} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ fontFamily: font.label, color: BLUE }}>
                  {isProtected ? 'Active Coverage' : 'No Coverage'}
                </span>
              </div>
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">ID #{worker?.id}</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-4" style={{ fontFamily: font.display }}>
              Hello, <span style={{ color: BLUE }}>{(worker?.name || 'Worker').split(' ')[0]}</span>
            </h1>
            <div className="flex items-center gap-4 text-white/60">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-white/50" /><span className="text-sm font-semibold">{worker?.city} · {worker?.zone_name}</span></div>
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-white/50" /><span className="text-sm font-semibold uppercase">{worker?.shift_type} SHIFT</span></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={`p-1 rounded-[24px]`} style={{ background: isProtected ? `linear-gradient(135deg, rgba(34,197,94,0.3), transparent)` : 'rgba(239,68,68,0.2)' }}>
              <div className="bg-[#161C27]/80 backdrop-blur-3xl border border-white/10 rounded-[22px] px-8 py-5 flex items-center gap-5 min-w-[240px]">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isProtected ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-red-500/10 text-red-400'}`}>
                  {isProtected ? <Shield className="w-8 h-8" /> : <ShieldOff className="w-8 h-8" />}
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/55 uppercase tracking-[0.2em] mb-1" style={{ fontFamily: font.label }}>Coverage Status</p>
                  <p className={`text-xl font-black ${isProtected ? 'text-[#22C55E]' : 'text-red-400'}`}>{isProtected ? 'PROTECTED' : 'UNPROTECTED'}</p>
                  {!isProtected && <button onClick={() => navigate('/onboarding')} className="text-[10px] font-black mt-1 hover:underline" style={{ color: BLUE }}>ACTIVATE NOW →</button>}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Disruption alerts */}
        {active_disruptions?.length > 0 && (
          <div className="mb-10"><DisruptionAlert disruptions={active_disruptions} /></div>
        )}

        {/* Grid */}
        <section className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">

            {/* KPIs */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: 'Weekly Revenue', value: `₹${Math.floor(this_week_stats?.earnings || 0)}`, icon: CreditCard, color: BLUE, desc: 'This week earnings' },
                { label: 'Loss Recovery', value: `₹${Math.floor(this_week_stats?.coverage_used || 0)}`, icon: History, color: GREEN, desc: 'Paid out this week' },
                { label: 'Risk Score', value: `${Math.round((worker?.risk_score || 0) * 100)}%`, icon: Target, color: '#A78BFA', desc: `Tier: ${worker?.risk_tier || 'medium'}` },
              ].map((kpi, idx) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }}
                  className="bg-[#161C27]/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 hover:bg-[#161C27]/60 transition-all group overflow-hidden relative">
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

            {/* Earnings chart */}
            <div className="bg-[#161C27]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, rgba(86,144,255,0.25), transparent)` }} />
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: font.display }}>Earnings Integrity</h2>
                  <p className="text-sm text-white/55 mt-1">Expected vs actual earnings over the last 14 days</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#22C55E]" /><span className="text-[10px] font-black text-white/55 uppercase tracking-widest">Actual</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border" style={{ borderColor: BLUE }} /><span className="text-[10px] font-black text-white/55 uppercase tracking-widest">Expected</span></div>
                </div>
              </div>
              <div className="w-full"><EarningsChart data={earnings_chart} /></div>
            </div>

            {/* Zone stats + shift ring */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-white" style={{ fontFamily: font.display }}>
                  <MapPin className="w-5 h-5" style={{ color: BLUE }} /> Zone Stats
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Main Hub', value: worker?.dark_store_name || '—' },
                    { label: 'Zone Status', badge: <Badge variant="low" size="sm">NOMINAL</Badge> },
                    { label: 'Risk Score', value: `${Math.round((worker?.risk_score || 0) * 100)}%`, green: true },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-4 bg-white/[0.06] rounded-2xl border border-white/[0.08]">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{row.label}</span>
                      {row.badge || <span className={`text-sm font-black ${row.green ? 'text-[#22C55E]' : 'text-white'}`}>{row.value}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative w-40 h-40 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                    <circle cx="80" cy="80" r="70" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="110"
                      style={{ stroke: BLUE, strokeLinecap: 'round' as const, filter: `drop-shadow(0 0 8px ${BLUE})` }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white" style={{ fontFamily: font.display }}>
                      {(worker?.shift_type || 'Flex').charAt(0).toUpperCase() + (worker?.shift_type || 'flexible').slice(1)}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-black text-white/55 uppercase tracking-[0.2em]" style={{ fontFamily: font.label }}>Current Shift</p>
                <p className="text-sm font-bold text-white/70 mt-1">{(worker?.platform || '').replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {isProtected && (
              <WeeklyPremiumCard
                weeklyPremium={active_policy.weekly_premium}
                coverageUsed={this_week_stats.coverage_used}
                weeklyLimit={active_policy.weekly_coverage_limit}
                daysRemaining={active_policy.days_remaining}
                startDate={active_policy.start_date}
              />
            )}

            {/* Recent claims */}
            <div className="bg-[#161C27]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full" style={{ background: `rgba(86,144,255,0.05)` }} />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-white/80 uppercase tracking-widest" style={{ fontFamily: font.label }}>Recent Claims</h3>
                <span className="p-1 px-2 rounded-lg text-[9px] font-black" style={{ background: `rgba(86,144,255,0.10)`, border: `1px solid rgba(86,144,255,0.20)`, color: BLUE }}>LIVE</span>
              </div>
              {recent_claims?.length > 0 ? (
                <div className="space-y-5">
                  {recent_claims.map((claim: any) => (
                    <div key={claim.id} className="relative pl-6 pb-5 border-l border-white/10 last:pb-0">
                      <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full" style={{ background: BLUE, boxShadow: `0 0 8px ${BLUE}` }} />
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-white/85 uppercase tracking-tight">{claim.disruption_type?.replace(/_/g, ' ')}</span>
                        <Badge variant={claim.status} size="sm" className="scale-75 origin-right">{claim.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">{format(new Date(claim.claim_date), 'MMM dd, HH:mm')}</span>
                        <span className="text-xs font-black text-[#22C55E]">+₹{Math.floor(claim.payout_amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center">
                  <History className="w-10 h-10 mx-auto mb-3 text-white/20" />
                  <p className="text-sm font-bold uppercase tracking-widest text-white/40">No claims yet</p>
                </div>
              )}
              <button onClick={() => navigate(`/claims/${workerId}`)}
                className="w-full mt-6 py-3 rounded-2xl text-xs font-black tracking-[0.15em] uppercase text-white/65 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                View All Claims →
              </button>
            </div>

            {/* CTA card */}
            <div className="rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group" style={{ background: `linear-gradient(135deg, ${BLUE}, #3D5FCC)` }}>
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform">
                <Shield className="w-40 h-40" />
              </div>
              <h3 className="text-xl font-black leading-tight mb-3" style={{ fontFamily: font.display }}>Ready to secure your next shift?</h3>
              <p className="text-xs font-bold opacity-70 mb-5">Monitoring 14 disruption types in your sector 24/7.</p>
              <button onClick={() => navigate(`/policy/${workerId}`)} className="bg-white text-[#0C1117] px-5 py-2.5 rounded-2xl text-xs font-black tracking-widest uppercase hover:scale-105 transition-all">
                View Policy
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `rgba(86,144,255,0.10)` }}>
              <Shield className="w-3.5 h-3.5" style={{ color: BLUE }} />
            </div>
            <p className="text-xs font-black tracking-widest uppercase text-white/40" style={{ fontFamily: font.label }}>
              Axio · AI-Powered Parametric Insurance
            </p>
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
